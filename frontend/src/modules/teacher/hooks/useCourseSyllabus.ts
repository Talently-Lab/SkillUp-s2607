import { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePendingDeletes } from "@/modules/teacher/stores/pendingDeletes";
import { move, nextPosition } from "@/modules/teacher/utils/syllabus";
import { showTeacherError } from "@/modules/teacher/utils/teacherErrorMessage";
import { teacherService } from "@/shared/services/teacherService";
import type { TeacherLesson, TeacherModule } from "@/shared/types/teacher";
import { readVideoDuration } from "@/shared/utils/videoDuration";

type LoadStatus = "loading" | "ready" | "error";

function sortByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  return ids.flatMap((id) => items.find((item) => item.id === id) ?? []);
}

/**
 * The syllabus of one course, saved in the API with each change. The editor
 * moves and renames right away and, if the API fails, shows the error and
 * reloads the syllabus. Deletes wait until their "Deshacer" toast closes.
 */
export function useCourseSyllabus(courseId: string) {
  const [modules, setModules] = useState<TeacherModule[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [savingCount, setSavingCount] = useState(0);
  const deletes = usePendingDeletes((state) => state.deletes);

  useEffect(() => {
    let ignore = false;
    teacherService.listModules(courseId).then(
      (data) => {
        if (ignore) return;
        setModules(data);
        setLoadStatus("ready");
      },
      () => {
        if (!ignore) setLoadStatus("error");
      },
    );
    return () => {
      ignore = true;
    };
  }, [courseId, attempt]);

  const reload = () => {
    setLoadStatus("loading");
    setAttempt((prev) => prev + 1);
  };

  // Brings the syllabus back in line with the API without the loader
  const resync = () => setAttempt((prev) => prev + 1);

  /** Resolves with undefined if the API failed */
  const save = async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setSavingCount((prev) => prev + 1);
    try {
      return await action();
    } catch (error) {
      showTeacherError(error);
      resync();
      return undefined;
    } finally {
      setSavingCount((prev) => prev - 1);
    }
  };

  const isHidden = (id: string) => deletes.has(id);
  const isUndoable = (id: string) => deletes.get(id) === "undoable";

  const visibleModules = modules
    .filter((module) => !isHidden(module.id))
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => !isHidden(lesson.id)),
    }));

  const updateModule = (
    moduleId: string,
    patch: (module: TeacherModule) => TeacherModule,
  ) =>
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId ? patch(module) : module,
      ),
    );

  const updateLessonState = (
    moduleId: string,
    lessonId: string,
    patch: Partial<TeacherLesson>,
  ) =>
    updateModule(moduleId, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
      ),
    }));

  /**
   * Hides the item and sends the DELETE when the toast closes without
   * "Deshacer".
   */
  const deleteLater = (
    id: string,
    message: string,
    title: string,
    remove: () => Promise<void>,
  ) => {
    const { set, restore } = usePendingDeletes.getState();
    set(id, "undoable");

    const send = () => {
      if (usePendingDeletes.getState().deletes.get(id) !== "undoable") return;
      set(id, "deleted");
      remove().catch((error: unknown) => {
        restore(id);
        showTeacherError(error);
        resync();
      });
    };

    toast(message, {
      description: title,
      action: { label: "Deshacer", onClick: () => restore(id) },
      onAutoClose: send,
      onDismiss: send,
    });
  };

  // ── Modules ───────────────────────────────────────────────────────────────

  const addModule = async (): Promise<TeacherModule | undefined> => {
    const created = await save(() =>
      teacherService.createModule(courseId, {
        title: "Nuevo módulo",
        position: nextPosition(modules),
      }),
    );
    if (created) setModules((current) => [...current, created]);
    return created;
  };

  const renameModule = (moduleId: string, title: string) => {
    updateModule(moduleId, (module) => ({ ...module, title }));
    void save(() => teacherService.renameModule(moduleId, title));
  };

  const moveModule = (moduleId: string, step: -1 | 1) => {
    const visibleIds = visibleModules.map((module) => module.id);
    const index = visibleIds.indexOf(moduleId);
    const moved = move(visibleIds, index, index + step);
    if (moved === visibleIds) return;

    const ids = [
      ...moved,
      ...modules.map((module) => module.id).filter(isUndoable),
    ];
    setModules((current) => sortByIds(current, ids));
    void save(() => teacherService.reorderModules(courseId, ids));
  };

  const deleteModule = (module: TeacherModule) =>
    deleteLater(module.id, "Módulo eliminado", module.title, () =>
      teacherService.deleteModule(module.id),
    );

  // ── Lessons ───────────────────────────────────────────────────────────────

  /** Resolves with false if the API failed, so the form keeps what was typed */
  const addLesson = async (
    moduleId: string,
    input: { title: string; videoUrl: string | null },
  ): Promise<boolean> => {
    const module = modules.find((item) => item.id === moduleId);
    if (!module) return false;
    const position = nextPosition(module.lessons);

    const created = await save(async () =>
      teacherService.createLesson(moduleId, {
        ...input,
        position,
        durationSeconds: input.videoUrl
          ? await readVideoDuration(input.videoUrl)
          : null,
      }),
    );
    if (!created) return false;

    updateModule(moduleId, (current) => ({
      ...current,
      lessons: [...current.lessons, created],
    }));
    return true;
  };

  const renameLesson = (moduleId: string, lessonId: string, title: string) => {
    updateLessonState(moduleId, lessonId, { title });
    void save(() => teacherService.updateLesson(lessonId, { title }));
  };

  /** The duration is read again from the new video, null clears both */
  const changeLessonVideo = async (
    moduleId: string,
    lessonId: string,
    videoUrl: string | null,
  ) => {
    updateLessonState(moduleId, lessonId, { videoUrl });
    const updated = await save(async () =>
      teacherService.updateLesson(lessonId, {
        videoUrl,
        durationSeconds: videoUrl ? await readVideoDuration(videoUrl) : null,
      }),
    );
    if (updated) updateLessonState(moduleId, lessonId, updated);
  };

  const moveLesson = (moduleId: string, lessonId: string, step: -1 | 1) => {
    const module = modules.find((item) => item.id === moduleId);
    if (!module) return;

    const visibleIds = module.lessons
      .map((lesson) => lesson.id)
      .filter((id) => !isHidden(id));
    const index = visibleIds.indexOf(lessonId);
    const moved = move(visibleIds, index, index + step);
    if (moved === visibleIds) return;

    const ids = [
      ...moved,
      ...module.lessons.map((lesson) => lesson.id).filter(isUndoable),
    ];
    updateModule(moduleId, (current) => ({
      ...current,
      lessons: sortByIds(current.lessons, ids),
    }));
    void save(() => teacherService.reorderLessons(moduleId, ids));
  };

  const deleteLesson = (lesson: TeacherLesson) =>
    deleteLater(lesson.id, "Lección eliminada", lesson.title, () =>
      teacherService.deleteLesson(lesson.id),
    );

  return {
    modules: visibleModules,
    isLoading: loadStatus === "loading",
    hasError: loadStatus === "error",
    isSaving: savingCount > 0,
    reload,
    addModule,
    renameModule,
    moveModule,
    deleteModule,
    addLesson,
    renameLesson,
    changeLessonVideo,
    moveLesson,
    deleteLesson,
  };
}
