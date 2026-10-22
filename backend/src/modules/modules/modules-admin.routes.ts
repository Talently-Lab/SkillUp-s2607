import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateParams,
} from "../../shared/middlewares/validate.ts";
import { modulesAdminController } from "./modules-admin.controller.ts";
import {
  courseModuleLessonParamsSchema,
  courseModuleParamsSchema,
  courseParamsSchema,
  createLessonSchema,
  createModuleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "./modules.schemas.ts";

// Admin: CRUD modules and lessons within a course
export const modulesAdminRouter = Router({ mergeParams: true });
modulesAdminRouter.use(requireAuth, requireRole("admin"));
modulesAdminRouter.post(
  "/",
  validateParams(courseParamsSchema),
  validateBody(createModuleSchema),
  modulesAdminController.create,
);
modulesAdminRouter.put(
  "/:moduleId",
  validateParams(courseModuleParamsSchema),
  validateBody(updateModuleSchema),
  modulesAdminController.update,
);
modulesAdminRouter.delete(
  "/:moduleId",
  validateParams(courseModuleParamsSchema),
  modulesAdminController.remove,
);
modulesAdminRouter.post(
  "/:moduleId/lessons",
  validateParams(courseModuleParamsSchema),
  validateBody(createLessonSchema),
  modulesAdminController.createLesson,
);
modulesAdminRouter.put(
  "/:moduleId/lessons/:lessonId",
  validateParams(courseModuleLessonParamsSchema),
  validateBody(updateLessonSchema),
  modulesAdminController.updateLesson,
);
modulesAdminRouter.delete(
  "/:moduleId/lessons/:lessonId",
  validateParams(courseModuleLessonParamsSchema),
  modulesAdminController.removeLesson,
);
