import { and, count, eq, sql } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
import {
  enrollments,
  lessonProgress,
  lessons,
  modules,
} from "../../db/schema/index.ts";

/**
 * One row per enrollment of the course (optionally only one enrollment) with
 * its progress percent. Single source of truth for the percent formula.
 *
 * We start from enrollments (anchored to the course) and LEFT-JOIN to
 * lessons/modules so that a course with zero lessons still produces a row
 * per enrollment (with total=0 → pct=0). Completed lessons are counted via a
 * second LEFT JOIN to lesson_progress, filtered to lessons of this course.
 */
function progressSubquery(
  executor: DbOrTx,
  courseId: string,
  enrollmentId?: string,
) {
  return executor
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
    .where(
      enrollmentId === undefined
        ? eq(enrollments.courseId, courseId)
        : and(
            eq(enrollments.courseId, courseId),
            eq(enrollments.id, enrollmentId),
          ),
    )
    .groupBy(enrollments.id)
    .as("sub");
}

/** Columns derived from the percent: status and completedAt follow pct = 100 */
function progressValues(sub: ReturnType<typeof progressSubquery>) {
  return {
    progressPercent: sql`${sub.pct}`,
    status: sql`case when ${sub.pct} = 100 then 'completed'::enrollment_status else 'active'::enrollment_status end`,
    completedAt: sql`case when ${sub.pct} = 100 then coalesce(${enrollments.completedAt}, now()) else null end`,
  };
}

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
    const sub = progressSubquery(executor, courseId);
    await executor
      .update(enrollments)
      .set(progressValues(sub))
      .from(sub)
      .where(eq(enrollments.id, sub.enrollmentId));
  },
  /**
   * Recalculates progressPercent for a single enrollment in one UPDATE and
   * returns the new percent. Same formula as recalcCourseProgress, computed
   * by the database at UPDATE time (no stale totals read in JS).
   */
  async recalcEnrollmentProgress(
    enrollmentId: string,
    courseId: string,
    executor: DbOrTx = db,
  ) {
    const sub = progressSubquery(executor, courseId, enrollmentId);
    const [row] = await executor
      .update(enrollments)
      .set(progressValues(sub))
      .from(sub)
      .where(eq(enrollments.id, sub.enrollmentId))
      .returning({ progressPercent: enrollments.progressPercent });
    return row?.progressPercent ?? 0;
  },
};
