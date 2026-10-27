import { z } from "zod";
import "zod-openapi";
import { courseFieldsSchema } from "../courses/courses.schemas.ts";
import {
  durationSecondsSchema,
  positionSchema,
} from "../modules/modules.schemas.ts";

// ── Route params ──────────────────────────────────────────────────────────────

export const teacherCourseParamsSchema = z.object({ courseId: z.uuid() });
export const teacherModuleParamsSchema = z.object({ moduleId: z.uuid() });
export const teacherLessonParamsSchema = z.object({ lessonId: z.uuid() });

// ── Pagination ────────────────────────────────────────────────────────────────

export const teacherPageQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .meta({ id: "TeacherPageQuery" });

export type TeacherPageQuery = z.infer<typeof teacherPageQuerySchema>;

// ── Course schema ─────────────────────────────────────────────────────────────

// Price, currency, slug, featured and instructor stay admin-only
export const updateTeacherCourseSchema = courseFieldsSchema
  .pick({
    title: true,
    description: true,
    coverUrl: true,
    categoryId: true,
    level: true,
    status: true,
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "TeacherUpdateCourseRequest" });

export type UpdateTeacherCourseInput = z.infer<
  typeof updateTeacherCourseSchema
>;

// ── Module schemas ────────────────────────────────────────────────────────────

export const createTeacherModuleSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: positionSchema,
  })
  .strict()
  .meta({ id: "TeacherCreateModuleRequest" });

export const updateTeacherModuleSchema = createTeacherModuleSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "TeacherUpdateModuleRequest" });

export type CreateTeacherModuleInput = z.infer<
  typeof createTeacherModuleSchema
>;
export type UpdateTeacherModuleInput = z.infer<
  typeof updateTeacherModuleSchema
>;

// ── Lesson schemas ────────────────────────────────────────────────────────────

export const createTeacherLessonSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: positionSchema,
    videoUrl: z
      .url({ error: "videoUrl must be a valid URL" })
      .trim()
      .optional()
      .nullable(),
    durationSeconds: durationSecondsSchema,
  })
  .strict()
  .meta({ id: "TeacherCreateLessonRequest" });

export const updateTeacherLessonSchema = createTeacherLessonSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "TeacherUpdateLessonRequest" });

export type CreateTeacherLessonInput = z.infer<
  typeof createTeacherLessonSchema
>;
export type UpdateTeacherLessonInput = z.infer<
  typeof updateTeacherLessonSchema
>;

// ── Reorder ───────────────────────────────────────────────────────────────────

/** Every id of the module/lesson list, once each, in the new order */
export const reorderSchema = z
  .object({
    ids: z
      .array(z.uuid(), { error: "ids must be an array of UUIDs" })
      .min(1)
      .max(500)
      .refine((ids) => new Set(ids).size === ids.length, {
        error: "ids must not contain duplicates",
      }),
  })
  .strict()
  .meta({ id: "TeacherReorderRequest" });

export type ReorderInput = z.infer<typeof reorderSchema>;

// ── Response schemas ──────────────────────────────────────────────────────────

export const teacherEnrollmentSchema = z
  .object({
    id: z.uuid(),
    status: z.enum(["active", "completed"]),
    progressPercent: z.number().int(),
    enrolledAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
    /** Last lesson completed; null if the student hasn't completed any */
    lastActivityAt: z.iso.datetime().nullable(),
    student: z.object({
      id: z.uuid(),
      fullName: z.string(),
      email: z.string(),
    }),
  })
  .meta({ id: "TeacherEnrollment" });
