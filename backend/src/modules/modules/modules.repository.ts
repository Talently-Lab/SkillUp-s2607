import { asc, eq } from "drizzle-orm";
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

  async findById(id: string) {
    return db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: { lessons: { orderBy: [asc(lessons.position)] } },
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

  async findLessonById(id: string) {
    return db.query.lessons.findFirst({ where: eq(lessons.id, id) });
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
