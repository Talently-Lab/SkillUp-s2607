import { and, count, eq, sql } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
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
  /**
   * Recalculates progressPercent for every enrollment of a course in a single UPDATE.
   *
   * Semantics preserved from the N+1 version:
   *   total     = lessons in the course (lessons JOIN modules WHERE module.course_id = courseId)
   *   completed = lesson_progress rows of the enrollment whose lesson belongs to the same course
   *   pct       = total > 0 ? ROUND(completed*100/total)::int : 0  (half-up, same as Math.round)
   *   status    = pct = 100 ? 'completed' : 'active'
   *   completed_at = pct = 100 ? COALESCE(existing, now()) : NULL
   *
   * A course with no enrollments: UPDATE affects 0 rows, no error.
   * A course with no lessons:     all enrollments → pct=0 / active / NULL  (LEFT JOIN guarantees rows).
   * An enrollment with no lesson_progress: LEFT JOIN + COUNT → completed=0.
   */
  async recalcCourseProgress(courseId: string, executor: DbOrTx = db) {
    // Subquery: one row per enrollment, even when the course has no lessons.
    //
    // We start from enrollments (anchored to the course) and LEFT-JOIN to
    // lessons/modules so that a course with zero lessons still produces a row
    // per enrollment (with total=0 → pct=0).
    //
    // completed is counted via a second LEFT JOIN to lesson_progress, filtered
    // to lessons that belong to this course.
    const sub = executor
      .select({
        enrollmentId: enrollments.id,
        pct: sql<number>`
          case when count(distinct ${lessons.id}) = 0 then 0
               else cast(round(
                 count(distinct ${lessonProgress.lessonId})::numeric
                 * 100
                 / count(distinct ${lessons.id})::numeric
               ) as integer)
          end`.as("pct"),
      })
      .from(enrollments)
      .leftJoin(modules, eq(modules.courseId, courseId))
      .leftJoin(lessons, eq(lessons.moduleId, modules.id))
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.enrollmentId, enrollments.id),
          eq(lessonProgress.lessonId, lessons.id),
        ),
      )
      .where(eq(enrollments.courseId, courseId))
      .groupBy(enrollments.id)
      .as("sub");

    await executor
      .update(enrollments)
      .set({
        progressPercent: sql`${sub.pct}`,
        status: sql`case when ${sub.pct} = 100 then 'completed'::enrollment_status else 'active'::enrollment_status end`,
        completedAt: sql`case when ${sub.pct} = 100 then coalesce(${enrollments.completedAt}, now()) else null end`,
      })
      .from(sub)
      .where(eq(enrollments.id, sub.enrollmentId));
  },
};
