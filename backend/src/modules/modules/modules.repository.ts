import { and, asc, count, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
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

  async deleteModule(id: string) {
    const [m] = await db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning({ id: modules.id });
    return m ?? null;
  },

  // ── Lessons ───────────────────────────────────────────────────────────────

  async countLessonsByCourse(courseId: string) {
    const [result] = await db
      .select({ total: count() })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
    return result?.total ?? 0;
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

  async createLesson(data: NewLesson) {
    const [l] = await db.insert(lessons).values(data).returning();
    return l!;
  },

  async updateLesson(id: string, data: UpdateLessonInput) {
    const [l] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, id))
      .returning();
    return l ?? null;
  },

  async deleteLesson(id: string) {
    const [l] = await db
      .delete(lessons)
      .where(eq(lessons.id, id))
      .returning({ id: lessons.id });
    return l ?? null;
  },
};
