import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateQuery,
} from "../../shared/middlewares/validate.ts";
import { usersAdminController } from "./users-admin.controller.ts";
import {
  updateUserStatusSchema,
  usersQuerySchema,
} from "./users-admin.schemas.ts";

export const usersAdminRouter = Router();

usersAdminRouter.use(requireAuth, requireRole("admin"));

usersAdminRouter.get(
  "/",
  validateQuery(usersQuerySchema),
  usersAdminController.list,
);
usersAdminRouter.patch(
  "/:id/status",
  validateBody(updateUserStatusSchema),
  usersAdminController.updateStatus,
);
