import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { validateQuery } from "../../shared/middlewares/validate.ts";
import { activityAdminController } from "./activity-admin.controller.ts";
import { activityQuerySchema } from "./activity.schemas.ts";

export const activityAdminRouter = Router();

// Audit log of the teachers' changes: admin only
activityAdminRouter.use(requireAuth, requireRole("admin"));

activityAdminRouter.get(
  "/",
  validateQuery(activityQuerySchema),
  activityAdminController.list,
);
