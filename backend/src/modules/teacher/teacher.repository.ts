import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { courses, lessons, modules } from "../../db/schema/index.ts";

export const teacherRepository = {
  // ── Courses ───────────────────────────────────────────────────────────────

  async findCoursesByInstructor(instructorId: string, limit: number, offset: number) {
    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: courses.id,
          slug: courses.slug,
          title: courses.title,
          status: courses.status,
          lessonsCount: courses.lessonsCount,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
        })
        .from(courses)
        .where(eq(courses.instructorId, instructorId))
        .orderBy(desc(courses.createdAt), asc(courses.id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(courses).where(eq(courses.instructorId, instructorId)),
    ]);
    return { data, total: totalResult[0]?.value ?? 0 };
  },

  /** Returns the course only if it belongs to the given instructor, or undefined */
  async findCourseByInstructor(courseId: string, instructorId: string) {
    return db.query.courses.findFirst({
      where: and(
        eq(courses.id, courseId),
        eq(courses.instructorId, instructorId),
      ),
    });
  },

  // ── Modules ───────────────────────────────────────────────────────────────

  async findModulesByCourse(courseId: string) {
    return db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: [asc(modules.position)],
      with: {
        lessons: { orderBy: [asc(lessons.position)] },
      },
    });
  },

  /**
   * Returns the module only if it belongs to a course owned by the given instructor.
   * Uses a JOIN to avoid two serial reads.
   */
  async findModuleOwnedByTeacher(moduleId: string, instructorId: string) {
    const rows = await db
      .select({
        id: modules.id,
        courseId: modules.courseId,
        title: modules.title,
        position: modules.position,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
      })
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

  // ── Lessons ───────────────────────────────────────────────────────────────

  async findLessonsByModule(moduleId: string) {
    return db.query.lessons.findMany({
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
        title: lessons.title,
        videoUrl: lessons.videoUrl,
        position: lessons.position,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
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
};
