import { z } from "zod";
import "zod-openapi";

// ── Route params ──────────────────────────────────────────────────────────────

export const courseParamsSchema = z.object({ courseId: z.uuid() });
export const courseModuleParamsSchema = courseParamsSchema.extend({
  moduleId: z.uuid(),
});
export const courseModuleLessonParamsSchema = courseModuleParamsSchema.extend({
  lessonId: z.uuid(),
});

// ── Shared fields ─────────────────────────────────────────────────────────────

// The column is a smallint: a bigger value would reach the DB and fail with 500
export const positionSchema = z
  .number({ error: "Position is required" })
  .int()
  .min(1)
  .max(32767);

// Read from the video by the client (file metadata, YouTube/Vimeo player); up to 24 h
export const durationSecondsSchema = z
  .number({ error: "durationSeconds must be a number" })
  .int()
  .min(1)
  .max(86400)
  .nullable()
  .optional();

// ── Module schemas ────────────────────────────────────────────────────────────

export const createModuleSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: positionSchema,
  })
  .meta({ id: "CreateModuleRequest" });

export const updateModuleSchema = createModuleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "UpdateModuleRequest" });

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ── Lesson schemas ────────────────────────────────────────────────────────────

export const createLessonSchema = z
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
  .meta({ id: "CreateLessonRequest" });

export const updateLessonSchema = createLessonSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  })
  .meta({ id: "UpdateLessonRequest" });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

// ── Response schemas (OpenAPI) ────────────────────────────────────────────────

export const lessonSchema = z
  .object({
    id: z.uuid(),
    moduleId: z.uuid(),
    title: z.string(),
    videoUrl: z.string().nullable(),
    durationSeconds: z.number().int().nullable(),
    position: z.number().int(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "Lesson" });

export const moduleSchema = z
  .object({
    id: z.uuid(),
    courseId: z.uuid(),
    title: z.string(),
    position: z.number().int(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    lessons: z.array(lessonSchema).optional(),
  })
  .meta({ id: "Module" });

/** Lessons unlocked for everyone, counted in the course's global order */
export const FREE_PREVIEW_LESSONS = 2;

// ── Public response schemas (include `locked` field) ─────────────────────────
// Used only by GET /courses/:courseId/modules. Admin endpoints keep using
// lessonSchema / moduleSchema to avoid adding `locked` to their responses.

/** Lesson as returned by the public module list: includes `locked` and may have videoUrl=null */
export const lessonPublicSchema = lessonSchema
  .extend({ locked: z.boolean() })
  .meta({ id: "LessonPublic" });

/** Module as returned by the public module list: lessons carry `locked` */
export const modulePublicSchema = moduleSchema
  .extend({ lessons: z.array(lessonPublicSchema).optional() })
  .meta({ id: "ModulePublic" });
