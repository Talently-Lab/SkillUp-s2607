import { eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { refreshTokens, users } from "../../db/schema/index.ts";
import {
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import { usersAdminRepository } from "./users-admin.repository.ts";
import type {
  UpdateUserStatusInput,
  UsersQuery,
} from "./users-admin.schemas.ts";

export const usersAdminService = {
  async list(query: UsersQuery) {
    const { data, total } = await usersAdminRepository.findMany(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  },

  async updateStatus(
    requesterId: string,
    targetId: string,
    { status }: UpdateUserStatusInput,
  ) {
    // Prevent an admin from suspending themselves
    if (requesterId === targetId && status === "suspended") {
      throw new ForbiddenError(
        "SELF_SUSPEND_FORBIDDEN",
        "You cannot suspend your own account",
      );
    }

    // Prevent suspending other admins
    const target = await db.query.users.findFirst({
      where: eq(users.id, targetId),
    });
    if (!target) throw new NotFoundError("User not found");
    if (target.role === "admin" && status === "suspended") {
      throw new ForbiddenError(
        "ADMIN_SUSPEND_FORBIDDEN",
        "Admin accounts cannot be suspended",
      );
    }

    // Use a transaction: both the status update and token revocation must succeed together
    const user = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({ status })
        .where(eq(users.id, targetId))
        .returning({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        });

      if (!updated) throw new NotFoundError("User not found");

      if (status === "suspended") {
        await tx
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.userId, targetId));
      }

      return updated;
    });

    return user;
  },
};
