import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../../shared/errors/app-error.ts";
import { modulesService } from "./modules.service.ts";
import type {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "./modules.schemas.ts";

function validateUuid(id: string, field = "id") {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError({ [field]: ["Must be a valid UUID"] });
  }
}

export const modulesController = {
  // ── Modules ──────────────────────────────────────────────────────────────
  list: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    validateUuid(courseId, "courseId");
    const modules = await modulesService.listByCourse(courseId);
    res.json({ modules });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    validateUuid(courseId, "courseId");
    const m = await modulesService.createModule(
      courseId,
      req.body as CreateModuleInput,
    );
    res.status(201).json({ module: m });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
    validateUuid(courseId, "courseId");
    validateUuid(moduleId, "moduleId");
    const m = await modulesService.updateModule(
      courseId,
      moduleId,
      req.body as UpdateModuleInput,
    );
    res.json({ module: m });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
    validateUuid(courseId, "courseId");
    validateUuid(moduleId, "moduleId");
    await modulesService.deleteModule(courseId, moduleId);
    res.status(204).end();
  }) satisfies RequestHandler,

  // ── Lessons ───────────────────────────────────────────────────────────────
  createLesson: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
    validateUuid(courseId, "courseId");
    validateUuid(moduleId, "moduleId");
    const l = await modulesService.createLesson(
      courseId,
      moduleId,
      req.body as CreateLessonInput,
    );
    res.status(201).json({ lesson: l });
  }) satisfies RequestHandler,

  updateLesson: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
    const lessonId = req.params["lessonId"] as string;
    validateUuid(courseId, "courseId");
    validateUuid(moduleId, "moduleId");
    validateUuid(lessonId, "lessonId");
    const l = await modulesService.updateLesson(
      courseId,
      moduleId,
      lessonId,
      req.body as UpdateLessonInput,
    );
    res.json({ lesson: l });
  }) satisfies RequestHandler,

  removeLesson: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
    const lessonId = req.params["lessonId"] as string;
    validateUuid(courseId, "courseId");
    validateUuid(moduleId, "moduleId");
    validateUuid(lessonId, "lessonId");
    await modulesService.deleteLesson(courseId, moduleId, lessonId);
    res.status(204).end();
  }) satisfies RequestHandler,
};
