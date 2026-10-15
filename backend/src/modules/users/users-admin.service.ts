import { NotFoundError } from "../../shared/errors/app-error.ts";
import { authRepository } from "../auth/auth.repository.ts";
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

  async updateStatus(id: string, { status }: UpdateUserStatusInput) {
    const user = await usersAdminRepository.updateStatus(id, status);
    if (!user) throw new NotFoundError("User not found");

    // Suspending a user must revoke all their active refresh tokens
    if (status === "suspended") {
      await authRepository.revokeAllRefreshTokens(id);
    }

    return user;
  },
};
