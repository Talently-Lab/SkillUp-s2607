import type { SortKey, SortState } from "@/modules/admin/hooks/useAdminCourses";
import { isDraft } from "@/modules/admin/hooks/useAdminCourses";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { StatusBadge } from "@/modules/admin/components/StatusBadge";
import { courseRevenue } from "@/modules/admin/utils/metrics";
import type { Course } from "@/shared/types/course";
import {
  formatMoneyRounded,
  formatNumber,
  formatPrice,
} from "@/shared/utils/format";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import ArrowUpDownIcon from "@/assets/icons/arrow-up-down.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import PauseIcon from "@/assets/icons/pause.svg";
import PencilIcon from "@/assets/icons/pencil.svg";
import PlayIcon from "@/assets/icons/play-filled.svg";
import StarIcon from "@/assets/icons/star-filled.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import "./Button.css";
import "./CourseTable.css";

type CourseTableProps = {
  rows: Course[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onToggleStatus: (course: Course) => void;
};

export function CourseTable({
  rows,
  sort,
  onSort,
  onEdit,
  onDelete,
  onToggleStatus,
}: CourseTableProps) {
  const header = (label: string, key: SortKey, numeric = false) => (
    <SortHeader
      label={label}
      sortKey={key}
      sort={sort}
      onSort={onSort}
      numeric={numeric}
    />
  );

  return (
    <div className="course-table__scroll">
      <table className="course-table">
        <thead>
          <tr>
            {header("Curso", "title")}
            {header("Categoría", "category")}
            <th scope="col">Nivel</th>
            {header("Duración", "durationHours", true)}
            {header("Precio", "price", true)}
            {header("Inscritos", "students", true)}
            {header("Ingresos", "revenue", true)}
            <th scope="col">Estado</th>
            <th scope="col" className="course-table__actions-head">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((course) => (
            <tr key={course.id} onDoubleClick={() => onEdit(course)}>
              <td className="course-table__course">
                <div className="course-table__course-body">
                  <img
                    src={course.image}
                    alt=""
                    className="course-table__image"
                  />
                  <div className="course-table__identity">
                    <p className="course-table__title">
                      <span>{course.title}</span>
                      {course.featured && (
                        <img
                          src={StarIcon}
                          alt="Destacado"
                          title="Destacado"
                          className="course-table__star"
                        />
                      )}
                    </p>
                    <p className="course-table__instructor">
                      {course.instructor}
                    </p>
                  </div>
                </div>
              </td>
              <td data-label="Categoría">{course.category}</td>
              <td data-label="Nivel">{course.level}</td>
              <td data-label="Duración" className="course-table__numeric">
                {course.durationHours} h
              </td>
              <td
                data-label="Precio"
                className={`course-table__numeric ${course.price === null ? "course-table__free" : ""}`}
              >
                {formatPrice(course.price)}
              </td>
              <td data-label="Inscritos" className="course-table__numeric">
                {formatNumber(course.students)}
              </td>
              <td
                data-label="Ingresos"
                className="course-table__numeric course-table__revenue"
              >
                {course.price === null
                  ? "—"
                  : formatMoneyRounded(courseRevenue(course))}
              </td>
              <td className="course-table__status">
                <StatusBadge status={course.status} />
              </td>
              <td className="course-table__actions">
                <div className="course-table__buttons">
                  <button
                    type="button"
                    className={`admin-button admin-button--sm course-table__toggle ${isDraft(course) ? "admin-button--accent" : "admin-button--secondary"}`}
                    onClick={() => onToggleStatus(course)}
                  >
                    <MaskIcon src={isDraft(course) ? PlayIcon : PauseIcon} />
                    {isDraft(course) ? "Publicar" : "Pausar"}
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--sm admin-button--secondary course-table__edit"
                    onClick={() => onEdit(course)}
                    aria-label={`Editar ${course.title}`}
                    title="Editar"
                  >
                    <MaskIcon src={PencilIcon} />
                    <span className="course-table__edit-label">Editar</span>
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--icon admin-button--ghost-danger"
                    onClick={() => onDelete(course)}
                    aria-label={`Eliminar ${course.title}`}
                    title="Eliminar"
                  >
                    <MaskIcon src={TrashIcon} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type SortHeaderProps = {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  numeric: boolean;
  onSort: (key: SortKey) => void;
};

function SortHeader({
  label,
  sortKey,
  sort,
  numeric,
  onSort,
}: SortHeaderProps) {
  const active = sort.key === sortKey;
  const icon = !active
    ? ArrowUpDownIcon
    : sort.dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <th
      scope="col"
      className={numeric ? "course-table__numeric" : undefined}
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        className={`course-table__sort ${active ? "course-table__sort--active" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <MaskIcon src={icon} />
      </button>
    </th>
  );
}
