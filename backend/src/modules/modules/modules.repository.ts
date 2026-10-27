import { and, asc, count, eq, sql } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
import {
  lessons,
  modules,
  type NewLesson,
  type NewModule,
} from "../../db/schema/index.ts";
import type {
  UpdateLessonInput,
  UpdateModuleInput,
} from "./modules.schemas.ts";

export const modulesRepository = {
  // ── Modules ──────────────────────────────────────────────────────────────

  async findByCourse(courseId: string) {
    return db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: [asc(modules.position)],
      with: {
        lessons: { orderBy: [asc(lessons.position)] },
      },
    });
  },

  /** Finds a module only if it belongs to the given course (ownership check) */
  async findModuleInCourse(courseId: string, moduleId: string) {
    return db.query.modules.findFirst({
      where: and(eq(modules.id, moduleId), eq(modules.courseId, courseId)),
    });
  },

  async createModule(data: NewModule) {
    const [m] = await db.insert(modules).values(data).returning();
    return m!;
  },

  async updateModule(id: string, data: UpdateModuleInput) {
    const [m] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();
    return m ?? null;
  },

  async deleteModule(id: string, executor: DbOrTx = db) {
    const [m] = await executor
      .delete(modules)
      .where(eq(modules.id, id))
      .returning({ id: modules.id });
    return m ?? null;
  },

  // ── Lessons ───────────────────────────────────────────────────────────────

  /** Number of lessons and sum of their known durations */
  async lessonTotalsByCourse(courseId: string, executor: DbOrTx = db) {
    const [result] = await executor
      .select({
        total: count(),
        durationSeconds:
          sql<number>`coalesce(sum(${lessons.durationSeconds}), 0)`.mapWith(
            Number,
          ),
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
    return {
      total: result?.total ?? 0,
      durationSeconds: result?.durationSeconds ?? 0,
    };
  },

  async findLessonById(id: string) {
    return db.query.lessons.findFirst({ where: eq(lessons.id, id) });
  },

  /** Finds a lesson only if it belongs to the given module (ownership check) */
  async findLessonInModule(moduleId: string, lessonId: string) {
    return db.query.lessons.findFirst({
      where: and(eq(lessons.id, lessonId), eq(lessons.moduleId, moduleId)),
    });
  },

  async createLesson(data: NewLesson, executor: DbOrTx = db) {
    const [l] = await executor.insert(lessons).values(data).returning();
    return l!;
  },

  async updateLesson(
    id: string,
    data: UpdateLessonInput,
    executor: DbOrTx = db,
  ) {
    const [l] = await executor
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, id))
      .returning();
    return l ?? null;
  },

  async deleteLesson(id: string, executor: DbOrTx = db) {
    const [l] = await executor
      .delete(lessons)
      .where(eq(lessons.id, id))
      .returning({ id: lessons.id });
    return l ?? null;
  },
};
