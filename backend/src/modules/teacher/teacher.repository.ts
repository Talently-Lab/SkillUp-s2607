import { and, asc, count, desc, eq, inArray, max, sql } from "drizzle-orm";
import { db, type DbOrTx } from "../../db/client.ts";
import {
  courses,
  enrollments,
  lessonProgress,
  lessons,
  modules,
  users,
} from "../../db/schema/index.ts";

export const teacherRepository = {
  // ── Courses ───────────────────────────────────────────────────────────────

  /**
   * Locks the course (FOR NO KEY UPDATE) only if it still belongs to the
   * instructor, and returns whether it did. Must run inside a transaction.
   * An admin reassigning instructorId takes the same lock, so the ownership
   * read here stays true until the transaction ends.
   */
  async lockOwnedCourse(
    courseId: string,
    instructorId: string,
    executor: DbOrTx,
  ) {
    const rows = await executor
      .select({ id: courses.id })
      .from(courses)
      .where(
        and(eq(courses.id, courseId), eq(courses.instructorId, instructorId)),
      )
      .for("no key update");
    return rows.length > 0;
  },

  // ── Modules ───────────────────────────────────────────────────────────────

  /**
   * Returns the module only if it belongs to a course owned by the given instructor.
   * Uses a JOIN to avoid two serial reads.
   */
  async findModuleOwnedByTeacher(moduleId: string, instructorId: string) {
    const rows = await db
      .select({ id: modules.id, courseId: modules.courseId })
      .from(modules)
      .innerJoin(
        courses,
        and(
          eq(modules.courseId, courses.id),
          eq(courses.instructorId, instructorId),
        ),
      )
      .where(eq(modules.id, moduleId))
      .limit(1);
    return rows[0] ?? null;
  },

  async findModuleIds(courseId: string, executor: DbOrTx) {
    const rows = await executor
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.position));
    return rows.map((row) => row.id);
  },

  /**
   * Gives each module the position of its id in `orderedIds` (1..n).
   * (courseId, position) is unique and not deferrable, so the rows first move
   * to negative positions and then to the final ones: no step repeats a value.
   */
  async setModulePositions(orderedIds: string[], executor: DbOrTx) {
    await executor
      .update(modules)
      .set({ position: sql`-${modules.position}` })
      .where(inArray(modules.id, orderedIds));
    for (const [index, id] of orderedIds.entries()) {
      await executor
        .update(modules)
        .set({ position: index + 1 })
        .where(eq(modules.id, id));
    }
  },

  // ── Lessons ───────────────────────────────────────────────────────────────

  async findLessonsByModule(moduleId: string, executor: DbOrTx = db) {
    return executor.query.lessons.findMany({
      where: eq(lessons.moduleId, moduleId),
      orderBy: [asc(lessons.position)],
    });
  },

  /**
   * Returns the lesson only if it belongs to a module whose course is owned by
   * the given instructor. Uses a JOIN through module → course to avoid three
   * serial reads. courseId is included in the result for transaction use.
   */
  async findLessonOwnedByTeacher(lessonId: string, instructorId: string) {
    const rows = await db
      .select({
        id: lessons.id,
        moduleId: lessons.moduleId,
        courseId: modules.courseId,
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .innerJoin(
        courses,
        and(
          eq(modules.courseId, courses.id),
          eq(courses.instructorId, instructorId),
        ),
      )
      .where(eq(lessons.id, lessonId))
      .limit(1);
    return rows[0] ?? null;
  },

  async findLessonIds(moduleId: string, executor: DbOrTx) {
    const rows = await executor
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))
      .orderBy(asc(lessons.position));
    return rows.map((row) => row.id);
  },

  /** Same two steps as setModulePositions, for (moduleId, position) */
  async setLessonPositions(orderedIds: string[], executor: DbOrTx) {
    await executor
      .update(lessons)
      .set({ position: sql`-${lessons.position}` })
      .where(inArray(lessons.id, orderedIds));
    for (const [index, id] of orderedIds.entries()) {
      await executor
        .update(lessons)
        .set({ position: index + 1 })
        .where(eq(lessons.id, id));
    }
  },

  // ── Enrollments ───────────────────────────────────────────────────────────

  async findEnrollmentsByCourse(
    courseId: string,
    limit: number,
    offset: number,
  ) {
    const where = eq(enrollments.courseId, courseId);
    const lastActivity = db
      .select({
        enrollmentId: lessonProgress.enrollmentId,
        at: max(lessonProgress.completedAt).as("last_activity_at"),
      })
      .from(lessonProgress)
      .innerJoin(enrollments, eq(lessonProgress.enrollmentId, enrollments.id))
      .where(where)
      .groupBy(lessonProgress.enrollmentId)
      .as("last_activity");

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: enrollments.id,
          status: enrollments.status,
          progressPercent: enrollments.progressPercent,
          enrolledAt: enrollments.enrolledAt,
          completedAt: enrollments.completedAt,
          lastActivityAt: lastActivity.at,
          student: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
          },
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .leftJoin(lastActivity, eq(lastActivity.enrollmentId, enrollments.id))
        .where(where)
        .orderBy(desc(enrollments.enrolledAt), asc(enrollments.id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(enrollments).where(where),
    ]);
    return { data, total: totalResult[0]?.value ?? 0 };
  },
};
