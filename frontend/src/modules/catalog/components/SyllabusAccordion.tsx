import { useState } from "react";

import type { CourseModule, Lesson } from "@/shared/types/lesson";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg";
import LockIcon from "@/assets/icons/lock.svg";
import PlayIcon from "@/assets/icons/play.svg";
import "./SyllabusAccordion.css";

type SyllabusAccordionProps = {
  modules: CourseModule[];
  /** Enrolled students go to the classroom, the rest watch a preview */
  enrolled: boolean;
  onPlay: (lesson: Lesson) => void;
};

export function SyllabusAccordion({
  modules,
  enrolled,
  onPlay,
}: SyllabusAccordionProps) {
  const [openModules, setOpenModules] = useState<Set<number>>(
    () => new Set([0]),
  );
  const allOpen = openModules.size === modules.length;

  const toggle = (index: number) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const toggleAll = () =>
    setOpenModules(allOpen ? new Set() : new Set(modules.map((_, i) => i)));

  return (
    <div className="syllabus">
      <div className="syllabus__actions">
        <button type="button" className="syllabus__toggle-all" onClick={toggleAll}>
          {allOpen ? "Contraer todo" : "Expandir todo"}
        </button>
      </div>
      <ul className="syllabus__list">
        {modules.map((module, index) => {
          const isOpen = openModules.has(index);
          const panelId = `module-panel-${index}`;
          return (
            <li key={module.id} className="syllabus__module">
              <h3 className="syllabus__heading">
                <button
                  type="button"
                  className="syllabus__trigger"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="syllabus__number">{index + 1}</span>
                  <span className="syllabus__info">
                    <span className="syllabus__title">{module.title}</span>
                    <span className="syllabus__meta">
                      {module.lessons.length}{" "}
                      {module.lessons.length === 1 ? "lección" : "lecciones"}
                    </span>
                  </span>
                  <img
                    className={
                      isOpen
                        ? "syllabus__chevron syllabus__chevron--open"
                        : "syllabus__chevron"
                    }
                    src={ChevronDownIcon}
                    alt=""
                  />
                </button>
              </h3>
              {isOpen && (
                <ul id={panelId} className="syllabus__lessons">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="syllabus__lesson">
                      <SyllabusLesson
                        lesson={lesson}
                        enrolled={enrolled}
                        onPlay={onPlay}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type SyllabusLessonProps = {
  lesson: Lesson;
  enrolled: boolean;
  onPlay: (lesson: Lesson) => void;
};

function SyllabusLesson({ lesson, enrolled, onPlay }: SyllabusLessonProps) {
  if (lesson.locked) {
    return (
      <>
        <img className="syllabus__lesson-icon" src={LockIcon} alt="" />
        <span className="syllabus__lesson-title syllabus__lesson-title--locked">
          {lesson.title}
        </span>
        <span className="visually-hidden">Bloqueada</span>
      </>
    );
  }

  // Enrolled students can open any lesson, even one without a video yet
  if (!enrolled && !lesson.videoUrl) {
    return (
      <>
        <img className="syllabus__lesson-icon" src={PlayIcon} alt="" />
        <span className="syllabus__lesson-title">{lesson.title}</span>
      </>
    );
  }

  return (
    <button
      type="button"
      className="syllabus__lesson-btn"
      onClick={() => onPlay(lesson)}
    >
      <img className="syllabus__lesson-icon" src={PlayIcon} alt="" />
      <span className="syllabus__lesson-title">{lesson.title}</span>
      {!enrolled && <span className="syllabus__preview">Vista previa</span>}
    </button>
  );
}
