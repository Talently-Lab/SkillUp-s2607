import { useEffect, useRef } from "react";

import { LessonVideo } from "@/shared/components/LessonVideo";
import type { Lesson } from "@/shared/types/lesson";
import CloseIcon from "@/assets/icons/close.svg";
import "./LessonPreviewModal.css";

type LessonPreviewModalProps = {
  lesson: Lesson;
  poster: string;
  onClose: () => void;
};

export function LessonPreviewModal({
  lesson,
  poster,
  onClose,
}: LessonPreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="lesson-preview"
      aria-labelledby="lesson-preview-title"
      onClose={onClose}
      // A click on the dialog itself (not its content) is a click on the backdrop
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="lesson-preview__panel">
        <header className="lesson-preview__header">
          <div>
            <p className="lesson-preview__eyebrow">Vista previa gratuita</p>
            <h2 id="lesson-preview-title" className="lesson-preview__title">
              {lesson.title}
            </h2>
          </div>
          <button
            type="button"
            className="lesson-preview__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <img
              className="lesson-preview__close-icon"
              src={CloseIcon}
              alt=""
            />
          </button>
        </header>
        <LessonVideo
          videoUrl={lesson.videoUrl}
          title={lesson.title}
          poster={poster}
        />
      </div>
    </dialog>
  );
}
