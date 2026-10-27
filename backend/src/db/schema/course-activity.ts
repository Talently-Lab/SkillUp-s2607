import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { courses } from "./courses.ts";
import { users } from "./users.ts";

export const courseActivityAction = pgEnum("course_activity_action", [
  "course.created",
  "course.updated",
  "course.published",
  "course.unpublished",
  "module.created",
  "module.updated",
  "module.deleted",
  "modules.reordered",
  "lesson.created",
  "lesson.updated",
  "lesson.deleted",
  "lessons.reordered",
]);

/** What a field was and what it became; created/deleted rows only have one side */
export type ActivityChanges = Record<string, { from?: unknown; to?: unknown }>;

/** Audit log of the changes made to a course and its content, by teachers and admins */
export const courseActivity = pgTable(
  "course_activity",
  {
    id: uuid().primaryKey().defaultRandom(),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    // set null: the log outlives the user
    actorId: uuid().references(() => users.id, { onDelete: "set null" }),
    action: courseActivityAction().notNull(),
    // module or lesson id; null for course actions. No FK: it may be deleted
    entityId: uuid(),
    changes: jsonb().$type<ActivityChanges>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index().on(table.courseId, table.createdAt),
    index().on(table.createdAt),
  ],
);

export type CourseActivity = typeof courseActivity.$inferSelect;
export type NewCourseActivity = typeof courseActivity.$inferInsert;
export type CourseActivityAction =
  (typeof courseActivityAction.enumValues)[number];
