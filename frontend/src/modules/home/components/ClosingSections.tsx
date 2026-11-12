import { Link } from "react-router";

import { Icon } from "@/shared/components/Icon";
import { ArrowUpLeft } from "./HandArrow";

/** Second path, for people who teach */
export function TeachBand() {
  return (
    <section className="landing-block" aria-labelledby="teach-title">
      <div className="container">
        <div className="teach">
          <div>
            <span className="eyebrow">Para docentes</span>
            <h2 id="teach-title" className="display display-md">
              ¿Sabés algo que otros quieren aprender?
            </h2>
            <p>
              Armá tu curso con el editor de temario, seguí el avance de tus
              alumnos y cobrá por cada inscripción.
            </p>
          </div>
          <Link to="/login" className="btn btn-outline">
            Enseñá en SkillUp
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Closing call to action */
export function ClosingCta() {
  return (
    <section className="landing-block" aria-labelledby="cta-title">
      <div className="container">
        <div className="closing">
          <span className="fox closing__fox" aria-hidden="true" />
          <div>
            <h2 id="cta-title" className="display display-lg">
              Tu próximo curso empieza hoy
            </h2>
            <p>
              Creá tu cuenta gratis y accedé a los cursos sin costo desde el
              primer día.
            </p>
            <div className="closing__actions">
              <Link to="/register" className="btn btn-teal">
                Empezá gratis <Icon name="arrow" />
              </Link>
              <Link to="/catalog" className="btn btn-outline-light">
                Ver cursos gratuitos
              </Link>
            </div>
            <p className="closing__note" aria-hidden="true">
              <ArrowUpLeft />
              te lleva un minuto
            </p>
          </div>
          <ul>
            {[
              "Sin tarjeta de crédito",
              "Certificado al terminar",
              "Desde cualquier dispositivo",
            ].map((item) => (
              <li key={item}>
                <Icon name="check-circle" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
