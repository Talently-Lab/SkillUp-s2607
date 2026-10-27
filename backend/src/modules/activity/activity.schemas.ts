import { z } from "zod";
import "zod-openapi";
import { courseActivityAction } from "../../db/schema/index.ts";

export const activityQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    courseId: z.uuid().optional(),
    actorId: z.uuid().optional(),
    action: z.enum(courseActivityAction.enumValues).optional(),
  })
  .meta({ id: "ActivityQuery" });

export type ActivityQuery = z.infer<typeof activityQuerySchema>;

// ── Response schemas (OpenAPI) ────────────────────────────────────────────────

export const activityEntrySchema = z
  .object({
    id: z.uuid(),
    action: z.enum(courseActivityAction.enumValues),
    entityId: z.uuid().nullable(),
    changes: z.record(
      z.string(),
      z.object({ from: z.unknown().optional(), to: z.unknown().optional() }),
    ),
    createdAt: z.iso.datetime(),
    course: z.object({ id: z.uuid(), title: z.string() }),
    actor: z
      .object({
        id: z.uuid(),
        fullName: z.string(),
        role: z.enum(["student", "teacher", "admin"]),
      })
      .nullable(),
  })
  .meta({ id: "ActivityEntry" });

export const activityListSchema = z
  .object({
    data: z.array(activityEntrySchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .meta({ id: "ActivityList" });
