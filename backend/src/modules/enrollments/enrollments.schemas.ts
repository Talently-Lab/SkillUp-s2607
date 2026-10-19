import { z } from "zod";
import "zod-openapi";

export const enrollSchema = z
  .object({
    courseId: z.uuid({ error: "courseId must be a valid UUID" }),
  })
  .meta({ id: "EnrollRequest" });

export type EnrollInput = z.infer<typeof enrollSchema>;

// ── Response schemas (OpenAPI) ────────────────────────────────────────────────

export const enrollmentSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    courseId: z.uuid(),
    status: z.enum(["active", "completed"]),
    progressPercent: z.number().int(),
    enrolledAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
  })
  .meta({ id: "Enrollment" });

export const enrollmentWithCourseSchema = enrollmentSchema
  .extend({
    course: z.object({
      id: z.uuid(),
      slug: z.string(),
      title: z.string(),
      coverUrl: z.string().nullable(),
      level: z.enum(["beginner", "intermediate", "advanced"]),
      priceCents: z.number().int(),
      currency: z.string(),
    }),
  })
  .meta({ id: "EnrollmentWithCourse" });
