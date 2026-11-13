import { useEffect } from "react";

import { supportEmail, termsSections, termsUpdatedAt } from "../content";
import "./Terms.css";

export function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <section className="terms-hero">
        <span className="fox terms-hero__fox" aria-hidden="true" />
        <div className="terms-hero__inner container">
          <h1 className="display terms-hero__title">Términos y condiciones</h1>
          <p className="terms-hero__updated">
            Última actualización: {termsUpdatedAt}
          </p>
        </div>
      </section>

      <div className="terms container">
        <nav className="terms__toc" aria-label="Secciones">
          <p className="terms__toc-title">En esta página</p>
          <ol className="terms__toc-list">
            {termsSections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="terms__toc-link">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="terms__body">
          {termsSections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="terms__section"
              aria-labelledby={`${section.id}-title`}
            >
              <h2 id={`${section.id}-title`} className="terms__section-title">
                <span className="terms__number num">{index + 1}.</span>
                {section.title}
              </h2>
              <p className="terms__text">
                {section.body}
                {section.id === "contacto" && (
                  <>
                    {" "}
                    <a href={`mailto:${supportEmail}`} className="terms__mail">
                      {supportEmail}
                    </a>
                    .
                  </>
                )}
              </p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
