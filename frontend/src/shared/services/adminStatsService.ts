import { request } from "@/shared/api/http";
import type { PlatformStats, TopCourse } from "@/shared/types/adminStats";

type ApiTopCourse = {
  id: string;
  slug: string;
  title: string;
  studentsCount: number;
  priceCents: number;
};

type ApiStats = {
  courses: { total: number; published: number };
  students: { total: number };
  enrollments: { total: number; completed: number };
  completionRate: number;
  topCourses: ApiTopCourse[];
};

function toTopCourse({
  id,
  slug,
  title,
  studentsCount,
  priceCents,
}: ApiTopCourse): TopCourse {
  return {
    id,
    slug,
    title,
    students: studentsCount,
    price: priceCents > 0 ? priceCents / 100 : null,
  };
}

export const adminStatsService = {
  async get(): Promise<PlatformStats> {
    const stats = await request<ApiStats>("/admin/stats", { auth: true });
    return {
      courses: stats.courses,
      students: stats.students.total,
      enrollments: stats.enrollments,
      completionRate: stats.completionRate,
      topCourses: stats.topCourses.map(toTopCourse),
    };
  },
};
