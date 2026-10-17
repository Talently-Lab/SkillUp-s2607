import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { progressController } from "./progress.controller.ts";

export const progressRouter = Router({ mergeParams: true });

progressRouter.use(requireAuth, requireRole("student"));

// GET  /enrollments/:enrollmentId/progress
progressRouter.get("/", progressController.getProgress);

// POST /enrollments/:enrollmentId/lessons/:lessonId/complete
progressRouter.post("/lessons/:lessonId/complete", progressController.complete);
