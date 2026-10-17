import { z } from "zod";
import "zod-openapi";

// ── Module schemas ────────────────────────────────────────────────────────────

export const createModuleSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: z.number({ error: "Position is required" }).int().min(1),
  })
  .meta({ id: "CreateModuleRequest" });

export const updateModuleSchema = createModuleSchema
  .partial()
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
    position: z.number({ error: "Position is required" }).int().min(1),
    videoUrl: z
      .string()
      .trim()
      .url({ error: "videoUrl must be a valid URL" })
      .optional()
      .nullable(),
  })
  .meta({ id: "CreateLessonRequest" });

export const updateLessonSchema = createLessonSchema
  .partial()
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
