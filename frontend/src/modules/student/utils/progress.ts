import type { Course } from "../../../shared/types/course";
import type { Enrollment } from "../../../shared/types/enrollment";
import { getSyllabus } from "../../../shared/utils/syllabus";

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
  /** First lesson not completed yet, null when the course is finished */
  next: { moduleIndex: number; title: string } | null;
}

export function getCourseProgress(
  course: Course,
  enrollment: Enrollment,
): CourseProgress {
  const lessons = getSyllabus(course).modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      moduleIndex,
      title: lesson.title,
      done: enrollment.completedLessonIds.includes(
        `${moduleIndex}-${lessonIndex}`,
      ),
    })),
  );
  const completed = lessons.filter((lesson) => lesson.done).length;
  const next = lessons.find((lesson) => !lesson.done);

  return {
    completed,
    total: lessons.length,
    percent: lessons.length
      ? Math.round((completed / lessons.length) * 100)
      : 0,
    next: next ? { moduleIndex: next.moduleIndex, title: next.title } : null,
  };
}
