import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { runInTransaction } from "../../db/client.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { enrollmentsRepository } from "../enrollments/enrollments.repository.ts";
import { progressRepository } from "../progress/progress.repository.ts";
import { modulesRepository } from "./modules.repository.ts";
import {
  FREE_PREVIEW_LESSONS,
  type CreateLessonInput,
  type CreateModuleInput,
  type UpdateLessonInput,
  type UpdateModuleInput,
} from "./modules.schemas.ts";
import type { AccessTokenClaims } from "../../shared/security/jwt.ts";
import type { DbOrTx } from "../../db/client.ts";

/** Keeps the course's lessonsCount and every enrollment's progress in line with its real lessons */
async function syncCourseLessons(courseId: string, tx: DbOrTx) {
  const total = await modulesRepository.countLessonsByCourse(courseId, tx);
  await coursesRepository.updateLessonsCount(courseId, total, tx);
  await progressRepository.recalcCourseProgress(courseId, tx);
}

export const modulesService = {
  // ── Modules ──────────────────────────────────────────────────────────────
  async listByCourse(courseId: string, user?: AccessTokenClaims) {
    // Public catalog: only modules of published courses are exposed (also for admin)
    const course = await coursesRepository.findPublishedById(courseId);
    if (!course) throw new NotFoundError("Course not found");

    const rawModules = await modulesRepository.findByCourse(courseId);

    // Decide if this user sees all videos unlocked:
    //   - admin always sees everything
    //   - a student (or any role) with an active/completed enrollment in this course
    let seeAll = false;
    if (user?.role === "admin") {
      seeAll = true;
    } else if (user) {
      const enrollment = await enrollmentsRepository.findByUserAndCourse(
        user.userId,
        courseId,
      );
      seeAll = !!enrollment;
    }

    // Apply locked / videoUrl masking.
    // Iterate lessons in global order (modules already asc by position,
    // lessons already asc by position inside each module) to identify the
    // FREE_PREVIEW_LESSONS free slots.
    let globalIndex = 0;
    return rawModules.map((mod) => ({
      ...mod,
      lessons: (mod.lessons ?? []).map((lesson) => {
        const isPreview = globalIndex < FREE_PREVIEW_LESSONS;
        globalIndex++;
        const locked = !seeAll && !isPreview;
        return {
          ...lesson,
          videoUrl: locked ? null : lesson.videoUrl,
          locked,
        };
      }),
    }));
  },
  async createModule(courseId: string, input: CreateModuleInput) {
    // Admin may manage draft courses too
    const course = await coursesRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
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
    courseId: string,
    moduleId: string,
    input: UpdateModuleInput,
  ) {
    const existing = await modulesRepository.findModuleInCourse(
      courseId,
      moduleId,
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
  async deleteModule(courseId: string, moduleId: string) {
    const existing = await modulesRepository.findModuleInCourse(
      courseId,
      moduleId,
    );
    if (!existing) throw new NotFoundError("Module not found");
    // Validations above run outside the tx (read-only); the mutation is atomic.
    await runInTransaction(async (tx) => {
      // Serialise concurrent mutations of the same course.
      await coursesRepository.lockForUpdate(courseId, tx);
      const removed = await modulesRepository.deleteModule(moduleId, tx);
      if (!removed) throw new NotFoundError("Module not found");
      // Cascades to lessons + lesson_progress; recompute affected enrollments.
      await syncCourseLessons(courseId, tx);
    });
  },
  // ── Lessons ───────────────────────────────────────────────────────────────
  async createLesson(
    courseId: string,
    moduleId: string,
    input: CreateLessonInput,
  ) {
    const m = await modulesRepository.findModuleInCourse(courseId, moduleId);
    if (!m) throw new NotFoundError("Module not found");
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
        // A new lesson lowers every enrollment's percent (and reopens completed ones).
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
    courseId: string,
    moduleId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ) {
    const m = await modulesRepository.findModuleInCourse(courseId, moduleId);
    if (!m) throw new NotFoundError("Module not found");
    const existing = await modulesRepository.findLessonInModule(
      moduleId,
      lessonId,
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
  async deleteLesson(courseId: string, moduleId: string, lessonId: string) {
    const m = await modulesRepository.findModuleInCourse(courseId, moduleId);
    if (!m) throw new NotFoundError("Module not found");
    const existing = await modulesRepository.findLessonInModule(
      moduleId,
      lessonId,
    );
    if (!existing) throw new NotFoundError("Lesson not found");
    await runInTransaction(async (tx) => {
      await coursesRepository.lockForUpdate(courseId, tx);
      const removed = await modulesRepository.deleteLesson(lessonId, tx);
      if (!removed) throw new NotFoundError("Lesson not found");
      // Deleting a lesson cascades to its progress rows; recompute affected enrollments.
      await syncCourseLessons(courseId, tx);
    });
  },
};
