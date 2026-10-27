import { and, eq } from "drizzle-orm";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { runInTransaction } from "../../db/client.ts";
import { courses, lessons, modules } from "../../db/schema/index.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { progressRepository } from "../progress/progress.repository.ts";
import { modulesRepository } from "../modules/modules.repository.ts";
import { teacherRepository } from "./teacher.repository.ts";
import type {
  CreateTeacherLessonInput,
  CreateTeacherModuleInput,
  UpdateTeacherLessonInput,
  UpdateTeacherModuleInput,
} from "./teacher.schemas.ts";
import type { DbOrTx } from "../../db/client.ts";

/**
 * Keeps the course's lessonsCount and every enrollment's progress in sync
 * after a lesson is created or deleted. Must run inside a transaction.
 */
async function syncCourseLessons(courseId: string, tx: DbOrTx) {
  const total = await modulesRepository.countLessonsByCourse(courseId, tx);
  await coursesRepository.updateLessonsCount(courseId, total, tx);
  await progressRepository.recalcCourseProgress(courseId, tx);
}

export const teacherService = {
  // ── Courses ───────────────────────────────────────────────────────────────

  async listCourses(instructorId: string) {
    return teacherRepository.findCoursesByInstructor(instructorId);
  },

  // ── Modules ───────────────────────────────────────────────────────────────

  async listModules(courseId: string, instructorId: string) {
    const course = await teacherRepository.findCourseByInstructor(
      courseId,
      instructorId,
    );
    if (!course) throw new NotFoundError("Course not found");
    return teacherRepository.findModulesByCourse(courseId);
  },

  async createModule(
    courseId: string,
    instructorId: string,
    input: CreateTeacherModuleInput,
  ) {
    const course = await teacherRepository.findCourseByInstructor(
      courseId,
      instructorId,
    );
    if (!course)
      throw new ForbiddenError(
        "FORBIDDEN",
        "You do not own this course or it does not exist",
      );
    try {
      return await modulesRepository.createModule({ ...input, courseId });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "POSITION_TAKEN",
          "A module with that position already exists in this course",
        );
      throw err;
    }
  },

  async updateModule(
    moduleId: string,
    instructorId: string,
    input: UpdateTeacherModuleInput,
  ) {
    // Ownership check and update run inside a single transaction so that a
    // concurrent admin reassignment of instructorId cannot slip between them.
    // isUniqueViolation wraps runInTransaction from outside so the violation
    // error propagates cleanly (Postgres aborts the tx on constraint errors;
    // catching inside the callback would leave it in an aborted state).
    try {
      return await runInTransaction(async (tx) => {
        // Re-verify ownership inside the transaction to close the TOCTOU window.
        const rows = await tx
          .select({ id: modules.id })
          .from(modules)
          .innerJoin(
            courses,
            and(
              eq(modules.courseId, courses.id),
              eq(courses.instructorId, instructorId),
            ),
          )
          .where(eq(modules.id, moduleId))
          .limit(1);
        if (rows.length === 0) throw new NotFoundError("Module not found");

        const [updated] = await tx
          .update(modules)
          .set(input)
          .where(eq(modules.id, moduleId))
          .returning();
        if (!updated) throw new NotFoundError("Module not found");
        return updated;
      });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "POSITION_TAKEN",
          "A module with that position already exists in this course",
        );
      throw err;
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
      await coursesRepository.lockForUpdate(courseId, tx);
      const removed = await modulesRepository.deleteModule(moduleId, tx);
      if (!removed) throw new NotFoundError("Module not found");
      await syncCourseLessons(courseId, tx);
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
    if (!mod)
      throw new ForbiddenError(
        "FORBIDDEN",
        "You do not own this module or it does not exist",
      );
    const courseId = mod.courseId;
    // isUniqueViolation wraps runInTransaction from outside so the violation
    // error propagates cleanly (Postgres aborts the tx on constraint errors;
    // catching inside the callback would leave it in an aborted state).
    try {
      return await runInTransaction(async (tx) => {
        await coursesRepository.lockForUpdate(courseId, tx);
        const lesson = await modulesRepository.createLesson(
          { ...input, moduleId },
          tx,
        );
        await syncCourseLessons(courseId, tx);
        return lesson;
      });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "POSITION_TAKEN",
          "A lesson with that position already exists in this module",
        );
      throw err;
    }
  },

  async updateLesson(
    lessonId: string,
    instructorId: string,
    input: UpdateTeacherLessonInput,
  ) {
    // Ownership check and update run inside a single transaction so that a
    // concurrent admin reassignment of instructorId cannot slip between them.
    // isUniqueViolation wraps runInTransaction from outside so the violation
    // error propagates cleanly (Postgres aborts the tx on constraint errors;
    // catching inside the callback would leave it in an aborted state).
    try {
      return await runInTransaction(async (tx) => {
        // Re-verify ownership inside the transaction to close the TOCTOU window.
        const rows = await tx
          .select({ id: lessons.id })
          .from(lessons)
          .innerJoin(modules, eq(lessons.moduleId, modules.id))
          .innerJoin(
            courses,
            and(
              eq(modules.courseId, courses.id),
              eq(courses.instructorId, instructorId),
            ),
          )
          .where(eq(lessons.id, lessonId))
          .limit(1);
        if (rows.length === 0) throw new NotFoundError("Lesson not found");

        const [updated] = await tx
          .update(lessons)
          .set(input)
          .where(eq(lessons.id, lessonId))
          .returning();
        if (!updated) throw new NotFoundError("Lesson not found");
        return updated;
      });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "POSITION_TAKEN",
          "A lesson with that position already exists in this module",
        );
      throw err;
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
      await coursesRepository.lockForUpdate(courseId, tx);
      const removed = await modulesRepository.deleteLesson(lessonId, tx);
      if (!removed) throw new NotFoundError("Lesson not found");
      // ON DELETE CASCADE handles lesson_progress rows; recompute enrollment progress.
      await syncCourseLessons(courseId, tx);
    });
  },
};
