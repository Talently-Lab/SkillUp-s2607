import type { RequestHandler } from "express";
import { usersAdminService } from "./users-admin.service.ts";
import type {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UsersQuery,
} from "./users-admin.schemas.ts";

export const USERS_ADMIN_BASE_PATH = "/api/v1/admin/users";

export const usersAdminController = {
  list: (async (req, res) => {
    const result = await usersAdminService.list(req.parsedQuery as UsersQuery);
    res.json(result);
  }) satisfies RequestHandler,

  updateStatus: (async (req, res) => {
    const user = await usersAdminService.updateStatus(
      req.auth!.userId,
      req.params["id"] as string,
      req.body as UpdateUserStatusInput,
    );
    res.json({ user });
  }) satisfies RequestHandler,

  updateRole: (async (req, res) => {
    const user = await usersAdminService.updateRole(
      req.auth!.userId,
      req.params["id"] as string,
      req.body as UpdateUserRoleInput,
    );
    res.json({ user });
  }) satisfies RequestHandler,
};
