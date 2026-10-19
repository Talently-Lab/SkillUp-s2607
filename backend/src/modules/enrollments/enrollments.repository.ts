import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import {
  courses,
  enrollments,
  type NewEnrollment,
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

  async create(data: NewEnrollment) {
    const [enrollment] = await db.insert(enrollments).values(data).returning();
    return enrollment!;
  },

  /** Returns all enrollments for a user with course data joined, ordered by most recent */
  async findManyByUser(userId: string) {
    return db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progressPercent: enrollments.progressPercent,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        course: {
          id: courses.id,
          slug: courses.slug,
          title: courses.title,
          coverUrl: courses.coverUrl,
          level: courses.level,
          priceCents: courses.priceCents,
          currency: courses.currency,
        },
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  },
};
