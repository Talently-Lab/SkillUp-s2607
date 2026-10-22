import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import {
  categories,
  courses,
  enrollments,
  type NewEnrollment,
  users,
} from "../../db/schema/index.ts";

export const enrollmentsRepository = {
  async findByUserAndCourse(userId: string, courseId: string) {
    return db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
      ),
    });
  },

  /** Returns the enrollment only if it belongs to the user (object-level auth) */
  async findByIdForUser(userId: string, enrollmentId: string) {
    return db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.id, enrollmentId),
        eq(enrollments.userId, userId),
      ),
    });
  },

  async create(data: NewEnrollment) {
    const [enrollment] = await db.insert(enrollments).values(data).returning();
    return enrollment!;
  },

  /** Returns all enrollments for a user with course data joined, ordered by most recent */
  async findManyByUser(userId: string) {
    // Replicates the courseSelect + join pattern from courses.repository.ts (findPage/findOneCourse)
    // so that category and instructor have the same shape as in GET /courses responses.
    // Drizzle requires a flat select; category and instructor are top-level groups like in courseSelect.
    return db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progressPercent: enrollments.progressPercent,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        // course fields
        courseSlug: courses.slug,
        courseTitle: courses.title,
        courseCoverUrl: courses.coverUrl,
        courseLevel: courses.level,
        coursePriceCents: courses.priceCents,
        courseCurrency: courses.currency,
        courseLessonsCount: courses.lessonsCount,
        courseDurationMinutes: courses.durationMinutes,
        // category (same shape as in courses.repository.ts courseSelect)
        category: {
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
        },
        // instructor (same shape; leftJoin returns null when no instructor)
        instructor: {
          id: users.id,
          fullName: users.fullName,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  },
};
