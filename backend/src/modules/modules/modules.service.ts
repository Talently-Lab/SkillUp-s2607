import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { enrollmentsRepository } from "../enrollments/enrollments.repository.ts";
import { progressRepository } from "../progress/progress.repository.ts";
import { modulesRepository } from "./modules.repository.ts";
import type {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "./modules.schemas.ts";
import type { AccessTokenClaims } from "../../shared/security/jwt.ts";

/** Lecciones desbloqueadas gratis para todos (contadas en orden global del curso) */
const FREE_PREVIEW_LESSONS = 2;

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
    const removed = await modulesRepository.deleteModule(moduleId);
    if (!removed) throw new NotFoundError("Module not found");
    // Deleting a module cascades to its lessons and their progress; recompute affected enrollments
    await progressRepository.recalcCourseProgress(courseId);
  },
  // ── Lessons ───────────────────────────────────────────────────────────────
  async createLesson(
    courseId: string,
    moduleId: string,
    input: CreateLessonInput,
  ) {
    const m = await modulesRepository.findModuleInCourse(courseId, moduleId);
    if (!m) throw new NotFoundError("Module not found");
    let lesson;
    try {
      lesson = await modulesRepository.createLesson({ ...input, moduleId });
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "POSITION_TAKEN",
          "A lesson with that position already exists in this module",
        );
      throw err;
    }
    // A new lesson lowers every enrollment's percent (and reopens completed ones)
    await progressRepository.recalcCourseProgress(courseId);
    return lesson;
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
    const removed = await modulesRepository.deleteLesson(lessonId);
    if (!removed) throw new NotFoundError("Lesson not found");
    // Deleting a lesson cascades to its progress rows; recompute affected enrollments
    await progressRepository.recalcCourseProgress(courseId);
  },
};
