import { count, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { users } from "../../db/schema/index.ts";
import type { UsersQuery } from "./users-admin.schemas.ts";

export const usersAdminRepository = {
  async findMany({ page, limit }: UsersQuery) {
    const offset = (page - 1) * limit;
    const [data, totalResult] = await Promise.all([
      db.query.users.findMany({
        columns: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
        },
        limit,
        offset,
      }),
      db.select({ value: count() }).from(users),
    ]);
    const total = totalResult[0]?.value ?? 0;
    return { data, total };
  },

  async updateStatus(id: string, status: "active" | "suspended") {
    const [user] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      });
    return user ?? null;
  },
};
