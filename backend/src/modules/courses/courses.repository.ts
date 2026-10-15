import { and, count, eq, type SQL } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { courses } from "../../db/schema/index.ts";
import type { CoursesQuery } from "./courses.schemas.ts";

export const coursesRepository = {
  async findMany({ page, limit, status, categoryId, featured }: CoursesQuery) {
    const filters: SQL[] = [];

    if (status !== undefined) filters.push(eq(courses.status, status));
    if (categoryId !== undefined) filters.push(eq(courses.categoryId, categoryId));
    if (featured !== undefined) filters.push(eq(courses.featured, featured));

    const where = filters.length > 0 ? and(...filters) : undefined;
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db.query.courses.findMany({ where, limit, offset }),
      db.select({ value: count() }).from(courses).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;
    return { data, total };
  },

  async findById(id: string) {
    return db.query.courses.findFirst({ where: eq(courses.id, id) });
  },

  async findBySlug(slug: string) {
    return db.query.courses.findFirst({ where: eq(courses.slug, slug) });
  },
};
