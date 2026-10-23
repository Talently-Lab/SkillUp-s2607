import { z } from "zod";
import "zod-openapi";

// ── Query params ──────────────────────────────────────────────────────────────

// Shared by the public and admin queries
const queryBase = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.coerce.number().int().positive().optional(),
  // strict boolean: only "true" or "false" accepted
  featured: z
    .enum(["true", "false"], {
      error: 'featured must be "true" or "false"',
    })
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

// Public catalog: no status param, the service forces published
export const coursesQuerySchema = queryBase.meta({ id: "CoursesQuery" });

export type CoursesQuery = z.infer<typeof coursesQuerySchema>;

// ── Admin query params (status filter respected) ─────────────────────────────

export const adminCoursesQuerySchema = queryBase
  .extend({ status: z.enum(["draft", "published"]).optional() })
  .meta({ id: "AdminCoursesQuery" });

export type AdminCoursesQuery = z.infer<typeof adminCoursesQuerySchema>;

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
    category: categorySchema,
    instructor: z
      .object({
        id: z.uuid(),
        fullName: z.string(),
      })
      .nullable(),
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

// ── Admin input schemas ───────────────────────────────────────────────────────

// Base fields without defaults — used for partial updates
const courseFieldsSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(3, { error: "Title must have at least 3 characters" })
    .max(255, { error: "Title must have at most 255 characters" }),
  slug: z
    .string({ error: "Slug is required" })
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug must be lowercase letters, numbers and hyphens only",
    })
    .max(255),
  description: z.string().trim().max(5000).optional().nullable(),
  coverUrl: z
    .string()
    .trim()
    .url({
      protocol: /^https?$/,
      error: "Cover URL must be a valid http(s) URL",
    })
    .optional()
    .nullable(),
  categoryId: z.number({ error: "Category is required" }).int().positive(),
  instructorId: z.uuid().optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  priceCents: z.number().int().min(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, {
      error: "Currency must be a 3-letter ISO code (e.g. USD, CLP)",
    }),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  lessonsCount: z.number().int().min(0),
  durationMinutes: z.number().int().min(0),
});

// Create: required fields with sensible defaults
export const createCourseSchema = courseFieldsSchema
  .extend({
    level: courseFieldsSchema.shape.level.default("beginner"),
    priceCents: courseFieldsSchema.shape.priceCents.default(0),
    currency: courseFieldsSchema.shape.currency.default("USD"),
    status: courseFieldsSchema.shape.status.default("draft"),
    featured: courseFieldsSchema.shape.featured.default(false),
    lessonsCount: courseFieldsSchema.shape.lessonsCount.default(0),
    durationMinutes: courseFieldsSchema.shape.durationMinutes.default(0),
  })
  .meta({ id: "CreateCourseRequest" });

// Update: all fields optional, no defaults (missing field = keep existing value in DB)
export const updateCourseSchema = courseFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "UpdateCourseRequest" });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
