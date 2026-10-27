import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { runInTransaction } from "../../db/client.ts";
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
    const existing = await teacherRepository.findModuleOwnedByTeacher(
      moduleId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Module not found");
    try {
      const updated = await modulesRepository.updateModule(moduleId, input);
      if (!updated) throw new NotFoundError("Module not found");
      return updated;
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
    const existing = await teacherRepository.findLessonOwnedByTeacher(
      lessonId,
      instructorId,
    );
    if (!existing) throw new NotFoundError("Lesson not found");
    try {
      const updated = await modulesRepository.updateLesson(lessonId, input);
      if (!updated) throw new NotFoundError("Lesson not found");
      return updated;
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
