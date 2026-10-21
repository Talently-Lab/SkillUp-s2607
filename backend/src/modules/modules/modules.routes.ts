import { z } from "zod";
import { Router } from "express";
import {
  optionalAuth,
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateParams,
} from "../../shared/middlewares/validate.ts";
import { modulesController } from "./modules.controller.ts";
import {
  createLessonSchema,
  createModuleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "./modules.schemas.ts";

const courseParams = z.object({ courseId: z.uuid() });
const courseModuleParams = z.object({
  courseId: z.uuid(),
  moduleId: z.uuid(),
});
const courseModuleLessonParams = z.object({
  courseId: z.uuid(),
  moduleId: z.uuid(),
  lessonId: z.uuid(),
});

// Public: list modules (with lessons) for a published course
export const modulesRouter = Router({ mergeParams: true });
modulesRouter.get(
  "/",
  optionalAuth,
  validateParams(courseParams),
  modulesController.list,
);

// Admin: CRUD modules and lessons within a course
export const modulesAdminRouter = Router({ mergeParams: true });
modulesAdminRouter.use(requireAuth, requireRole("admin"));
modulesAdminRouter.post(
  "/",
  validateParams(courseParams),
  validateBody(createModuleSchema),
  modulesController.create,
);
modulesAdminRouter.put(
  "/:moduleId",
  validateParams(courseModuleParams),
  validateBody(updateModuleSchema),
  modulesController.update,
);
modulesAdminRouter.delete(
  "/:moduleId",
  validateParams(courseModuleParams),
  modulesController.remove,
);
modulesAdminRouter.post(
  "/:moduleId/lessons",
  validateParams(courseModuleParams),
  validateBody(createLessonSchema),
  modulesController.createLesson,
);
modulesAdminRouter.put(
  "/:moduleId/lessons/:lessonId",
  validateParams(courseModuleLessonParams),
  validateBody(updateLessonSchema),
  modulesController.updateLesson,
);
modulesAdminRouter.delete(
  "/:moduleId/lessons/:lessonId",
  validateParams(courseModuleLessonParams),
  modulesController.removeLesson,
);
