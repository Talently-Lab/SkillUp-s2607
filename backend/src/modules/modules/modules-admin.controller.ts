import type { RequestHandler } from "express";
import { modulesService } from "./modules.service.ts";
import type {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "./modules.schemas.ts";

export const MODULES_ADMIN_BASE_PATH =
  "/api/v1/admin/courses/:courseId/modules";

export const modulesAdminController = {
  // ── Modules ──────────────────────────────────────────────────────────────
  create: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const m = await modulesService.createModule(
      courseId,
      req.body as CreateModuleInput,
    );
    res.status(201).json({ module: m });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
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
    await modulesService.deleteModule(courseId, moduleId);
    res.status(204).end();
  }) satisfies RequestHandler,

  // ── Lessons ───────────────────────────────────────────────────────────────
  createLesson: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const moduleId = req.params["moduleId"] as string;
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
    await modulesService.deleteLesson(courseId, moduleId, lessonId);
    res.status(204).end();
  }) satisfies RequestHandler,
};
