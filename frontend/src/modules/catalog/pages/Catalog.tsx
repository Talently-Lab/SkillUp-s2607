import { useState } from "react";

import { CourseCard } from "../../../shared/components/CourseCard";
import { courses } from "../../../shared/mocks/courses";
import { CatalogFilters } from "../components/CatalogFilters";
import { FilterDrawer } from "../components/FilterDrawer";
import { SortDropdown } from "../components/SortDropdown";
import { useCatalogFilters } from "../hooks/useCatalogFilters";
import CloseIcon from "../../../assets/icons/close.svg";
import SearchIcon from "../../../assets/icons/search.svg";
import SearchXIcon from "../../../assets/icons/search-x.svg";
import SlidersIcon from "../../../assets/icons/sliders.svg";
import "./Catalog.css";

export function Catalog() {
  const catalog = useCatalogFilters();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const resultCount = catalog.results.length;

  const renderFilters = (idPrefix: string) => (
    <CatalogFilters
      idPrefix={idPrefix}
      filters={catalog.filters}
      activeCount={catalog.activeCount}
      onToggleCategory={catalog.toggleCategory}
      onToggleLevel={catalog.toggleLevel}
      onPriceChange={catalog.setPrice}
      onDurationChange={catalog.setDuration}
      onReset={catalog.resetFilters}
    />
  );

  return (
    <div className="catalog">
      <section className="catalog-hero">
        <div className="catalog-hero__inner container">
          <h1 className="catalog-hero__title">Catálogo de cursos</h1>
          <p className="catalog-hero__subtitle">
            {courses.length} cursos online con certificado. Encuentra el tuyo y
            empieza hoy.
          </p>
          <div className="catalog-search">
            <label htmlFor="catalog-search" className="visually-hidden">
              Buscar cursos
            </label>
            <img className="catalog-search__icon" src={SearchIcon} alt="" />
            <input
              id="catalog-search"
              type="search"
              className="catalog-search__input"
              value={catalog.query}
              onChange={(event) => catalog.setQuery(event.target.value)}
              placeholder="Busca por tema, curso o docente…"
            />
            {catalog.query && (
              <button
                type="button"
                className="catalog-search__clear"
                onClick={() => catalog.setQuery("")}
                aria-label="Borrar búsqueda"
              >
                <img
                  className="catalog-search__clear-icon"
                  src={CloseIcon}
                  alt=""
                />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="catalog__layout container">
        <aside className="catalog__sidebar" aria-label="Filtros de cursos">
          <div className="catalog__sidebar-inner">{renderFilters("desk")}</div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="catalog__toolbar">
            <h2
              id="results-heading"
              className="catalog__count"
              aria-live="polite"
            >
              <strong>{resultCount}</strong>{" "}
              {resultCount === 1 ? "curso encontrado" : "cursos encontrados"}
            </h2>
            <div className="catalog__controls">
              <button
                type="button"
                className="catalog__filters-btn"
                onClick={() => setIsDrawerOpen(true)}
              >
                <img
                  className="catalog__filters-icon"
                  src={SlidersIcon}
                  alt=""
                />
                Filtros
                {catalog.activeCount > 0 && (
                  <span className="catalog__filters-badge">
                    {catalog.activeCount}
                  </span>
                )}
              </button>
              <SortDropdown value={catalog.sort} onChange={catalog.setSort} />
            </div>
          </div>

          {resultCount > 0 ? (
            <ul className="catalog__grid">
              {catalog.results.map((course) => (
                <li key={course.id}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="catalog-empty">
              <span className="catalog-empty__icon-wrap">
                <img className="catalog-empty__icon" src={SearchXIcon} alt="" />
              </span>
              <h3 className="catalog-empty__title">
                No encontramos cursos con esos criterios
              </h3>
              <p className="catalog-empty__text">
                Prueba con otra palabra clave o quita algunos filtros para ver
                más resultados.
              </p>
              <button
                type="button"
                className="catalog-empty__btn"
                onClick={catalog.resetAll}
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          )}
        </section>
      </div>

      <FilterDrawer
        open={isDrawerOpen}
        resultCount={resultCount}
        onClose={closeDrawer}
      >
        {renderFilters("mob")}
      </FilterDrawer>
    </div>
  );
}
