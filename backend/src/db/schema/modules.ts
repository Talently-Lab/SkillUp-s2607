import {
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courses } from "./courses.ts";

export const modules = pgTable(
  "modules",
  {
    id: uuid().primaryKey().defaultRandom(),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar({ length: 255 }).notNull(),
    position: smallint().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("modules_course_position_unique").on(
      table.courseId,
      table.position,
    ),
    index().on(table.courseId),
  ],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid().primaryKey().defaultRandom(),
    moduleId: uuid()
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: varchar({ length: 255 }).notNull(),
    // optional: video URL for future streaming support
    videoUrl: text(),
    position: smallint().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("lessons_module_position_unique").on(
      table.moduleId,
      table.position,
    ),
    index().on(table.moduleId),
  ],
);

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
