import { count, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { courses, enrollments, users } from "../../db/schema/index.ts";

export const statsRepository = {
  async getPlatformStats() {
    const [
      totalCoursesResult,
      publishedCoursesResult,
      totalStudentsResult,
      totalEnrollmentsResult,
      completedEnrollmentsResult,
      topCourses,
    ] = await Promise.all([
      db.select({ value: count() }).from(courses),
      db
        .select({ value: count() })
        .from(courses)
        .where(eq(courses.status, "published")),
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, "student")),
      db.select({ value: count() }).from(enrollments),
      db
        .select({ value: count() })
        .from(enrollments)
        .where(eq(enrollments.status, "completed")),
      db
        .select({
          id: courses.id,
          slug: courses.slug,
          title: courses.title,
          studentsCount: courses.studentsCount,
          ratingAvg: courses.ratingAvg,
          priceCents: courses.priceCents,
          currency: courses.currency,
        })
        .from(courses)
        .where(eq(courses.status, "published"))
        .orderBy(desc(courses.studentsCount))
        .limit(5),
    ]);

    const totalCourses = totalCoursesResult[0]?.value ?? 0;
    const publishedCourses = publishedCoursesResult[0]?.value ?? 0;
    const totalStudents = totalStudentsResult[0]?.value ?? 0;
    const totalEnrollments = totalEnrollmentsResult[0]?.value ?? 0;
    const completedEnrollments = completedEnrollmentsResult[0]?.value ?? 0;

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100 * 10) / 10
        : 0;

    return {
      courses: { total: totalCourses, published: publishedCourses },
      students: { total: totalStudents },
      enrollments: { total: totalEnrollments, completed: completedEnrollments },
      completionRate,
      topCourses,
    };
  },
};
