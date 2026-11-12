import { COMPANIES, QUOTES } from "../content";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

/** Testimonials with the lead metric and the companies row */
export function Testimonials() {
  return (
    <section className="band band--soft" aria-labelledby="quotes-title">
      <div className="container">
        <div className="landing-head">
          <div>
            <span className="eyebrow">Historias reales</span>
            <h2 id="quotes-title" className="display display-lg">
              Lo que dicen quienes ya empezaron
            </h2>
          </div>
        </div>
        <div className="quotes">
          {QUOTES.map((quote, index) => (
            <figure
              key={quote.name}
              className={index === 0 ? "quote quote--big" : "quote"}
            >
              {quote.metric && (
                <p className="quote__metric">
                  <strong className="num">{quote.metric.value}</strong>
                  <span>{quote.metric.label}</span>
                </p>
              )}
              <blockquote>“{quote.text}”</blockquote>
              <figcaption className="quote__who">
                <i style={{ background: quote.tint }} aria-hidden="true">
                  {initials(quote.name)}
                </i>
                <div>
                  <strong>{quote.name}</strong>
                  <small>{quote.role}</small>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="companies">
          <span>Nuestros egresados trabajan en</span>
          <ul aria-label="Empresas de ejemplo">
            {COMPANIES.map((name, index) => (
              <li key={name} className={`companies__w${index + 1}`}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
