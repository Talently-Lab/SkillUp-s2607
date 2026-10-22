import { useFetch } from "@/shared/hooks/useFetch";
import { coursesService } from "@/shared/services/coursesService";
import { enrollmentsService } from "@/shared/services/enrollmentsService";
import { modulesService } from "@/shared/services/modulesService";
import type { Course } from "@/shared/types/course";
import type { EnrolledCourse } from "@/shared/types/enrollment";
import {
  findNextLesson,
  isCourseFinished,
  toCourseProgress,
  type CourseProgress,
  type NextLesson,
} from "@/modules/student/utils/progress";

export type EnrolledItem = {
  course: EnrolledCourse;
  progress: CourseProgress;
  completedIds: string[];
};

type DashboardData = {
  enrolled: EnrolledItem[];
  /** The first course still in progress, or the first one if all are done */
  featured: EnrolledItem | null;
  featuredNext: NextLesson | null;
  catalog: Course[];
};

async function loadDashboard(): Promise<DashboardData> {
  // Asked first because it renews an expired session for the requests below
  const enrollments = await enrollmentsService.listMine();
  const [progresses, catalog] = await Promise.all([
    Promise.all(
      enrollments.map((item) => enrollmentsService.getProgress(item.id)),
    ),
    coursesService.list(),
  ]);

  const enrolled = enrollments.map((enrollment, index) => ({
    course: enrollment.course,
    progress: toCourseProgress(progresses[index]!),
    completedIds: progresses[index]!.completedLessonIds,
  }));
  const featured =
    enrolled.find((item) => !isCourseFinished(item.progress)) ??
    enrolled[0] ??
    null;
  // Only the featured course shows its next lesson, so only its modules are read
  const featuredNext =
    featured && !isCourseFinished(featured.progress)
      ? findNextLesson(
          await modulesService.listByCourse(featured.course.id),
          featured.completedIds,
        )
      : null;

  return { enrolled, featured, featuredNext, catalog };
}

export function useStudentDashboard(userId: string) {
  return useFetch(`student-dashboard-${userId}`, loadDashboard);
}
