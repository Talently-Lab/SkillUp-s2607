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

export const MODULES_BASE_PATH = "/api/v1/courses/:courseId/modules";

function validateUuid(id: string, field = "id") {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError({ [field]: ["Must be a valid UUID"] });
  }
}

export const modulesController = {
  // ── Modules ──────────────────────────────────────────────────────────────

  list: (async (req, res) => {
    validateUuid(req.params["courseId"] as string, "courseId");
    const modules = await modulesService.listByCourse(
      req.params["courseId"] as string,
    );
    res.json({ modules });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    validateUuid(req.params["courseId"] as string, "courseId");
    const m = await modulesService.createModule(
      req.params["courseId"] as string,
      req.body as CreateModuleInput,
    );
    res.status(201).json({ module: m });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    validateUuid(req.params["moduleId"] as string, "moduleId");
    const m = await modulesService.updateModule(
      req.params["moduleId"] as string,
      req.body as UpdateModuleInput,
    );
    res.json({ module: m });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    validateUuid(req.params["moduleId"] as string, "moduleId");
    await modulesService.deleteModule(req.params["moduleId"] as string);
    res.status(204).end();
  }) satisfies RequestHandler,

  // ── Lessons ───────────────────────────────────────────────────────────────

  createLesson: (async (req, res) => {
    validateUuid(req.params["moduleId"] as string, "moduleId");
    const l = await modulesService.createLesson(
      req.params["moduleId"] as string,
      req.body as CreateLessonInput,
    );
    res.status(201).json({ lesson: l });
  }) satisfies RequestHandler,

  updateLesson: (async (req, res) => {
    validateUuid(req.params["lessonId"] as string, "lessonId");
    const l = await modulesService.updateLesson(
      req.params["lessonId"] as string,
      req.body as UpdateLessonInput,
    );
    res.json({ lesson: l });
  }) satisfies RequestHandler,

  removeLesson: (async (req, res) => {
    validateUuid(req.params["lessonId"] as string, "lessonId");
    await modulesService.deleteLesson(req.params["lessonId"] as string);
    res.status(204).end();
  }) satisfies RequestHandler,
};
