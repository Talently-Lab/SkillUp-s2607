import { and, asc, count, desc, eq, type SQL } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
import {
  categories,
  courses,
  type NewCourse,
  users,
} from "../../db/schema/index.ts";
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

/** Columns selected for course list/detail responses — includes category and instructor */
const courseSelect = {
  id: courses.id,
  slug: courses.slug,
  title: courses.title,
  description: courses.description,
  coverUrl: courses.coverUrl,
  categoryId: courses.categoryId,
  instructorId: courses.instructorId,
  level: courses.level,
  priceCents: courses.priceCents,
  currency: courses.currency,
  status: courses.status,
  featured: courses.featured,
  lessonsCount: courses.lessonsCount,
  durationMinutes: courses.durationMinutes,
  studentsCount: courses.studentsCount,
  ratingAvg: courses.ratingAvg,
  reviewsCount: courses.reviewsCount,
  publishedAt: courses.publishedAt,
  createdAt: courses.createdAt,
  updatedAt: courses.updatedAt,
  category: {
    id: categories.id,
    slug: categories.slug,
    name: categories.name,
  },
  instructor: {
    id: users.id,
    fullName: users.fullName,
  },
} as const;

export const coursesRepository = {
  /** Public catalog: always restricted to published courses */
  async findMany(query: CoursesQuery) {
    return findPage({ ...query, status: "published" });
  },

  async findManyAdmin(query: AdminCoursesQuery) {
    return findPage(query);
  },

  async findById(id: string, executor: DbOrTx = db) {
    return findOneCourse(eq(courses.id, id), executor);
  },

  async countByInstructor(instructorId: string, executor: DbOrTx = db) {
    const [result] = await executor
      .select({ value: count() })
      .from(courses)
      .where(eq(courses.instructorId, instructorId));
    return result?.value ?? 0;
  },

  async findPublishedById(id: string) {
    return findOneCourse(
      and(eq(courses.id, id), eq(courses.status, "published"))!,
    );
  },

  async findPublishedBySlug(slug: string) {
    return findOneCourse(
      and(eq(courses.slug, slug), eq(courses.status, "published"))!,
    );
  },

  /** Returns the created course with category and instructor */
  async create(data: NewCourse, executor: DbOrTx = db) {
    const [created] = await executor
      .insert(courses)
      .values(data)
      .returning({ id: courses.id });
    return (await findOneCourse(eq(courses.id, created!.id), executor))!;
  },

  /** Returns the updated course with category and instructor, or null if not found */
  async update(
    id: string,
    data: UpdateCourseInput & { publishedAt?: Date | null | undefined },
    executor: DbOrTx = db,
  ) {
    const [updated] = await executor
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning({ id: courses.id });
    return updated ? findOneCourse(eq(courses.id, updated.id), executor) : null;
  },

  async updateLessonTotals(
    id: string,
    totals: { lessonsCount: number; durationMinutes: number },
    executor: DbOrTx = db,
  ) {
    await executor.update(courses).set(totals).where(eq(courses.id, id));
  },

  /**
   * Acquires a FOR NO KEY UPDATE row-level lock on the course.
   * Must be called inside a transaction (tx). Serialises concurrent lesson
   * mutations of the same course without blocking enrollment inserts (KEY SHARE).
   */
  async lockForUpdate(courseId: string, executor: DbOrTx) {
    await executor
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .for("no key update");
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
    db
      .select(courseSelect)
      .from(courses)
      .innerJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(where)
      .orderBy(desc(courses.createdAt), asc(courses.id))
      .limit(opts.limit)
      .offset(offset),
    db.select({ value: count() }).from(courses).where(where),
  ]);
  const total = totalResult[0]?.value ?? 0;
  return { data, total };
}

async function findOneCourse(condition: SQL, executor: DbOrTx = db) {
  const rows = await executor
    .select(courseSelect)
    .from(courses)
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(condition)
    .limit(1);
  return rows[0] ?? null;
}
