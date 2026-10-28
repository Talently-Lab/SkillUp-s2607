import { useState } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { InlineInput } from "@/modules/teacher/components/InlineInput";
import {
  formatSeconds,
  titleError,
  videoUrlError,
} from "@/modules/teacher/utils/syllabus";
import type { TeacherLesson } from "@/shared/types/teacher";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import PlayIcon from "@/assets/icons/play.svg";
import TrashIcon from "@/assets/icons/trash.svg";

type LessonRowProps = {
  lesson: TeacherLesson;
  /** "2.3": module and lesson number */
  number: string;
  isFirst: boolean;
  isLast: boolean;
  onRename: (title: string) => void;
  onVideoChange: (videoUrl: string | null) => Promise<void>;
  onMove: (step: -1 | 1) => void;
  onDelete: () => void;
};

function durationLabel(lesson: TeacherLesson): {
  text: string;
  hint: string;
} {
  if (lesson.durationSeconds)
    return {
      text: formatSeconds(lesson.durationSeconds),
      hint: "Duración leída del video",
    };
  if (lesson.videoUrl)
    return { text: "—", hint: "No pudimos leer la duración de este video" };

  return { text: "—", hint: "Añade un video para calcular la duración" };
}

export function LessonRow({
  lesson,
  number,
  isFirst,
  isLast,
  onRename,
  onVideoChange,
  onMove,
  onDelete,
}: LessonRowProps) {
  const [isReading, setIsReading] = useState(false);
  const duration = durationLabel(lesson);

  const changeVideo = async (videoUrl: string) => {
    setIsReading(true);
    await onVideoChange(videoUrl || null);
    setIsReading(false);
  };

  return (
    <li className="module-editor__lesson">
      <span className="module-editor__lesson-number">{number}</span>
      <label htmlFor={`lesson-title-${lesson.id}`} className="visually-hidden">
        Título de la lección {number}
      </label>
      <InlineInput
        id={`lesson-title-${lesson.id}`}
        value={lesson.title}
        validate={titleError}
        onSave={onRename}
        className="module-editor__input module-editor__lesson-title"
      />
      <span className="module-editor__duration" title={duration.hint}>
        {isReading ? "Leyendo…" : duration.text}
        <span className="visually-hidden">. {duration.hint}</span>
      </span>
      <div className="module-editor__lesson-actions">
        <button
          type="button"
          className="module-editor__icon-button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label={`Subir lección ${number}`}
        >
          <MaskIcon src={ArrowUpIcon} />
        </button>
        <button
          type="button"
          className="module-editor__icon-button"
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label={`Bajar lección ${number}`}
        >
          <MaskIcon src={ArrowDownIcon} />
        </button>
        <button
          type="button"
          className="module-editor__icon-button module-editor__icon-button--danger"
          onClick={onDelete}
          aria-label={`Eliminar lección ${number}`}
        >
          <MaskIcon src={TrashIcon} />
        </button>
      </div>
      <div className="module-editor__video">
        <MaskIcon src={PlayIcon} className="module-editor__video-icon" />
        <label
          htmlFor={`lesson-video-${lesson.id}`}
          className="visually-hidden"
        >
          Enlace del video de la lección {number}
        </label>
        <InlineInput
          id={`lesson-video-${lesson.id}`}
          type="url"
          inputMode="url"
          value={lesson.videoUrl ?? ""}
          validate={videoUrlError}
          onSave={changeVideo}
          placeholder="Enlace del video (YouTube, Vimeo o archivo)"
          className="module-editor__input module-editor__video-input"
        />
      </div>
    </li>
  );
}
