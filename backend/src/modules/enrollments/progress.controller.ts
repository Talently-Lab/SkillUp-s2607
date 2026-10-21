import type { RequestHandler } from "express";
import { progressService } from "./progress.service.ts";

export const progressController = {
  complete: (async (req, res) => {
    const enrollmentId = req.params["enrollmentId"] as string;
    const lessonId = req.params["lessonId"] as string;
    const result = await progressService.completeLesson(
      req.auth!.userId,
      enrollmentId,
      lessonId,
    );
    res.status(201).json(result);
  }) satisfies RequestHandler,
  getProgress: (async (req, res) => {
    const enrollmentId = req.params["enrollmentId"] as string;
    const result = await progressService.getProgress(
      req.auth!.userId,
      enrollmentId,
    );
    res.json(result);
  }) satisfies RequestHandler,
};
