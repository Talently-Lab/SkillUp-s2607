import type { Enrollment } from "../types/enrollment";

/** Enrollments by user id, until the student API is ready. */
export const enrollmentsByUser: Record<string, Enrollment[]> = {
  "u-student-01": [
    {
      courseId: "fundamentos-ux-ui",
      completedLessonIds: ["0-0", "0-1", "0-2", "1-0"],
      enrolledAt: "2026-09-02T10:00:00.000Z",
    },
    {
      courseId: "python-desde-cero",
      completedLessonIds: ["0-0", "0-1", "0-2", "1-0", "1-1", "1-2", "2-0"],
      enrolledAt: "2026-08-12T10:00:00.000Z",
    },
    {
      courseId: "marketing-digital-estrategico",
      completedLessonIds: [
        "0-0",
        "0-1",
        "0-2",
        "1-0",
        "1-1",
        "1-2",
        "2-0",
        "2-1",
        "2-2",
        "3-0",
        "3-1",
      ],
      enrolledAt: "2026-06-20T10:00:00.000Z",
    },
  ],
};
