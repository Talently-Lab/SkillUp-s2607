import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { validateBody } from "../../shared/middlewares/validate.ts";
import { enrollmentsController } from "./enrollments.controller.ts";
import { enrollSchema } from "./enrollments.schemas.ts";

export const enrollmentsRouter = Router();

// All enrollment routes require authentication
enrollmentsRouter.use(requireAuth);

// Student routes
enrollmentsRouter.post(
  "/",
  requireRole("student"),
  validateBody(enrollSchema),
  enrollmentsController.enroll,
);
enrollmentsRouter.get(
  "/me",
  requireRole("student"),
  enrollmentsController.myEnrollments,
);
