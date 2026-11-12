import { useEffect, useRef, useState } from "react";

import { Icon } from "@/shared/components/Icon";
import posterImage from "@/assets/images/how-poster.jpg";
import { CHAPTERS } from "../content";
import { ArrowCurveDown, PlayGlyph } from "./HandArrow";

export function HowItWorks() {
  const [chapter, setChapter] = useState(0);
  const [open, setOpen] = useState(false);

  const play = (index = chapter) => {
    setChapter(index);
    setOpen(true);
  };

  return (
    <section className="how" id="como-funciona" aria-labelledby="how-title">
      <div className="container">
        <div className="landing-head landing-head--spaced">
          <div>
            <span className="eyebrow">Cómo funciona</span>
            <h2 id="how-title" className="display display-lg">
              Mirá cómo funciona en un minuto
            </h2>
            <p className="lead">
              De la búsqueda a tu primera clase, sin formularios eternos ni
              requisitos previos.
            </p>
          </div>
        </div>

        <div className="how__grid">
          <div className="how__poster-wrap">
            <p className="how__note" aria-hidden="true">
              dale play
              <ArrowCurveDown />
            </p>
            <div className="how__poster">
              <img src={posterImage} alt="" />
              <div className="how__poster-ui" aria-hidden="true">
                <div className="how__poster-bar">
                  <i />
                  <i />
                  <i />
                  <span>SkillUp Campus · Mis cursos</span>
                </div>
                <div className="how__poster-lesson">
                  <small>
                    Clase 4 de 12 · Análisis de Datos con Excel y Power BI
                  </small>
                  <strong>Tablas dinámicas en 10 minutos</strong>
                  <div className="how__poster-progress">
                    <i />
                  </div>
                </div>
              </div>
              <span className="how__duration" aria-hidden="true">
                1:00
              </span>
              <button
                type="button"
                className="how__play"
                onClick={() => play()}
                aria-label="Reproducir video: cómo funciona SkillUp Campus, 1 minuto"
              >
                <PlayGlyph />
              </button>
            </div>
          </div>

          <div>
            <ol className="how__chapters" aria-label="Capítulos del video">
              {CHAPTERS.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    className="chapter"
                    aria-current={chapter === index ? "step" : undefined}
                    onClick={() => play(index)}
                  >
                    <span className="chapter__n" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </span>
                    <span className="chapter__time">
                      <PlayGlyph />
                      {item.time}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="how__caption">
              Tocá un paso para ver esa parte del video.
            </p>
          </div>
        </div>
      </div>

      {open && <VideoDialog chapter={chapter} onClose={() => setOpen(false)} />}
    </section>
  );
}

function VideoDialog({
  chapter,
  onClose,
}: {
  chapter: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="video-modal"
      aria-labelledby="video-modal-title"
      onClose={onClose}
      // A click on the dialog itself (not its content) is a click on the backdrop
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="video-modal__head">
        <h2 id="video-modal-title">Cómo funciona SkillUp Campus</h2>
        <button
          type="button"
          className="video-modal__close"
          onClick={onClose}
          aria-label="Cerrar video"
        >
          <Icon name="plus" className="ico video-modal__x" />
        </button>
      </div>
      {/* Real video goes here: <video controls src="…"> and seek to CHAPTERS[chapter].time */}
      <div className="video-modal__player">
        <p>Acá va el video de SkillUp Campus</p>
        <small>
          Capítulo {chapter + 1} · desde {CHAPTERS[chapter].time}
        </small>
      </div>
    </dialog>
  );
}
