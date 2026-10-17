import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { validateBody } from "../../shared/middlewares/validate.ts";
import { modulesController } from "./modules.controller.ts";
import {
  createLessonSchema,
  createModuleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "./modules.schemas.ts";

export const modulesRouter = Router({ mergeParams: true });

// ── Public: list modules with lessons for a course ────────────────────────────
modulesRouter.get("/", modulesController.list);

// ── Admin: CRUD modules ───────────────────────────────────────────────────────
modulesRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createModuleSchema),
  modulesController.create,
);
modulesRouter.put(
  "/:moduleId",
  requireAuth,
  requireRole("admin"),
  validateBody(updateModuleSchema),
  modulesController.update,
);
modulesRouter.delete(
  "/:moduleId",
  requireAuth,
  requireRole("admin"),
  modulesController.remove,
);

// ── Admin: CRUD lessons within a module ───────────────────────────────────────
modulesRouter.post(
  "/:moduleId/lessons",
  requireAuth,
  requireRole("admin"),
  validateBody(createLessonSchema),
  modulesController.createLesson,
);
modulesRouter.put(
  "/:moduleId/lessons/:lessonId",
  requireAuth,
  requireRole("admin"),
  validateBody(updateLessonSchema),
  modulesController.updateLesson,
);
modulesRouter.delete(
  "/:moduleId/lessons/:lessonId",
  requireAuth,
  requireRole("admin"),
  modulesController.removeLesson,
);
