import { z } from "zod";
import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validate.ts";
import { usersAdminController } from "./users-admin.controller.ts";
import {
  updateRoleSchema,
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
  validateParams(z.object({ id: z.uuid() })),
  validateBody(updateUserStatusSchema),
  usersAdminController.updateStatus,
);
usersAdminRouter.patch(
  "/:id/role",
  validateParams(z.object({ id: z.uuid() })),
  validateBody(updateRoleSchema),
  usersAdminController.updateRole,
);
