import { request } from "@/shared/api/http";
import { defaultCover } from "@/shared/constants/course";
import { NO_INSTRUCTOR } from "@/shared/services/coursesService";
import type { Category } from "@/shared/types/category";
import type {
  Enrollment,
  EnrollmentProgress,
  EnrollmentStatus,
} from "@/shared/types/enrollment";

type ApiEnrollment = {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    slug: string;
    title: string;
    coverUrl: string | null;
    priceCents: number;
    lessonsCount: number;
    durationMinutes: number;
    category: Category;
    instructor: { id: string; fullName: string } | null;
  };
};

type ApiProgress = {
  progressPercent: number;
  total: number;
  completedLessons: { lessonId: string; completedAt: string }[];
};

function toEnrollment({ course, ...enrollment }: ApiEnrollment): Enrollment {
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    status: enrollment.status,
    progressPercent: enrollment.progressPercent,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    course: {
      id: enrollment.courseId,
      slug: course.slug,
      title: course.title,
      image: course.coverUrl ?? defaultCover(course.category.slug),
      category: course.category.name,
      // One decimal, so 90 minutes reads as 1.5 h
      durationHours: Math.round(course.durationMinutes / 6) / 10,
      lessons: course.lessonsCount,
      price: course.priceCents > 0 ? course.priceCents / 100 : null,
      instructor: course.instructor?.fullName ?? NO_INSTRUCTOR,
    },
  };
}

export const enrollmentsService = {
  /** Only free courses, the API answers COURSE_NOT_FREE for the rest */
  async enroll(courseId: string): Promise<void> {
    await request("/enrollments", {
      method: "POST",
      body: { courseId },
      auth: true,
    });
  },

  async listMine(): Promise<Enrollment[]> {
    const { enrollments } = await request<{ enrollments: ApiEnrollment[] }>(
      "/enrollments/me",
      { auth: true },
    );
    return enrollments.map(toEnrollment);
  },

  async getProgress(enrollmentId: string): Promise<EnrollmentProgress> {
    const progress = await request<ApiProgress>(
      `/enrollments/${enrollmentId}/progress`,
      { auth: true },
    );
    return {
      percent: progress.progressPercent,
      total: progress.total,
      completedLessonIds: progress.completedLessons.map(
        (lesson) => lesson.lessonId,
      ),
    };
  },

  /** Resolves with the new course percent */
  async completeLesson(enrollmentId: string, lessonId: string) {
    const { progressPercent } = await request<{ progressPercent: number }>(
      `/enrollments/${enrollmentId}/progress/lessons/${lessonId}/complete`,
      { method: "POST", auth: true },
    );
    return progressPercent;
  },
};
