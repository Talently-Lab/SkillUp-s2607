import type { EnrollmentProgress } from "@/shared/types/enrollment";
import type { CourseModule } from "@/shared/types/lesson";

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface NextLesson {
  id: string;
  moduleIndex: number;
  title: string;
}

export function toCourseProgress(progress: EnrollmentProgress): CourseProgress {
  return {
    completed: progress.completedLessonIds.length,
    total: progress.total,
    percent: progress.percent,
  };
}

export const isCourseFinished = (progress: CourseProgress) =>
  progress.total > 0 && progress.percent === 100;

/** First lesson not completed yet, in course order. null when all are done */
export function findNextLesson(
  modules: CourseModule[],
  completedIds: string[],
): NextLesson | null {
  const done = new Set(completedIds);
  for (const [moduleIndex, module] of modules.entries()) {
    const lesson = module.lessons.find((item) => !done.has(item.id));
    if (lesson) return { id: lesson.id, moduleIndex, title: lesson.title };
  }
  return null;
}
