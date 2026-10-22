import { useState } from "react";

import type { CourseModule } from "@/shared/types/lesson";
import type { CourseProgress } from "@/modules/student/utils/progress";
import { ProgressBar } from "./ProgressBar";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg";
import PlayIcon from "@/assets/icons/play.svg";
import PlayFilledDarkIcon from "@/assets/icons/play-filled-dark.svg";
import "./LessonSidebar.css";

type LessonSidebarProps = {
  modules: CourseModule[];
  completedIds: Set<string>;
  activeId: string;
  activeModuleIndex: number;
  progress: CourseProgress;
  onSelect: (lessonId: string) => void;
};

export function LessonSidebar({
  modules,
  completedIds,
  activeId,
  activeModuleIndex,
  progress,
  onSelect,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<number>>(
    () => new Set([activeModuleIndex]),
  );

  const isOpen = (index: number) =>
    index === activeModuleIndex || openModules.has(index);

  const toggle = (index: number) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (isOpen(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <nav className="lesson-sidebar" aria-label="Contenido del curso">
      <div className="lesson-sidebar__summary">
        <h2 className="lesson-sidebar__title">Contenido del curso</h2>
        <p className="lesson-sidebar__stats" aria-live="polite">
          <strong>
            {progress.completed} de {progress.total}
          </strong>{" "}
          clases completadas ·{" "}
          <strong className="lesson-sidebar__percent">
            {progress.percent}%
          </strong>
        </p>
        <ProgressBar value={progress.percent} label="Progreso del curso" />
      </div>

      <ul className="lesson-sidebar__modules">
        {modules.map((module, index) => {
          if (module.lessons.length === 0) return null;
          const open = isOpen(index);
          const panelId = `sidebar-module-${index}`;
          const done = module.lessons.filter((lesson) =>
            completedIds.has(lesson.id),
          ).length;

          return (
            <li key={module.id} className="lesson-sidebar__module">
              <button
                type="button"
                className="lesson-sidebar__trigger"
                onClick={() => toggle(index)}
                aria-expanded={open}
                aria-controls={panelId}
                disabled={index === activeModuleIndex}
              >
                <span className="lesson-sidebar__module-info">
                  <span className="lesson-sidebar__module-number">
                    Módulo {index + 1}
                  </span>
                  <span className="lesson-sidebar__module-title">
                    {module.title}
                  </span>
                </span>
                <span className="lesson-sidebar__module-count">
                  {done}/{module.lessons.length}
                </span>
                <img
                  className={
                    open
                      ? "lesson-sidebar__chevron lesson-sidebar__chevron--open"
                      : "lesson-sidebar__chevron"
                  }
                  src={ChevronDownIcon}
                  alt=""
                />
              </button>

              {open && (
                <ul id={panelId} className="lesson-sidebar__lessons">
                  {module.lessons.map((lesson) => {
                    const active = lesson.id === activeId;
                    const completed = completedIds.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          className={
                            active
                              ? "lesson-sidebar__lesson lesson-sidebar__lesson--active"
                              : "lesson-sidebar__lesson"
                          }
                          onClick={() => onSelect(lesson.id)}
                          aria-current={active ? "true" : undefined}
                        >
                          <img
                            className="lesson-sidebar__lesson-icon"
                            src={
                              completed
                                ? CheckCircleIcon
                                : active
                                  ? PlayFilledDarkIcon
                                  : PlayIcon
                            }
                            alt={completed ? "Completada" : ""}
                          />
                          <span className="lesson-sidebar__lesson-title">
                            {lesson.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
