import { z } from "zod";
import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { validateParams } from "../../shared/middlewares/validate.ts";
import { progressController } from "./progress.controller.ts";

export const progressRouter = Router({ mergeParams: true });
progressRouter.use(requireAuth, requireRole("student"));
// GET  /enrollments/:enrollmentId/progress
progressRouter.get(
  "/",
  validateParams(z.object({ enrollmentId: z.uuid() })),
  progressController.getProgress,
);
// POST /enrollments/:enrollmentId/progress/lessons/:lessonId/complete
progressRouter.post(
  "/lessons/:lessonId/complete",
  validateParams(z.object({ enrollmentId: z.uuid(), lessonId: z.uuid() })),
  progressController.complete,
);
