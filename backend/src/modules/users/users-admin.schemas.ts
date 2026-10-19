import { z } from "zod";
import "zod-openapi";

export const usersQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    // Optional filters for the admin dashboard
    role: z.enum(["student", "teacher", "admin"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    search: z.string().trim().max(100).optional(),
  })
  .meta({ id: "UsersQuery" });

export type UsersQuery = z.infer<typeof usersQuerySchema>;

export const updateUserStatusSchema = z
  .object({
    status: z.enum(["active", "suspended"], {
      error: 'status must be "active" or "suspended"',
    }),
  })
  .meta({ id: "UpdateUserStatusRequest" });

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
