import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { courses, type NewCourse } from "../../db/schema/index.ts";
import type {
  AdminCoursesQuery,
  CoursesQuery,
  UpdateCourseInput,
} from "./courses.schemas.ts";

interface FindManyOptions {
  page: number;
  limit: number;
  status?: "draft" | "published" | undefined;
  categoryId?: number | undefined;
  featured?: boolean | undefined;
}

function buildWhere(opts: FindManyOptions): SQL | undefined {
  const filters: SQL[] = [];
  if (opts.status !== undefined) filters.push(eq(courses.status, opts.status));
  if (opts.categoryId !== undefined)
    filters.push(eq(courses.categoryId, opts.categoryId));
  if (opts.featured !== undefined)
    filters.push(eq(courses.featured, opts.featured));
  return filters.length > 0 ? and(...filters) : undefined;
}

export const coursesRepository = {
  async findMany(query: CoursesQuery) {
    return findPage(query);
  },

  /** Admin list: respects status filter, shows all statuses when omitted */
  async findManyAdmin(query: AdminCoursesQuery) {
    return findPage(query);
  },

  async findById(id: string) {
    return db.query.courses.findFirst({ where: eq(courses.id, id) });
  },

  async findPublishedById(id: string) {
    return db.query.courses.findFirst({
      where: and(eq(courses.id, id), eq(courses.status, "published")),
    });
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

async function findPage(opts: FindManyOptions) {
  const where = buildWhere(opts);
  const offset = (opts.page - 1) * opts.limit;
  const [data, totalResult] = await Promise.all([
    db.query.courses.findMany({
      where,
      limit: opts.limit,
      offset,
      orderBy: [desc(courses.createdAt), asc(courses.id)],
    }),
    db.select({ value: count() }).from(courses).where(where),
  ]);
  const total = totalResult[0]?.value ?? 0;
  return { data, total };
}
