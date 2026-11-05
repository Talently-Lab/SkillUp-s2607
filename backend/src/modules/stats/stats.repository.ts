import { and, count, countDistinct, desc, eq, gte, or } from "drizzle-orm";
import { db } from "../../db/client.ts";
import {
  courses,
  enrollments,
  lessonProgress,
  users,
} from "../../db/schema/index.ts";

const ACTIVE_WINDOW_DAYS = 30;
const DAY_MS = 86_400_000;

export const statsRepository = {
  async getPlatformStats() {
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_DAYS * DAY_MS);
    const [
      totalCoursesResult,
      publishedCoursesResult,
      totalStudentsResult,
      activeStudentsResult,
      totalTeachersResult,
      teachersWithPublishedCoursesResult,
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
      // Active: enrolled or completed a lesson within the window
      db
        .select({ value: countDistinct(enrollments.userId) })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .leftJoin(
          lessonProgress,
          eq(lessonProgress.enrollmentId, enrollments.id),
        )
        .where(
          and(
            eq(users.role, "student"),
            or(
              gte(enrollments.enrolledAt, activeSince),
              gte(lessonProgress.completedAt, activeSince),
            ),
          ),
        ),
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, "teacher")),
      db
        .select({ value: countDistinct(courses.instructorId) })
        .from(courses)
        .innerJoin(users, eq(courses.instructorId, users.id))
        .where(and(eq(courses.status, "published"), eq(users.role, "teacher"))),
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
    const activeStudents = activeStudentsResult[0]?.value ?? 0;
    const totalTeachers = totalTeachersResult[0]?.value ?? 0;
    const teachersWithPublishedCourses =
      teachersWithPublishedCoursesResult[0]?.value ?? 0;
    const totalEnrollments = totalEnrollmentsResult[0]?.value ?? 0;
    const completedEnrollments = completedEnrollmentsResult[0]?.value ?? 0;
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100 * 10) / 10
        : 0;
    return {
      courses: { total: totalCourses, published: publishedCourses },
      students: { total: totalStudents, active: activeStudents },
      teachers: {
        total: totalTeachers,
        withPublishedCourses: teachersWithPublishedCourses,
      },
      enrollments: { total: totalEnrollments, completed: completedEnrollments },
      completionRate,
      topCourses,
    };
  },
};
