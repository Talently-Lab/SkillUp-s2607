import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const courseLevel = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const courseStatus = pgEnum("course_status", ["draft", "published"]);

export const categories = pgTable("categories", {
  id: serial().primaryKey(),
  slug: varchar({ length: 100 }).notNull().unique(),
  name: varchar({ length: 100 }).notNull(),
});

export const courses = pgTable(
  "courses",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: varchar({ length: 255 }).notNull().unique(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    coverUrl: varchar({ length: 500 }),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),
    // nullable: no teacher panel in MVP; admin creates courses
    instructorId: uuid().references(() => users.id, { onDelete: "set null" }),
    level: courseLevel().notNull().default("beginner"),
    // price in cents; 0 = free
    priceCents: integer().notNull().default(0),
    currency: varchar({ length: 3 }).notNull().default("USD"),
    status: courseStatus().notNull().default("draft"),
    featured: boolean().notNull().default(false),
    lessonsCount: integer().notNull().default(0),
    durationMinutes: integer().notNull().default(0),
    studentsCount: integer().notNull().default(0),
    ratingAvg: numeric({ precision: 3, scale: 1 }),
    reviewsCount: integer().notNull().default(0),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index().on(table.status, table.categoryId),
    index().on(table.instructorId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseLevel = (typeof courseLevel.enumValues)[number];
export type CourseStatus = (typeof courseStatus.enumValues)[number];
