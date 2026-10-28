import { useState, type FormEvent } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { InlineInput } from "@/modules/teacher/components/InlineInput";
import { LessonRow } from "@/modules/teacher/components/LessonRow";
import {
  formatSeconds,
  moduleSeconds,
  titleError,
  videoUrlError,
} from "@/modules/teacher/utils/syllabus";
import type { TeacherLesson, TeacherModule } from "@/shared/types/teacher";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import "./ModuleEditor.css";

type ModuleEditorProps = {
  module: TeacherModule;
  index: number;
  total: number;
  autoFocusTitle: boolean;
  onRename: (title: string) => void;
  onMove: (step: -1 | 1) => void;
  onDelete: () => void;
  onLessonRename: (lessonId: string, title: string) => void;
  onLessonVideoChange: (
    lessonId: string,
    videoUrl: string | null,
  ) => Promise<void>;
  onLessonMove: (lessonId: string, step: -1 | 1) => void;
  onLessonDelete: (lesson: TeacherLesson) => void;
  /** Resolves with false if it couldn't be saved */
  onLessonAdd: (lesson: {
    title: string;
    videoUrl: string | null;
  }) => Promise<boolean>;
};

export function ModuleEditor({
  module,
  index,
  total,
  autoFocusTitle,
  onRename,
  onMove,
  onDelete,
  onLessonRename,
  onLessonVideoChange,
  onLessonMove,
  onLessonDelete,
  onLessonAdd,
}: ModuleEditorProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const lessonCount = module.lessons.length;
  const number = index + 1;

  const addLesson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isAdding) return;

    const title = newTitle.trim();
    const videoUrl = newVideoUrl.trim();
    const error = titleError(title) ?? videoUrlError(videoUrl);
    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    setIsAdding(true);
    const added = await onLessonAdd({ title, videoUrl: videoUrl || null });
    setIsAdding(false);
    if (!added) return;

    setNewTitle("");
    setNewVideoUrl("");
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
          <InlineInput
            id={`module-title-${module.id}`}
            value={module.title}
            validate={titleError}
            onSave={onRename}
            autoFocus={autoFocusTitle}
            onFocus={(event) => autoFocusTitle && event.target.select()}
            className="module-editor__input module-editor__input--title"
          />
          <p className="module-editor__summary">
            {lessonCount} {lessonCount === 1 ? "lección" : "lecciones"} ·{" "}
            {formatSeconds(moduleSeconds(module))}
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
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              number={`${number}.${lessonIndex + 1}`}
              isFirst={lessonIndex === 0}
              isLast={lessonIndex === lessonCount - 1}
              onRename={(title) => onLessonRename(lesson.id, title)}
              onVideoChange={(videoUrl) =>
                onLessonVideoChange(lesson.id, videoUrl)
              }
              onMove={(step) => onLessonMove(lesson.id, step)}
              onDelete={() => onLessonDelete(lesson)}
            />
          ))}
        </ol>
      )}

      <form onSubmit={addLesson} className="module-editor__add" noValidate>
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
        <label
          htmlFor={`new-lesson-video-${module.id}`}
          className="visually-hidden"
        >
          Enlace del video de la nueva lección (opcional)
        </label>
        <input
          id={`new-lesson-video-${module.id}`}
          type="url"
          inputMode="url"
          value={newVideoUrl}
          onChange={(event) => setNewVideoUrl(event.target.value)}
          placeholder="Enlace del video (opcional)"
          className="module-editor__input module-editor__add-video"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isAdding}
          className="admin-button admin-button--sm admin-button--primary module-editor__add-submit"
        >
          {isAdding ? "Añadiendo…" : "Añadir"}
        </button>
        {formError && (
          <p className="module-editor__add-error" role="alert">
            {formError}
          </p>
        )}
      </form>
    </li>
  );
}
