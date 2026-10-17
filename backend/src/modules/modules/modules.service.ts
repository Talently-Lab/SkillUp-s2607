import { NotFoundError } from "../../shared/errors/app-error.ts";
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
    // Verify course exists
    const course = await coursesRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return modulesRepository.findByCourse(courseId);
  },

  async getModule(moduleId: string) {
    const m = await modulesRepository.findById(moduleId);
    if (!m) throw new NotFoundError("Module not found");
    return m;
  },

  async createModule(courseId: string, input: CreateModuleInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return modulesRepository.createModule({ ...input, courseId });
  },

  async updateModule(moduleId: string, input: UpdateModuleInput) {
    const existing = await modulesRepository.findById(moduleId);
    if (!existing) throw new NotFoundError("Module not found");
    const updated = await modulesRepository.updateModule(moduleId, input);
    if (!updated) throw new NotFoundError("Module not found");
    return updated;
  },

  async deleteModule(moduleId: string) {
    const removed = await modulesRepository.deleteModule(moduleId);
    if (!removed) throw new NotFoundError("Module not found");
  },

  // ── Lessons ───────────────────────────────────────────────────────────────

  async createLesson(moduleId: string, input: CreateLessonInput) {
    const m = await modulesRepository.findById(moduleId);
    if (!m) throw new NotFoundError("Module not found");
    return modulesRepository.createLesson({ ...input, moduleId });
  },

  async updateLesson(lessonId: string, input: UpdateLessonInput) {
    const existing = await modulesRepository.findLessonById(lessonId);
    if (!existing) throw new NotFoundError("Lesson not found");
    const updated = await modulesRepository.updateLesson(lessonId, input);
    if (!updated) throw new NotFoundError("Lesson not found");
    return updated;
  },

  async deleteLesson(lessonId: string) {
    const removed = await modulesRepository.deleteLesson(lessonId);
    if (!removed) throw new NotFoundError("Lesson not found");
  },
};
