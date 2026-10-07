import { useState } from "react";

import type { SyllabusModule } from "../../../shared/types/syllabus";
import { getModuleMinutes } from "../utils/syllabus";
import ChevronDownIcon from "../../../assets/icons/chevron-down.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import "./SyllabusAccordion.css";

type SyllabusAccordionProps = {
  modules: SyllabusModule[];
};

export function SyllabusAccordion({ modules }: SyllabusAccordionProps) {
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
            <li key={module.title} className="syllabus__module">
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
                      {module.lessons.length} lecciones ·{" "}
                      {getModuleMinutes(module.lessons)} min
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
                    <li key={lesson.title} className="syllabus__lesson">
                      <img
                        className="syllabus__lesson-icon"
                        src={PlayIcon}
                        alt=""
                      />
                      <span className="syllabus__lesson-title">
                        {lesson.title}
                      </span>
                      <span className="syllabus__lesson-minutes">
                        {lesson.minutes} min
                      </span>
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
