import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../../shared/errors/db-errors.ts";
import { runInTransaction, type DbOrTx } from "../../db/client.ts";
import { activityRepository } from "../activity/activity.repository.ts";
import {
  createdChanges,
  deletedChanges,
  diffChanges,
} from "../activity/activity.service.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { courseAction, publishedAtFor } from "../courses/courses.service.ts";
import { modulesRepository } from "../modules/modules.repository.ts";
import {
  syncCourseLessons,
  syncCourseTotals,
} from "../modules/modules.service.ts";
import { teacherRepository } from "./teacher.repository.ts";
import type {
  CreateTeacherLessonInput,
  CreateTeacherModuleInput,
  ReorderInput,
  TeacherPageQuery,
  UpdateTeacherCourseInput,
  UpdateTeacherLessonInput,
  UpdateTeacherModuleInput,
} from "./teacher.schemas.ts";

/**
 * Every mutation runs in a transaction that starts with this lock: it
 * serialises changes to the same course and re-checks ownership, so an admin
 * reassigning the course between the first read and the write can't let the
 * previous teacher through.
 */
async function lockOwnedCourse(
  courseId: string,
  instructorId: string,
  tx: DbOrTx,
  notFoundMessage: string,
) {
  const owned = await teacherRepository.lockOwnedCourse(
    courseId,
    instructorId,
    tx,
  );
  if (!owned) throw new NotFoundError(notFoundMessage);
}

/**
 * Catches unique violations from outside runInTransaction: Postgres aborts the
 * tx on constraint errors, so catching inside the callback would leave it in
 * an aborted state.
 */
function rethrowPositionTaken(err: unknown, message: string): never {
  if (isUniqueViolation(err))
    throw new ConflictError("POSITION_TAKEN", message);
  throw err;
}

const MODULE_POSITION_TAKEN =
  "A module with that position already exists in this course";
const LESSON_POSITION_TAKEN =
  "A lesson with that position already exists in this module";

/** `ids` must hold every current id exactly once (no duplicates is checked by the schema) */
function assertSameIds(current: string[], ids: string[], what: string) {
  const currentSet = new Set(current);
  if (ids.length !== current.length || !ids.every((id) => currentSet.has(id)))
    throw new BadRequestError(
      "INVALID_ORDER",
      `ids must contain every ${what} exactly once`,
    );
}

function paginated<T>(
  { data, total }: { data: T[]; total: number },
  { page, limit }: TeacherPageQuery,
) {
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const teacherService = {
  // ── Courses ───────────────────────────────────────────────────────────────

  async listCourses(instructorId: string, query: TeacherPageQuery) {
    const result = await coursesRepository.findManyByInstructor(
      instructorId,
      query,
    );
    return paginated(result, query);
  },

  async getCourse(courseId: string, instructorId: string) {
    const course = await coursesRepository.findByIdForInstructor(
      courseId,
      instructorId,
    );
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  /** Edits the course content and publishes/unpublishes it; logged for the admin */
  async updateCourse(
    courseId: string,
    instructorId: string,
    input: UpdateTeacherCourseInput,
  ) {
    try {
      return await runInTransaction(async (tx) => {
        await lockOwnedCourse(courseId, instructorId, tx, "Course not found");
        const current = (await coursesRepository.findById(courseId, tx))!;

        if (input.status === "published" && current.status !== "published") {
          const { total } = await modulesRepository.lessonTotalsByCourse(
            courseId,
            tx,
          );
          if (total === 0)
            throw new BadRequestError(
              "COURSE_EMPTY",
              "A course needs at least one lesson to be published",
            );
        }

        const changes = diffChanges(current, input);
        if (Object.keys(changes).length === 0) return current;

        const updated = (await coursesRepository.update(
          courseId,
          {
            ...input,
            publishedAt: publishedAtFor(input.status, current.status),
          },
          tx,
        ))!;
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: courseAction(changes),
            changes,
          },
          tx,
        );
        return updated;
      });
    } catch (err) {
      if (isForeignKeyViolation(err))
        throw new BadRequestError(
          "INVALID_REFERENCE",
          "categoryId does not exist",
        );
      throw err;
    }
  },

  async listEnrollments(
    courseId: string,
    instructorId: string,
    query: TeacherPageQuery,
  ) {
    await teacherService.getCourse(courseId, instructorId);
    const result = await teacherRepository.findEnrollmentsByCourse(
      courseId,
      query.limit,
      (query.page - 1) * query.limit,
    );
    return paginated(result, query);
  },

  // ── Modules ───────────────────────────────────────────────────────────────

  async listModules(courseId: string, instructorId: string) {
    await teacherService.getCourse(courseId, instructorId);
    return modulesRepository.findByCourse(courseId);
  },

  async createModule(
    courseId: string,
    instructorId: string,
    input: CreateTeacherModuleInput,
  ) {
    try {
      return await runInTransaction(async (tx) => {
        await lockOwnedCourse(courseId, instructorId, tx, "Course not found");
        const module = await modulesRepository.createModule(
          { ...input, courseId },
          tx,
        );
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "module.created",
            entityId: module.id,
            changes: createdChanges(input),
          },
          tx,
        );
        return module;
      });
    } catch (err) {
      rethrowPositionTaken(err, MODULE_POSITION_TAKEN);
    }
  },

  async updateModule(
    moduleId: string,
    instructorId: string,
    input: UpdateTeacherModuleInput,
  ) {
    const existing = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Module not found");
    const courseId = existing.courseId;
    try {
      return await runInTransaction(async (tx) => {
        await lockOwnedCourse(courseId, instructorId, tx, "Module not found");
        const before = await modulesRepository.findModuleById(moduleId, tx);
        if (!before) throw new NotFoundError("Module not found");
        const changes = diffChanges(before, input);
        if (Object.keys(changes).length === 0) return before;

        const updated = (await modulesRepository.updateModule(
          moduleId,
          input,
          tx,
        ))!;
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "module.updated",
            entityId: moduleId,
            changes,
          },
          tx,
        );
        return updated;
      });
    } catch (err) {
      rethrowPositionTaken(err, MODULE_POSITION_TAKEN);
    }
  },

  async deleteModule(moduleId: string, instructorId: string) {
    const existing = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Module not found");
    const courseId = existing.courseId;
    await runInTransaction(async (tx) => {
      await lockOwnedCourse(courseId, instructorId, tx, "Module not found");
      const before = await modulesRepository.findModuleById(moduleId, tx);
      if (!before) throw new NotFoundError("Module not found");
      await modulesRepository.deleteModule(moduleId, tx);
      // Cascades to lessons + lesson_progress; recompute affected enrollments.
      await syncCourseLessons(courseId, tx);
      await activityRepository.log(
        {
          courseId,
          actorId: instructorId,
          action: "module.deleted",
          entityId: moduleId,
          changes: deletedChanges({
            title: before.title,
            position: before.position,
          }),
        },
        tx,
      );
    });
  },

  /** Sets the order of all the course's modules in one atomic step */
  async reorderModules(
    courseId: string,
    instructorId: string,
    { ids }: ReorderInput,
  ) {
    return runInTransaction(async (tx) => {
      await lockOwnedCourse(courseId, instructorId, tx, "Course not found");
      const current = await teacherRepository.findModuleIds(courseId, tx);
      assertSameIds(current, ids, "module of the course");
      if (current.join() !== ids.join()) {
        await teacherRepository.setModulePositions(ids, tx);
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "modules.reordered",
            changes: { order: { from: current, to: ids } },
          },
          tx,
        );
      }
      return modulesRepository.findByCourse(courseId, tx);
    });
  },

  // ── Lessons ───────────────────────────────────────────────────────────────

  async listLessons(moduleId: string, instructorId: string) {
    const existing = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Module not found");
    return teacherRepository.findLessonsByModule(moduleId);
  },

  async createLesson(
    moduleId: string,
    instructorId: string,
    input: CreateTeacherLessonInput,
  ) {
    const mod = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!mod) throw new NotFoundError("Module not found");
    const courseId = mod.courseId;
    try {
      return await runInTransaction(async (tx) => {
        await lockOwnedCourse(courseId, instructorId, tx, "Module not found");
        const lesson = await modulesRepository.createLesson(
          { ...input, moduleId },
          tx,
        );
        // A new lesson lowers every enrollment's percent (and reopens completed ones).
        await syncCourseLessons(courseId, tx);
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "lesson.created",
            entityId: lesson.id,
            changes: createdChanges({ moduleId, ...input }),
          },
          tx,
        );
        return lesson;
      });
    } catch (err) {
      rethrowPositionTaken(err, LESSON_POSITION_TAKEN);
    }
  },

  async updateLesson(
    lessonId: string,
    instructorId: string,
    input: UpdateTeacherLessonInput,
  ) {
    const existing = await teacherRepository.findLessonOwnedByTeacher(
      lessonId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Lesson not found");
    const courseId = existing.courseId;
    try {
      return await runInTransaction(async (tx) => {
        await lockOwnedCourse(courseId, instructorId, tx, "Lesson not found");
        const before = await modulesRepository.findLessonById(lessonId, tx);
        if (!before) throw new NotFoundError("Lesson not found");
        const changes = diffChanges(before, input);
        if (Object.keys(changes).length === 0) return before;

        const updated = (await modulesRepository.updateLesson(
          lessonId,
          input,
          tx,
        ))!;
        // The course's durationMinutes is the sum of its lessons
        if (changes["durationSeconds"]) await syncCourseTotals(courseId, tx);
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "lesson.updated",
            entityId: lessonId,
            changes,
          },
          tx,
        );
        return updated;
      });
    } catch (err) {
      rethrowPositionTaken(err, LESSON_POSITION_TAKEN);
    }
  },

  async deleteLesson(lessonId: string, instructorId: string) {
    const existing = await teacherRepository.findLessonOwnedByTeacher(
      lessonId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Lesson not found");
    const courseId = existing.courseId;
    await runInTransaction(async (tx) => {
      await lockOwnedCourse(courseId, instructorId, tx, "Lesson not found");
      const before = await modulesRepository.findLessonById(lessonId, tx);
      if (!before) throw new NotFoundError("Lesson not found");
      await modulesRepository.deleteLesson(lessonId, tx);
      // Deleting a lesson cascades to its progress rows; recompute affected enrollments.
      await syncCourseLessons(courseId, tx);
      await activityRepository.log(
        {
          courseId,
          actorId: instructorId,
          action: "lesson.deleted",
          entityId: lessonId,
          changes: deletedChanges({
            moduleId: before.moduleId,
            title: before.title,
            position: before.position,
          }),
        },
        tx,
      );
    });
  },

  /** Sets the order of all the module's lessons in one atomic step */
  async reorderLessons(
    moduleId: string,
    instructorId: string,
    { ids }: ReorderInput,
  ) {
    const mod = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!mod) throw new NotFoundError("Module not found");
    const courseId = mod.courseId;
    return runInTransaction(async (tx) => {
      await lockOwnedCourse(courseId, instructorId, tx, "Module not found");
      const current = await teacherRepository.findLessonIds(moduleId, tx);
      assertSameIds(current, ids, "lesson of the module");
      if (current.join() !== ids.join()) {
        await teacherRepository.setLessonPositions(ids, tx);
        await activityRepository.log(
          {
            courseId,
            actorId: instructorId,
            action: "lessons.reordered",
            entityId: moduleId,
            changes: { order: { from: current, to: ids } },
          },
          tx,
        );
      }
      return teacherRepository.findLessonsByModule(moduleId, tx);
    });
  },
};
