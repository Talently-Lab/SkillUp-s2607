import { categories, courses } from "../../../shared/mocks/courses";
import type { CourseLevel } from "../../../shared/types/course";
import {
  durationOptions,
  levels,
  priceOptions,
  type DurationFilter,
  type PriceFilter,
} from "../constants/filters";
import type { CatalogFilterState } from "../hooks/useCatalogFilters";
import "./CatalogFilters.css";

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  activeCount: number;
  onToggleCategory: (category: string) => void;
  onToggleLevel: (level: CourseLevel) => void;
  onPriceChange: (price: PriceFilter) => void;
  onDurationChange: (duration: DurationFilter) => void;
  onReset: () => void;
  /** Keeps input ids unique when the panel renders twice (desktop + drawer) */
  idPrefix: string;
};

const categoryCounts = courses.reduce<Record<string, number>>(
  (acc, course) => {
    acc[course.category] = (acc[course.category] ?? 0) + 1;
    return acc;
  },
  {},
);

export function CatalogFilters({
  filters,
  activeCount,
  onToggleCategory,
  onToggleLevel,
  onPriceChange,
  onDurationChange,
  onReset,
  idPrefix,
}: CatalogFiltersProps) {
  return (
    <div className="catalog-filters">
      <div className="catalog-filters__header">
        <h2 className="catalog-filters__title">Filtros</h2>
        {activeCount > 0 && (
          <button
            type="button"
            className="catalog-filters__reset"
            onClick={onReset}
          >
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      <fieldset className="catalog-filters__group">
        <legend className="catalog-filters__legend">Categoría</legend>
        <div className="catalog-filters__options">
          {categories.map((category) => {
            const id = `${idPrefix}-cat-${category}`;
            return (
              <label key={category} htmlFor={id} className="catalog-filters__option">
                <input
                  id={id}
                  type="checkbox"
                  className="catalog-filters__input"
                  checked={filters.categories.includes(category)}
                  onChange={() => onToggleCategory(category)}
                />
                <span className="catalog-filters__label">{category}</span>
                <span className="catalog-filters__count">
                  {categoryCounts[category] ?? 0}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="catalog-filters__group">
        <legend className="catalog-filters__legend">Nivel</legend>
        <div className="catalog-filters__options">
          {levels.map((level) => {
            const id = `${idPrefix}-lvl-${level}`;
            return (
              <label key={level} htmlFor={id} className="catalog-filters__option">
                <input
                  id={id}
                  type="checkbox"
                  className="catalog-filters__input"
                  checked={filters.levels.includes(level)}
                  onChange={() => onToggleLevel(level)}
                />
                <span className="catalog-filters__label">{level}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="catalog-filters__group">
        <legend className="catalog-filters__legend">Precio</legend>
        <div className="catalog-filters__segmented">
          {priceOptions.map((option) => {
            const isActive = filters.price === option.value;
            return (
              <label
                key={option.value}
                className={
                  isActive
                    ? "catalog-filters__segment catalog-filters__segment--active"
                    : "catalog-filters__segment"
                }
              >
                <input
                  type="radio"
                  className="visually-hidden"
                  name={`${idPrefix}-price`}
                  value={option.value}
                  checked={isActive}
                  onChange={() => onPriceChange(option.value)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="catalog-filters__group">
        <legend className="catalog-filters__legend">Duración</legend>
        <div className="catalog-filters__options">
          {durationOptions.map((option) => {
            const id = `${idPrefix}-dur-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={id}
                className="catalog-filters__option"
              >
                <input
                  id={id}
                  type="radio"
                  className="catalog-filters__input"
                  name={`${idPrefix}-duration`}
                  checked={filters.duration === option.value}
                  onChange={() => onDurationChange(option.value)}
                />
                <span className="catalog-filters__label">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
