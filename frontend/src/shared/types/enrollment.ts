import type { Course } from "./course";

export type EnrollmentStatus = "active" | "completed";

/** The course data that comes with each of the student's enrollments */
export type EnrolledCourse = Pick<
  Course,
  | "id"
  | "slug"
  | "title"
  | "image"
  | "category"
  | "durationHours"
  | "lessons"
  | "price"
  | "instructor"
>;

export interface Enrollment {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  course: EnrolledCourse;
}

export interface EnrollmentProgress {
  percent: number;
  /** Lessons the course has right now */
  total: number;
  completedLessonIds: string[];
}
