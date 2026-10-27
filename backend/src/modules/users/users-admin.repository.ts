import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { users } from "../../db/schema/index.ts";
import type { UsersQuery } from "./users-admin.schemas.ts";

const PUBLIC_COLUMNS = {
  id: users.id,
  email: users.email,
  fullName: users.fullName,
  role: users.role,
  status: users.status,
  createdAt: users.createdAt,
} as const;

export const usersAdminRepository = {
  async findMany({ page, limit, role, status, search }: UsersQuery) {
    const offset = (page - 1) * limit;
    const filters: SQL[] = [];

    if (role !== undefined) filters.push(eq(users.role, role));
    if (status !== undefined) filters.push(eq(users.status, status));
    if (search !== undefined && search.length > 0) {
      filters.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
        )!,
      );
    }

    const where = filters.length > 0 ? and(...filters) : undefined;

    const [data, totalResult] = await Promise.all([
      db
        .select(PUBLIC_COLUMNS)
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt), asc(users.id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(users).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;
    return { data, total };
  },
};
