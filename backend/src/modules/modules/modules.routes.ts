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

// Public: list modules (with lessons) for a published course
export const modulesRouter = Router({ mergeParams: true });
modulesRouter.get("/", modulesController.list);

// Admin: CRUD modules and lessons within a course
export const modulesAdminRouter = Router({ mergeParams: true });
modulesAdminRouter.use(requireAuth, requireRole("admin"));
modulesAdminRouter.post(
  "/",
  validateBody(createModuleSchema),
  modulesController.create,
);
modulesAdminRouter.put(
  "/:moduleId",
  validateBody(updateModuleSchema),
  modulesController.update,
);
modulesAdminRouter.delete("/:moduleId", modulesController.remove);
modulesAdminRouter.post(
  "/:moduleId/lessons",
  validateBody(createLessonSchema),
  modulesController.createLesson,
);
modulesAdminRouter.put(
  "/:moduleId/lessons/:lessonId",
  validateBody(updateLessonSchema),
  modulesController.updateLesson,
);
modulesAdminRouter.delete(
  "/:moduleId/lessons/:lessonId",
  modulesController.removeLesson,
);
