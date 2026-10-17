import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../../shared/errors/app-error.ts";
import { progressService } from "./progress.service.ts";

function validateUuid(id: string, field = "id") {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError({ [field]: ["Must be a valid UUID"] });
  }
}

export const progressController = {
  complete: (async (req, res) => {
    const enrollmentId = req.params["enrollmentId"] as string;
    const lessonId = req.params["lessonId"] as string;
    validateUuid(enrollmentId, "enrollmentId");
    validateUuid(lessonId, "lessonId");
    const result = await progressService.completeLesson(
      req.auth!.userId,
      enrollmentId,
      lessonId,
    );
    res.status(201).json(result);
  }) satisfies RequestHandler,

  getProgress: (async (req, res) => {
    const enrollmentId = req.params["enrollmentId"] as string;
    validateUuid(enrollmentId, "enrollmentId");
    const result = await progressService.getProgress(
      req.auth!.userId,
      enrollmentId,
    );
    res.json(result);
  }) satisfies RequestHandler,
};
