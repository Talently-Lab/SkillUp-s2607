import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router";

import { CourseCard, CourseCardSkeleton } from "@/shared/components/CourseCard";
import { Icon } from "@/shared/components/Icon";
import { useDelayedFlag } from "@/shared/hooks/useDelayedFlag";
import type { Course } from "@/shared/types/course";
import { areaStyle } from "../content";
import { ArrowUpLeft } from "./HandArrow";

const LIMIT = 4;

const TABS = [
  { id: "popular", label: "Más elegidos" },
  { id: "free", label: "Gratis" },
  { id: "new", label: "Nuevos" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function pickCourses(courses: Course[], tab: TabId, area: string | null) {
  const inArea = area ? courses.filter((c) => c.category === area) : courses;
  if (tab === "free")
    return inArea.filter((c) => c.price === null).slice(0, LIMIT);

  if (tab === "new") return inArea.slice(0, LIMIT);
  return [...inArea].sort((a, b) => b.students - a.students).slice(0, LIMIT);
}

function summary(count: number, tab: TabId, area: string | null) {
  const where = area ? ` de ${area}` : "";
  if (tab === "popular")
    return `${count === 1 ? "El curso más elegido" : `Los ${count} cursos más elegidos`}${where}`;

  if (tab === "free")
    return `${count} ${count === 1 ? "curso gratis" : "cursos gratis"}${where}`;

  return `${count} ${count === 1 ? "curso nuevo" : "cursos nuevos"}${where}`;
}

type FeaturedCoursesProps = {
  courses: Course[] | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
};

/** Lavender band with area chips + tabs that filter the grid */
export function FeaturedCourses({
  courses,
  isLoading,
  error,
  onRetry,
}: FeaturedCoursesProps) {
  const [tab, setTab] = useState<TabId>("popular");
  const [area, setArea] = useState<string | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const allChip = useRef<HTMLButtonElement>(null);
  const showSkeleton = useDelayedFlag(isLoading);

  const all = courses ?? [];
  const areas = Object.entries(
    all.reduce<Record<string, number>>((acc, course) => {
      acc[course.category] = (acc[course.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const results = pickCourses(all, tab, area);
  const highlightTop = tab === "popular" && area === null && results.length > 0;

  const onTabKey = (event: KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const reset = () => {
    setArea(null);
    setTab("popular");
    allChip.current?.focus();
  };

  return (
    <section className="feat" id="cursos" aria-labelledby="featured-title">
      <span className="feat__blob" aria-hidden="true" />
      <div className="container">
        <div className="landing-head">
          <div>
            <span className="eyebrow">Cursos destacados</span>
            <h2 id="featured-title" className="display display-lg">
              Encontrá tu próximo curso
            </h2>
            <p className="lead">
              Elegí un área y mirá lo más elegido, lo gratis o lo nuevo.
            </p>
          </div>
          <Link to="/catalog" className="landing-link">
            Ver todo el catálogo <Icon name="arrow" />
          </Link>
        </div>

        {areas.length > 0 && (
          <div
            className="feat__areas"
            role="group"
            aria-label="Filtrar por área"
          >
            <button
              ref={allChip}
              type="button"
              className="area-chip"
              aria-pressed={area === null}
              onClick={() => setArea(null)}
            >
              <span
                className="area-chip__icon"
                style={{ background: "var(--surface-2)", color: "var(--ink)" }}
                aria-hidden="true"
              >
                <Icon name="grid" />
              </span>
              Todas
            </button>
            {areas.map(([name, count]) => {
              const style = areaStyle(name);
              return (
                <button
                  key={name}
                  type="button"
                  className="area-chip"
                  aria-pressed={area === name}
                  onClick={() => setArea(name)}
                >
                  <span
                    className="area-chip__icon"
                    style={{ background: style.bg, color: style.fg }}
                    aria-hidden="true"
                  >
                    <Icon name={style.icon} />
                  </span>
                  {name}{" "}
                  <small>
                    <span className="num">{count}</span>
                    <span className="visually-hidden"> cursos</span>
                  </small>
                </button>
              );
            })}
          </div>
        )}

        <div className="feat__bar">
          <div className="tabs" role="tablist" aria-label="Ordenar cursos">
            {TABS.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`feat-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls="feat-panel"
                tabIndex={tab === item.id ? 0 : -1}
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => onTabKey(event, index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {courses && (
            <p className="feat__count" aria-live="polite">
              {summary(results.length, tab, area)}
            </p>
          )}
        </div>

        <div
          id="feat-panel"
          role="tabpanel"
          aria-labelledby={`feat-tab-${tab}`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            showSkeleton && (
              <ul className="feat__grid">
                {Array.from({ length: LIMIT }, (_, index) => (
                  <li key={index}>
                    <CourseCardSkeleton />
                  </li>
                ))}
              </ul>
            )
          ) : error ? (
            <div className="feat__empty" role="alert">
              <p>No pudimos cargar los cursos</p>
              <span>Revisá tu conexión y probá de nuevo.</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onRetry}
              >
                Reintentar
              </button>
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="feat__grid">
                {results.map((course, index) => (
                  <li key={course.id}>
                    <CourseCard
                      course={course}
                      ribbon={
                        highlightTop && index === 0 ? "#1 del mes" : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
              {highlightTop && (
                <p className="feat__note" aria-hidden="true">
                  <ArrowUpLeft />
                  el favorito de los que arrancan de cero
                </p>
              )}
            </>
          ) : (
            <div className="feat__empty">
              <p>Todavía no hay cursos acá</p>
              <span>Probá con otra área o mirá todo el catálogo.</span>
              <div className="feat__empty-actions">
                <button type="button" className="btn btn-soft" onClick={reset}>
                  Ver todas las áreas
                </button>
                <Link to="/catalog" className="btn btn-primary">
                  Ver todo el catálogo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
