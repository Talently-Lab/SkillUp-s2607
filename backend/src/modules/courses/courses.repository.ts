import { and, asc, count, eq, type SQL } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { courses, type NewCourse } from "../../db/schema/index.ts";
import type { CoursesQuery, UpdateCourseInput } from "./courses.schemas.ts";

export const coursesRepository = {
  async findMany({ page, limit, status, categoryId, featured }: CoursesQuery) {
    const filters: SQL[] = [];

    if (status !== undefined) filters.push(eq(courses.status, status));
    if (categoryId !== undefined)
      filters.push(eq(courses.categoryId, categoryId));
    if (featured !== undefined) filters.push(eq(courses.featured, featured));

    const where = filters.length > 0 ? and(...filters) : undefined;
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db.query.courses.findMany({
        where,
        limit,
        offset,
        orderBy: [asc(courses.createdAt)],
      }),
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

  async create(data: NewCourse) {
    const [course] = await db.insert(courses).values(data).returning();
    return course!;
  },

  async update(id: string, data: UpdateCourseInput) {
    const [course] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return course ?? null;
  },

  async remove(id: string) {
    const [course] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning({ id: courses.id });
    return course ?? null;
  },
};
