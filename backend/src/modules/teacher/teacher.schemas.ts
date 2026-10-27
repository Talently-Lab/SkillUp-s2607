import { z } from "zod";
import "zod-openapi";

// ── Route params ──────────────────────────────────────────────────────────────

export const teacherCourseParamsSchema = z.object({ courseId: z.uuid() });
export const teacherModuleParamsSchema = z.object({ moduleId: z.uuid() });
export const teacherLessonParamsSchema = z.object({ lessonId: z.uuid() });

// ── Pagination ────────────────────────────────────────────────────────────────

export const teacherCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .meta({ id: "TeacherCoursesQuery" });

export type TeacherCoursesQuery = z.infer<typeof teacherCoursesQuerySchema>;

// ── Module schemas ────────────────────────────────────────────────────────────

export const createTeacherModuleSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: z.number({ error: "Position is required" }).int().min(1),
  })
  .strict()
  .meta({ id: "TeacherCreateModuleRequest" });

export const updateTeacherModuleSchema = createTeacherModuleSchema
  .partial()
  .strict()
  .meta({ id: "TeacherUpdateModuleRequest" });

export type CreateTeacherModuleInput = z.infer<typeof createTeacherModuleSchema>;
export type UpdateTeacherModuleInput = z.infer<typeof updateTeacherModuleSchema>;

// ── Lesson schemas ────────────────────────────────────────────────────────────

export const createTeacherLessonSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(2, { error: "Title must have at least 2 characters" })
      .max(255),
    position: z.number({ error: "Position is required" }).int().min(1),
    videoUrl: z
      .url({ error: "videoUrl must be a valid URL" })
      .trim()
      .optional()
      .nullable(),
  })
  .strict()
  .meta({ id: "TeacherCreateLessonRequest" });

export const updateTeacherLessonSchema = createTeacherLessonSchema
  .partial()
  .strict()
  .meta({ id: "TeacherUpdateLessonRequest" });

export type CreateTeacherLessonInput = z.infer<typeof createTeacherLessonSchema>;
export type UpdateTeacherLessonInput = z.infer<typeof updateTeacherLessonSchema>;

// ── Response schemas (re-exported from modules for convenience) ───────────────
export { moduleSchema, lessonSchema } from "../modules/modules.schemas.ts";
