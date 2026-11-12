import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { Aurora, type AuroraHandle } from "@/shared/components/aurora/Aurora";
import { Icon } from "@/shared/components/Icon";
import type { Course } from "@/shared/types/course";
import heroGraduateAvif from "@/assets/images/hero-graduate.avif";
import heroGraduateWebp from "@/assets/images/hero-graduate.webp";
import { HEADLINE_WORDS, TRY_SUGGESTIONS } from "../content";
import { ArrowDownRight, Burst, PlayGlyph, Sparkle } from "./HandArrow";
import { TypingWord } from "./TypingWord";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

type HeroSectionProps = {
  /** Loaded courses, used to tell how many match the search */
  courses: Course[] | null;
};

export function HeroSection({ courses }: HeroSectionProps) {
  const navigate = useNavigate();
  const aurora = useRef<AuroraHandle | null>(null);
  const [query, setQuery] = useState("");
  const trimmed = query.replace(/\s+/g, " ").trim();
  const catalogLink = `/catalog?q=${encodeURIComponent(trimmed)}`;

  const matches =
    courses && trimmed.length > 1
      ? courses.filter((course) =>
          normalize(`${course.title} ${course.category}`).includes(
            normalize(trimmed),
          ),
        ).length
      : null;

  const update = (value: string) => {
    setQuery(value);
    aurora.current?.pulse();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(trimmed ? catalogLink : "/catalog");
  };

  return (
    <section className="hero aurora-host" aria-labelledby="hero-title">
      <Aurora shade="left" handleRef={aurora} />
      <div className="hero__inner container">
        <div className="hero__copy">
          <h1
            id="hero-title"
            className="hero__headline"
            aria-label="Aprendé hoy. Crecé con lo que sabés."
          >
            <span className="hero__l1" aria-hidden="true">
              Aprendé
            </span>
            <span className="hero__l2" aria-hidden="true">
              <TypingWord words={HEADLINE_WORDS} />
              <span className="hero__now">hoy.</span>
            </span>
            <span className="hero__l3" aria-hidden="true">
              Crecé con lo que sabés.
            </span>
          </h1>
          <p className="hero__lead">
            Cursos prácticos de tecnología y herramientas digitales, paso a
            paso y a tu ritmo. No necesitás experiencia previa.
          </p>

          <form className="hero-ask" role="search" onSubmit={submit}>
            <label htmlFor="hero-q">¿Qué querés aprender?</label>
            <div className="hero-ask__field">
              <Icon name="search" />
              <input
                id="hero-q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Excel, Python, diseño…"
                value={query}
                onChange={(event) => update(event.target.value)}
              />
              <button className="hero-ask__go" type="submit" aria-label="Buscar cursos">
                <Icon name="arrow" />
              </button>
            </div>
            <p className="hero-ask__hint" aria-live="polite">
              {trimmed &&
                (matches ? (
                  <>
                    <Link to={catalogLink}>
                      {matches} {matches === 1 ? "curso" : "cursos"} de {trimmed}
                    </Link>{" "}
                    en el catálogo
                  </>
                ) : (
                  <>
                    Buscá <Link to={catalogLink}>“{trimmed}”</Link> en todo el
                    catálogo
                  </>
                ))}
            </p>
            <div className="hero-ask__try" role="group" aria-label="Búsquedas populares">
              Probá con
              {TRY_SUGGESTIONS.map((word) => (
                <button
                  key={word}
                  type="button"
                  aria-pressed={normalize(word) === normalize(query)}
                  onClick={() => update(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </form>

          <div className="hero__extra">
            <a href="#como-funciona" className="hero__watch">
              <span className="hero__watch-icon">
                <PlayGlyph />
              </span>
              <span>
                Ver cómo funciona <small>(1 min)</small>
              </span>
            </a>
            <p className="hero__perks">
              12 cursos gratis · sin tarjeta · certificado al terminar
            </p>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <span className="hero-art__ring hero-art__ring--1" />
          <span className="hero-art__ring hero-art__ring--2" />
          <span className="hero-art__ring hero-art__ring--3" />
          {/* Cutout figure standing on the rings; attribution lives in SiteFooter */}
          <picture className="hero-art__figure">
            <source srcSet={heroGraduateAvif} type="image/avif" />
            <img src={heroGraduateWebp} alt="" width={907} height={1200} fetchPriority="high" />
          </picture>
          <Sparkle className="hero-art__spark hero-art__spark--1" />
          <Burst className="hero-art__spark hero-art__spark--2" />
          <Sparkle className="hero-art__spark hero-art__spark--3" />
          <p className="hero-art__note">
            vos también podés
            <ArrowDownRight />
          </p>
        </div>
      </div>
    </section>
  );
}
