import { eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { refreshTokens, users } from "../../db/schema/index.ts";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { usersAdminRepository } from "./users-admin.repository.ts";
import type {
  UpdateUserRoleInput,
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

    // Use a transaction: the admin-role check, status update and token revocation must be
    // atomic with respect to concurrent PATCH /:id/role requests. Without re-reading inside
    // the transaction a concurrent updateRole that promotes the target to admin between the
    // outer findFirst and the inner update would let the suspend proceed on an admin account.
    const user = await db.transaction(async (tx) => {
      // Re-read the target row inside the transaction to close the TOCTOU window
      const current = await tx.query.users.findFirst({
        where: eq(users.id, targetId),
      });
      if (!current) throw new NotFoundError("User not found");
      if (current.role === "admin" && status === "suspended") {
        throw new ForbiddenError(
          "ADMIN_SUSPEND_FORBIDDEN",
          "Admin accounts cannot be suspended",
        );
      }

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

  async updateRole(
    requesterId: string,
    targetId: string,
    { role }: UpdateUserRoleInput,
  ) {
    // An admin cannot change their own role (would immediately lock them out of admin endpoints)
    if (requesterId === targetId) {
      throw new ForbiddenError(
        "SELF_ROLE_FORBIDDEN",
        "You cannot change your own role",
      );
    }

    // NOTE: existing JWT access tokens are NOT invalidated on role change. They expire naturally
    // within JWT_ACCESS_TTL_SECONDS (default 900 s). Only refresh tokens are checked on
    // /auth/refresh, so the new role takes effect on the next token rotation.
    //
    // Use a transaction: the status check and the update must be atomic with respect to
    // concurrent PATCH /:id/status requests. Without it, a suspend that races between the
    // read and the update would be silently bypassed (the role update would execute on a
    // now-suspended account).
    const updated = await db.transaction(async (tx) => {
      // Locked FOR UPDATE: a concurrent suspend, or a course being assigned to
      // this teacher (which locks the row FOR SHARE), waits for this tx or
      // finishes before it, so the checks below can't go stale.
      const current = await usersAdminRepository.findForUpdate(targetId, tx);
      if (!current) throw new NotFoundError("User not found");
      if (current.status === "suspended") {
        throw new ForbiddenError(
          "TARGET_SUSPENDED",
          "Cannot change role of a suspended user",
        );
      }
      // A former teacher keeps instructorId but loses the panel: the courses would be orphaned
      if (
        current.role === "teacher" &&
        role !== "teacher" &&
        (await coursesRepository.countByInstructor(targetId, tx)) > 0
      ) {
        throw new ConflictError(
          "TEACHER_HAS_COURSES",
          "Reassign the teacher's courses before changing their role",
        );
      }

      const [row] = await tx
        .update(users)
        .set({ role })
        .where(eq(users.id, targetId))
        .returning({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        });

      if (!row) throw new NotFoundError("User not found");
      return row;
    });

    return updated;
  },
};
