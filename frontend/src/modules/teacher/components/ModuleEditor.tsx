import { useState, type FormEvent } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import type { EditableLesson, EditableModule } from "@/modules/teacher/types";
import { moduleMinutes } from "@/modules/teacher/utils/syllabus";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import "./ModuleEditor.css";

type ModuleEditorProps = {
  module: EditableModule;
  index: number;
  total: number;
  autoFocusTitle: boolean;
  onRename: (title: string) => void;
  onMove: (step: -1 | 1) => void;
  onDelete: () => void;
  onLessonChange: (lessonId: string, patch: Partial<EditableLesson>) => void;
  onLessonMove: (lessonIndex: number, step: -1 | 1) => void;
  onLessonDelete: (lessonIndex: number) => void;
  onLessonAdd: (lesson: Omit<EditableLesson, "id">) => void;
};

const DEFAULT_MINUTES = 15;

export function ModuleEditor({
  module,
  index,
  total,
  autoFocusTitle,
  onRename,
  onMove,
  onDelete,
  onLessonChange,
  onLessonMove,
  onLessonDelete,
  onLessonAdd,
}: ModuleEditorProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState(String(DEFAULT_MINUTES));
  const lessonCount = module.lessons.length;
  const number = index + 1;

  const addLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newTitle.trim()) return;

    onLessonAdd({
      title: newTitle.trim(),
      minutes: Math.max(1, Number(newMinutes) || DEFAULT_MINUTES),
    });
    setNewTitle("");
  };

  return (
    <li className="module-editor">
      <div className="module-editor__header">
        <span className="module-editor__number">{number}</span>
        <div className="module-editor__heading">
          <label
            htmlFor={`module-title-${module.id}`}
            className="visually-hidden"
          >
            Título del módulo {number}
          </label>
          <input
            id={`module-title-${module.id}`}
            value={module.title}
            autoFocus={autoFocusTitle}
            onFocus={(event) => autoFocusTitle && event.target.select()}
            onChange={(event) => onRename(event.target.value)}
            onBlur={(event) =>
              !event.target.value.trim() && onRename("Módulo sin título")
            }
            className="module-editor__input module-editor__input--title"
          />
          <p className="module-editor__summary">
            {lessonCount} {lessonCount === 1 ? "lección" : "lecciones"} ·{" "}
            {moduleMinutes(module)} min
          </p>
        </div>
        <div className="module-editor__actions">
          <button
            type="button"
            className="module-editor__icon-button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Subir módulo ${number}`}
          >
            <MaskIcon src={ArrowUpIcon} />
          </button>
          <button
            type="button"
            className="module-editor__icon-button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Bajar módulo ${number}`}
          >
            <MaskIcon src={ArrowDownIcon} />
          </button>
          <button
            type="button"
            className="module-editor__delete"
            onClick={onDelete}
            aria-label={`Eliminar módulo ${number}`}
          >
            <MaskIcon src={TrashIcon} />
            <span className="module-editor__delete-label">Eliminar</span>
          </button>
        </div>
      </div>

      {lessonCount === 0 ? (
        <p className="module-editor__empty">
          Este módulo aún no tiene lecciones.
        </p>
      ) : (
        <ol className="module-editor__lessons">
          {module.lessons.map((lesson, lessonIndex) => (
            <li key={lesson.id} className="module-editor__lesson">
              <span className="module-editor__lesson-number">
                {number}.{lessonIndex + 1}
              </span>
              <label
                htmlFor={`lesson-title-${lesson.id}`}
                className="visually-hidden"
              >
                Título de la lección {number}.{lessonIndex + 1}
              </label>
              <input
                id={`lesson-title-${lesson.id}`}
                value={lesson.title}
                onChange={(event) =>
                  onLessonChange(lesson.id, { title: event.target.value })
                }
                onBlur={(event) =>
                  !event.target.value.trim() &&
                  onLessonChange(lesson.id, { title: "Lección sin título" })
                }
                className="module-editor__input module-editor__lesson-title"
              />
              <div className="module-editor__minutes">
                <label
                  htmlFor={`lesson-minutes-${lesson.id}`}
                  className="visually-hidden"
                >
                  Duración en minutos
                </label>
                <input
                  id={`lesson-minutes-${lesson.id}`}
                  type="number"
                  min={1}
                  value={lesson.minutes}
                  onChange={(event) =>
                    onLessonChange(lesson.id, {
                      minutes: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                  className="module-editor__input module-editor__input--minutes"
                />
                <span aria-hidden="true">min</span>
              </div>
              <div className="module-editor__lesson-actions">
                <button
                  type="button"
                  className="module-editor__icon-button"
                  onClick={() => onLessonMove(lessonIndex, -1)}
                  disabled={lessonIndex === 0}
                  aria-label="Subir lección"
                >
                  <MaskIcon src={ArrowUpIcon} />
                </button>
                <button
                  type="button"
                  className="module-editor__icon-button"
                  onClick={() => onLessonMove(lessonIndex, 1)}
                  disabled={lessonIndex === lessonCount - 1}
                  aria-label="Bajar lección"
                >
                  <MaskIcon src={ArrowDownIcon} />
                </button>
                <button
                  type="button"
                  className="module-editor__icon-button module-editor__icon-button--danger"
                  onClick={() => onLessonDelete(lessonIndex)}
                  aria-label="Eliminar lección"
                >
                  <MaskIcon src={TrashIcon} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={addLesson} className="module-editor__add">
        <MaskIcon src={PlusIcon} className="module-editor__add-icon" />
        <label htmlFor={`new-lesson-${module.id}`} className="visually-hidden">
          Nueva lección del módulo {number}
        </label>
        <input
          id={`new-lesson-${module.id}`}
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Añadir lección y pulsar Enter…"
          className="module-editor__input module-editor__add-title"
        />
        <div className="module-editor__minutes">
          <label
            htmlFor={`new-lesson-minutes-${module.id}`}
            className="visually-hidden"
          >
            Minutos de la nueva lección
          </label>
          <input
            id={`new-lesson-minutes-${module.id}`}
            type="number"
            min={1}
            value={newMinutes}
            onChange={(event) => setNewMinutes(event.target.value)}
            className="module-editor__input module-editor__input--minutes"
          />
          <span aria-hidden="true">min</span>
        </div>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="admin-button admin-button--sm admin-button--primary module-editor__add-submit"
        >
          Añadir
        </button>
      </form>
    </li>
  );
}
