import type { EnrollmentStatus } from "./enrollment";
import type { StudentProfile } from "./student";

/** A lesson as the teacher edits it, the video is never locked for them */
export interface TeacherLesson {
  id: string;
  title: string;
  position: number;
  videoUrl: string | null;
  /** Read from the video by the editor; null if it couldn't be read */
  durationSeconds: number | null;
}

export interface TeacherModule {
  id: string;
  title: string;
  position: number;
  lessons: TeacherLesson[];
}

/** One student enrolled in a course of the teacher */
export interface TeacherEnrollment {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  /** Last lesson completed; null if the student hasn't completed any */
  lastActivityAt: string | null;
  student: StudentProfile;
}
