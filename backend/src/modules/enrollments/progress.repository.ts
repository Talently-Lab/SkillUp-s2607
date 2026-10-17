import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import {
  enrollments,
  lessonProgress,
  lessons,
  modules,
} from "../../db/schema/index.ts";

export const progressRepository = {
  async findCompleted(enrollmentId: string) {
    return db
      .select({
        lessonId: lessonProgress.lessonId,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessonProgress)
      .where(eq(lessonProgress.enrollmentId, enrollmentId));
  },

  async isCompleted(enrollmentId: string, lessonId: string) {
    const row = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.enrollmentId, enrollmentId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    });
    return !!row;
  },

  async markComplete(enrollmentId: string, lessonId: string) {
    await db
      .insert(lessonProgress)
      .values({ enrollmentId, lessonId })
      .onConflictDoNothing();
  },

  /** Count total lessons in a course and completed by the enrollment */
  async getProgress(enrollmentId: string, courseId: string) {
    const [totalResult, completedResult] = await Promise.all([
      db
        .select({ total: count() })
        .from(lessons)
        .innerJoin(modules, eq(lessons.moduleId, modules.id))
        .where(eq(modules.courseId, courseId)),
      db
        .select({ completed: count() })
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, enrollmentId)),
    ]);
    const total = totalResult[0]?.total ?? 0;
    const completed = completedResult[0]?.completed ?? 0;
    return { total, completed };
  },

  async updateProgressPercent(enrollmentId: string, percent: number) {
    const isComplete = percent === 100;
    await db
      .update(enrollments)
      .set({
        progressPercent: percent,
        status: isComplete ? "completed" : "active",
        completedAt: isComplete ? new Date() : null,
      })
      .where(eq(enrollments.id, enrollmentId));
  },
};
