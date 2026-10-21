import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { modulesRepository } from "./modules.repository.ts";
import type {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "./modules.schemas.ts";

export const modulesService = {
  // ── Modules ──────────────────────────────────────────────────────────────
  async listByCourse(courseId: string) {
    // Public catalog: only modules of published courses are exposed
    const course = await coursesRepository.findPublishedById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return modulesRepository.findByCourse(courseId);
  },
  async getModule(moduleId: string) {
    const m = await modulesRepository.findById(moduleId);
    if (!m) throw new NotFoundError("Module not found");
    return m;
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
  },
  // ── Lessons ───────────────────────────────────────────────────────────────
  async createLesson(
    courseId: string,
    moduleId: string,
    input: CreateLessonInput,
  ) {
    const m = await modulesRepository.findModuleInCourse(courseId, moduleId);
    if (!m) throw new NotFoundError("Module not found");
    try {
      return await modulesRepository.createLesson({ ...input, moduleId });
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
    const removed = await modulesRepository.deleteLesson(lessonId);
    if (!removed) throw new NotFoundError("Lesson not found");
  },
};
