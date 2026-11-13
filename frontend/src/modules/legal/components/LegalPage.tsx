import { useEffect } from "react";

import type { LegalDocument } from "../content";
import "./LegalPage.css";

export function LegalPage({ document }: { document: LegalDocument }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [document]);

  return (
    <>
      <section className="legal-hero">
        <span className="fox legal-hero__fox" aria-hidden="true" />
        <div className="legal-hero__inner container">
          <h1 className="display legal-hero__title">{document.title}</h1>
          <p className="legal-hero__updated">
            Última actualización: {document.updatedAt}
          </p>
        </div>
      </section>

      <div className="legal container">
        <nav className="legal__toc" aria-label="Secciones">
          <p className="legal__toc-title">En esta página</p>
          <ol className="legal__toc-list">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="legal__toc-link">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal__body">
          {document.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="legal__section"
              aria-labelledby={`${section.id}-title`}
            >
              <h2 id={`${section.id}-title`} className="legal__section-title">
                <span className="legal__number num">{index + 1}.</span>
                {section.title}
              </h2>
              <p className="legal__text">
                {section.body}
                {section.email && (
                  <>
                    {" "}
                    <a href={`mailto:${section.email}`} className="legal__mail">
                      {section.email}
                    </a>
                    {section.body.endsWith(":") ? "" : "."}
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
