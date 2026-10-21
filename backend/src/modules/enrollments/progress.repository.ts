import { and, count, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.ts";
import {
  enrollments,
  lessonProgress,
  lessons,
  modules,
} from "../../db/schema/index.ts";

export const progressRepository = {
  /** Completed lessons of the enrollment's course (avoids cross-course leakage) */
  async findCompleted(enrollmentId: string, courseId: string) {
    return db
      .select({
        lessonId: lessonProgress.lessonId,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollmentId),
          eq(modules.courseId, courseId),
        ),
      );
  },
  /** Inserts the completion atomically; returns [] if it already existed */
  async markComplete(enrollmentId: string, lessonId: string) {
    return db
      .insert(lessonProgress)
      .values({ enrollmentId, lessonId })
      .onConflictDoNothing()
      .returning();
  },
  /** Count total lessons in a course and the completed ones of that course */
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
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .innerJoin(modules, eq(lessons.moduleId, modules.id))
        .where(
          and(
            eq(lessonProgress.enrollmentId, enrollmentId),
            eq(modules.courseId, courseId),
          ),
        ),
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
        completedAt: isComplete
          ? sql`coalesce(${enrollments.completedAt}, now())`
          : null,
      })
      .where(eq(enrollments.id, enrollmentId));
  },
  /** Recalculates progressPercent for every enrollment of a course (e.g. after a lesson or module is deleted) */
  async recalcCourseProgress(courseId: string) {
    const rows = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId));
    for (const { id } of rows) {
      const { total, completed } = await this.getProgress(id, courseId);
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      await this.updateProgressPercent(id, percent);
    }
  },
};
