import {
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { courses } from "./courses.ts";
import { users } from "./users.ts";

export const enrollmentStatus = pgEnum("enrollment_status", [
  "active",
  "completed",
]);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // restrict: deleting a course with enrolled students is rejected at DB level
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    status: enrollmentStatus().notNull().default("active"),
    // 0-100 maintained by the app; enforced by DB check constraint
    progressPercent: smallint().notNull().default(0),
    enrolledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    uniqueIndex("enrollments_user_course_unique").on(
      table.userId,
      table.courseId,
    ),
    index().on(table.courseId),
    check(
      "enrollments_progress_percent_check",
      sql`${table.progressPercent} >= 0 AND ${table.progressPercent} <= 100`,
    ),
  ],
);

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type EnrollmentStatus = (typeof enrollmentStatus.enumValues)[number];
