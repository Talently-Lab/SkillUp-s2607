import { z } from "zod";
import "zod-openapi";

// ── Query params ──────────────────────────────────────────────────────────────

export const coursesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(["draft", "published"]).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    featured: z
      .string()
      .optional()
      .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  })
  .meta({ id: "CoursesQuery" });

export type CoursesQuery = z.infer<typeof coursesQuerySchema>;

// ── Response schemas (OpenAPI) ────────────────────────────────────────────────

export const categorySchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
  })
  .meta({ id: "Category" });

export const courseSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    coverUrl: z.string().nullable(),
    categoryId: z.number().int(),
    instructorId: z.uuid().nullable(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    priceCents: z.number().int(),
    currency: z.string(),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    lessonsCount: z.number().int(),
    durationMinutes: z.number().int(),
    studentsCount: z.number().int(),
    ratingAvg: z.string().nullable(),
    reviewsCount: z.number().int(),
    publishedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "Course" });

export const coursesListSchema = z
  .object({
    data: z.array(courseSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .meta({ id: "CoursesList" });
