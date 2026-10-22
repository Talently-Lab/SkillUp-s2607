import { useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/http";
import { enrollmentsService } from "@/shared/services/enrollmentsService";
import type { EnrollmentProgress } from "@/shared/types/enrollment";
import type { CourseModule, Lesson } from "@/shared/types/lesson";

export type ClassroomLesson = Lesson & {
  moduleIndex: number;
  moduleTitle: string;
};

type ClassroomOptions = {
  enrollmentId: string;
  modules: CourseModule[];
  progress: EnrollmentProgress;
};

/**
 * The lesson on screen lives in the `lesson` param, so a reload or a shared
 * link opens the same one. Without it, the first lesson not completed opens.
 */
export function useClassroom({
  enrollmentId,
  modules,
  progress,
}: ClassroomOptions) {
  const [params, setParams] = useSearchParams();
  const [completedIds, setCompletedIds] = useState(
    () => new Set(progress.completedLessonIds),
  );
  const [percent, setPercent] = useState(progress.percent);
  const [isSaving, setIsSaving] = useState(false);

  const lessons: ClassroomLesson[] = modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleIndex,
      moduleTitle: module.title,
    })),
  );
  const requested = lessons.findIndex(
    (lesson) => lesson.id === params.get("lesson"),
  );
  const firstPending = lessons.findIndex(
    (lesson) => !completedIds.has(lesson.id),
  );
  const activeIndex = Math.max(requested !== -1 ? requested : firstPending, 0);
  const active = lessons[activeIndex] ?? null;
  const isCompleted = active !== null && completedIds.has(active.id);
  const completedCount = lessons.filter((lesson) =>
    completedIds.has(lesson.id),
  ).length;

  const select = (lessonId: string) => {
    setParams({ lesson: lessonId }, { replace: true });
    window.scrollTo(0, 0);
  };

  const goTo = (offset: number) => {
    const target = lessons[activeIndex + offset];
    if (target) select(target.id);
  };

  const markDone = (lessonId: string) =>
    setCompletedIds((prev) => new Set(prev).add(lessonId));

  const completeAndNext = async () => {
    if (!active || isSaving) return;
    if (isCompleted) {
      goTo(1);
      return;
    }

    setIsSaving(true);
    try {
      setPercent(
        await enrollmentsService.completeLesson(enrollmentId, active.id),
      );
      markDone(active.id);
      goTo(1);
    } catch (error) {
      if (error instanceof ApiError && error.code === "ALREADY_COMPLETED") {
        markDone(active.id);
        goTo(1);
      } else {
        toast.error("No pudimos guardar tu progreso. Inténtalo de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    lessons,
    active,
    activeIndex,
    completedIds,
    isCompleted,
    isSaving,
    progress: { completed: completedCount, total: lessons.length, percent },
    finished: lessons.length > 0 && percent === 100,
    select,
    goTo,
    completeAndNext,
  };
}
