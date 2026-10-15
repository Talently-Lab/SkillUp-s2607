import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../../shared/errors/app-error.ts";
import { usersAdminService } from "./users-admin.service.ts";
import type {
  UpdateUserStatusInput,
  UsersQuery,
} from "./users-admin.schemas.ts";

export const USERS_ADMIN_BASE_PATH = "/api/v1/admin/users";

function validateUuid(id: string) {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError({ id: ["Must be a valid UUID"] });
  }
}

export const usersAdminController = {
  list: (async (req, res) => {
    const result = await usersAdminService.list(req.parsedQuery as UsersQuery);
    res.json(result);
  }) satisfies RequestHandler,

  updateStatus: (async (req, res) => {
    const id = req.params["id"] as string;
    validateUuid(id);
    const user = await usersAdminService.updateStatus(
      id,
      req.body as UpdateUserStatusInput,
    );
    res.json({ user });
  }) satisfies RequestHandler,
};
