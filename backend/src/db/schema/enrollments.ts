import {
  index,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
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
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: enrollmentStatus().notNull().default("active"),
    // 0–100 maintained by the application when lesson progress is recorded
    progressPercent: smallint().notNull().default(0),
    enrolledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    // Prevents a user from enrolling in the same course twice
    uniqueIndex("enrollments_user_course_unique").on(
      table.userId,
      table.courseId,
    ),
    index().on(table.courseId),
  ],
);

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type EnrollmentStatus = (typeof enrollmentStatus.enumValues)[number];
