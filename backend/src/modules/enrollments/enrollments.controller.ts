import type { RequestHandler } from "express";
import { enrollmentsService } from "./enrollments.service.ts";
import type { EnrollInput } from "./enrollments.schemas.ts";

export const ENROLLMENTS_BASE_PATH = "/api/v1/enrollments";

export const enrollmentsController = {
  enroll: (async (req, res) => {
    const enrollment = await enrollmentsService.enroll(
      req.auth!.userId,
      req.body as EnrollInput,
    );
    res.status(201).json({ enrollment });
  }) satisfies RequestHandler,

  myEnrollments: (async (req, res) => {
    const enrollments = await enrollmentsService.getMyEnrollments(
      req.auth!.userId,
    );
    res.json({ enrollments });
  }) satisfies RequestHandler,
};
