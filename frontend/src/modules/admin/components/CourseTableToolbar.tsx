import type { StatusFilter } from "@/modules/admin/hooks/useAdminCourses";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import CloseIcon from "@/assets/icons/close.svg";
import SearchIcon from "@/assets/icons/search.svg";
import "./TableToolbar.css";

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
];

type CourseTableToolbarProps = {
  categories: string[];
  query: string;
  category: string;
  status: StatusFilter;
  counts: Record<StatusFilter, number>;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

export function CourseTableToolbar({
  categories,
  query,
  category,
  status,
  counts,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
}: CourseTableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div
        className="table-toolbar__tabs"
        role="radiogroup"
        aria-label="Estado"
      >
        {statusTabs.map((tab) => (
          <label key={tab.value} className="table-toolbar__tab">
            <input
              type="radio"
              name="course-status"
              value={tab.value}
              checked={status === tab.value}
              onChange={() => onStatusChange(tab.value)}
              className="visually-hidden"
            />
            {tab.label}
            <span className="table-toolbar__count">{counts[tab.value]}</span>
          </label>
        ))}
      </div>

      <div className="table-toolbar__filters">
        <label htmlFor="course-category" className="visually-hidden">
          Categoría
        </label>
        <select
          id="course-category"
          className="table-toolbar__select"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>

        <div className="table-toolbar__search">
          <label htmlFor="course-search" className="visually-hidden">
            Buscar cursos
          </label>
          <MaskIcon src={SearchIcon} className="table-toolbar__search-icon" />
          <input
            id="course-search"
            type="search"
            className="table-toolbar__input"
            placeholder="Buscar por título o docente"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className="table-toolbar__clear"
              onClick={() => onQueryChange("")}
              aria-label="Borrar búsqueda"
            >
              <MaskIcon src={CloseIcon} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
