import type { CSSProperties } from "react";
import { Icon } from "@/shared/components/Icon";
import posterImage from "@/assets/images/how-poster.jpg";
import { ArrowSide } from "./HandArrow";

const NOTES_LEFT = [
  { pin: 1, text: "retomás justo donde lo dejaste", down: true },
  { pin: 4, text: "ves tu avance en cada curso", down: false },
];
const NOTES_RIGHT = [
  { pin: 2, text: "tu racha te empuja a volver", down: false },
  { pin: 3, text: "tu certificado, apenas terminás", down: true },
];

/** Mock of the student panel with handwritten notes */
export function ProductShowcase() {
  return (
    <section
      className="band band--white"
      id="producto"
      aria-labelledby="prod-title"
    >
      <div className="container">
        <div className="landing-head">
          <div>
            <span className="eyebrow">Tu campus</span>
            <h2 id="prod-title" className="display display-lg">
              Todo tu aprendizaje en un lugar
            </h2>
            <p className="lead">
              Un panel simple que te dice qué sigue, cuánto avanzaste y qué ya
              terminaste.
            </p>
          </div>
        </div>

        <div className="prod">
          <ol className="prod__notes prod__notes--left">
            {NOTES_LEFT.map((note) => (
              <li
                key={note.pin}
                className="pnote"
                style={{ "--pin": note.pin } as CSSProperties}
              >
                <span className="pin" aria-hidden="true">
                  {note.pin}
                </span>
                {note.text}
                <ArrowSide down={note.down} />
              </li>
            ))}
          </ol>

          <div className="mock" aria-hidden="true">
            <div className="mock__bar">
              <i />
              <i />
              <i />
              <span>SkillUp Campus · Panel del alumno</span>
            </div>
            <div className="mock__body">
              <p className="mock__hello">Hola de nuevo, Camila</p>
              <div className="m-card m-continue">
                <span className="pin">1</span>
                <img src={posterImage} alt="" />
                <div>
                  <span className="m-eyebrow">Seguí donde quedaste</span>
                  <strong>Análisis de Datos con Excel y Power BI</strong>
                  <small>Módulo 3 · Tablas dinámicas</small>
                  <div className="m-bar">
                    <i style={{ width: "62%" }} />
                  </div>
                  <span className="m-fake-btn">Continuar clase</span>
                </div>
              </div>
              <div className="m-side">
                <div className="m-card">
                  <span className="pin">2</span>
                  <span className="m-title">Racha semanal</span>
                  <span className="m-big num">5 días</span>
                  <div className="m-days">
                    {[1, 1, 1, 1, 1, 0, 0].map((on, index) => (
                      <i key={index} className={on ? "on" : undefined} />
                    ))}
                  </div>
                </div>
                <div className="m-card m-cert">
                  <span className="pin">3</span>
                  <span className="seal">
                    <Icon name="cert" />
                  </span>
                  <div>
                    <strong>Certificado listo</strong>
                    <small>Fundamentos de UX/UI</small>
                  </div>
                </div>
              </div>
              <div className="m-card m-courses">
                <span className="pin">4</span>
                {[
                  ["Análisis de Datos con Excel y Power BI", 62],
                  ["Python desde cero", 28],
                  ["Fundamentos de Diseño UX/UI", 100],
                ].map(([title, value]) => (
                  <div key={title} className="m-row">
                    <span>{title}</span>
                    <div className="m-bar">
                      <i style={{ width: `${value}%` }} />
                    </div>
                    <b className="num">{value}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ol className="prod__notes prod__notes--right">
            {NOTES_RIGHT.map((note) => (
              <li
                key={note.pin}
                className="pnote"
                style={{ "--pin": note.pin } as CSSProperties}
              >
                <ArrowSide down={note.down} flip />
                <span className="pin" aria-hidden="true">
                  {note.pin}
                </span>
                {note.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
