import { useState } from "react";

import { CourseCard } from "@/shared/components/CourseCard";
import { PageLoader } from "@/shared/components/Loader";
import { useFetch } from "@/shared/hooks/useFetch";
import { categoriesService } from "@/shared/services/categoriesService";
import { coursesService } from "@/shared/services/coursesService";
import { enrollmentsService } from "@/shared/services/enrollmentsService";
import { useAuthStore } from "@/shared/stores/authStore";
import { CatalogFilters } from "@/modules/catalog/components/CatalogFilters";
import { FilterDrawer } from "@/modules/catalog/components/FilterDrawer";
import { SortDropdown } from "@/modules/catalog/components/SortDropdown";
import { useCatalogFilters } from "@/modules/catalog/hooks/useCatalogFilters";
import AlertTriangleIcon from "@/assets/icons/alert-triangle.svg";
import CloseIcon from "@/assets/icons/close.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SearchXIcon from "@/assets/icons/search-x.svg";
import SlidersIcon from "@/assets/icons/sliders.svg";
import "./Catalog.css";

export function Catalog() {
  const coursesQuery = useFetch("catalog-courses", coursesService.list);
  const categoriesQuery = useFetch("categories", categoriesService.list);
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.role === "student";
  // Not awaited by the page: if it fails the cards just show no enrollment
  const enrollmentsQuery = useFetch(
    `catalog-enrollments-${user?.id ?? "guest"}`,
    async () => (isStudent ? enrollmentsService.listMine() : []),
  );
  const enrollmentByCourse = new Map(
    (enrollmentsQuery.data ?? []).map((item) => [item.courseId, item]),
  );
  const courses = coursesQuery.data ?? [];
  const catalog = useCatalogFilters(courses);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const resultCount = catalog.results.length;

  // Without the categories endpoint the filter still works with the loaded courses
  const categories =
    categoriesQuery.data?.map((category) => category.name) ??
    [...new Set(courses.map((course) => course.category))];
  const categoryCounts = courses.reduce<Record<string, number>>(
    (acc, course) => {
      acc[course.category] = (acc[course.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const renderFilters = (idPrefix: string) => (
    <CatalogFilters
      idPrefix={idPrefix}
      categories={categories}
      categoryCounts={categoryCounts}
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
            {coursesQuery.data ? `${courses.length} cursos` : "Cursos"} online
            con certificado. Encuentra el tuyo y empieza hoy.
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
              {coursesQuery.data ? (
                <>
                  <strong>{resultCount}</strong>{" "}
                  {resultCount === 1 ? "curso encontrado" : "cursos encontrados"}
                </>
              ) : (
                "Cursos"
              )}
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

          {coursesQuery.isLoading ? (
            <PageLoader label="Cargando cursos…" />
          ) : coursesQuery.error ? (
            <div className="catalog-empty" role="alert">
              <span className="catalog-empty__icon-wrap">
                <img
                  className="catalog-empty__icon"
                  src={AlertTriangleIcon}
                  alt=""
                />
              </span>
              <h3 className="catalog-empty__title">
                No pudimos cargar los cursos
              </h3>
              <p className="catalog-empty__text">
                Revisa tu conexión e inténtalo de nuevo en unos segundos.
              </p>
              <button
                type="button"
                className="catalog-empty__btn"
                onClick={coursesQuery.retry}
              >
                Reintentar
              </button>
            </div>
          ) : resultCount > 0 ? (
            <ul className="catalog__grid">
              {catalog.results.map((course) => (
                <li key={course.id}>
                  <CourseCard
                    course={course}
                    enrollment={enrollmentByCourse.get(course.id)}
                  />
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
