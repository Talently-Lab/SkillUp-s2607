import { useEffect, useState } from "react";

import { CourseFormModal } from "@/modules/admin/components/CourseFormModal";
import { CourseTable } from "@/modules/admin/components/CourseTable";
import { CourseTableToolbar } from "@/modules/admin/components/CourseTableToolbar";
import { DeleteCourseModal } from "@/modules/admin/components/DeleteCourseModal";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import {
  isDraft,
  useAdminCourses,
} from "@/modules/admin/hooks/useAdminCourses";
import { courseRevenue } from "@/modules/admin/utils/metrics";
import type { Course, CourseInput } from "@/shared/types/course";
import { formatMoneyRounded, formatNumber } from "@/shared/utils/format";
import PlusIcon from "@/assets/icons/plus.svg";
import SearchXIcon from "@/assets/icons/search-x.svg";
import "@/modules/admin/components/Button.css";
import "./AdminCourses.css";

type FormTarget = { mode: "create" } | { mode: "edit"; course: Course } | null;

const NOTICE_MS = 4000;

export function AdminCourses() {
  const table = useAdminCourses();
  const { courses } = table;
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const totalStudents = courses.reduce(
    (total, course) => total + course.students,
    0,
  );
  const totalRevenue = courses.reduce(
    (total, course) => total + courseRevenue(course),
    0,
  );

  const handleSave = (input: CourseInput) => {
    if (formTarget?.mode === "edit") {
      table.updateCourse(formTarget.course.id, input);
      setNotice(`Cambios guardados en “${input.title}”.`);
    } else {
      table.createCourse(input);
      setNotice(
        input.status === "published"
          ? `“${input.title}” se creó y publicó.`
          : `“${input.title}” se creó como borrador.`,
      );
    }
    setFormTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    table.deleteCourse(deleteTarget.id);
    setNotice(`“${deleteTarget.title}” se eliminó.`);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (course: Course) => {
    table.toggleStatus(course.id);
    setNotice(
      isDraft(course)
        ? `“${course.title}” ya está publicado.`
        : `“${course.title}” pasó a borrador.`,
    );
  };

  const openCreate = () => setFormTarget({ mode: "create" });

  return (
    <div className="admin-courses">
      <header className="admin-courses__header">
        <div>
          <h1 className="admin-courses__title">Cursos</h1>
          <p className="admin-courses__subtitle">
            {courses.length} cursos en la plataforma ·{" "}
            {formatNumber(totalStudents)} inscripciones ·{" "}
            {formatMoneyRounded(totalRevenue)} en ingresos
          </p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--accent"
          onClick={openCreate}
        >
          <MaskIcon src={PlusIcon} />
          Crear curso
        </button>
      </header>

      <section aria-label="Listado de cursos" className="admin-courses__panel">
        <CourseTableToolbar
          query={table.query}
          category={table.category}
          status={table.status}
          counts={table.counts}
          onQueryChange={table.setQuery}
          onCategoryChange={table.setCategory}
          onStatusChange={table.setStatus}
        />

        {table.rows.length > 0 ? (
          <CourseTable
            rows={table.rows}
            sort={table.sort}
            onSort={table.toggleSort}
            onEdit={(course) => setFormTarget({ mode: "edit", course })}
            onDelete={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="admin-courses__empty">
            <MaskIcon src={SearchXIcon} className="admin-courses__empty-icon" />
            <p className="admin-courses__empty-title">
              {courses.length === 0
                ? "Todavía no hay cursos"
                : "Ningún curso coincide con los filtros"}
            </p>
            <p className="admin-courses__empty-text">
              {courses.length === 0
                ? "Crea el primero para que aparezca en el catálogo."
                : "Ajusta la búsqueda o los filtros."}
            </p>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={courses.length === 0 ? openCreate : table.resetFilters}
            >
              {courses.length === 0 ? "Crear curso" : "Limpiar filtros"}
            </button>
          </div>
        )}

        <footer className="admin-courses__footer">
          <span>
            Mostrando {table.rows.length} de {courses.length}
          </span>
          <span className="admin-courses__hint">
            Doble clic en una fila para editar
          </span>
        </footer>
      </section>

      <p className="admin-courses__note">
        Los cursos son de demostración: los cambios se pierden al recargar la
        página.
      </p>

      <div className="admin-courses__notice" role="status" aria-live="polite">
        {notice && <p className="admin-courses__notice-text">{notice}</p>}
      </div>

      {formTarget && (
        <CourseFormModal
          course={formTarget.mode === "edit" ? formTarget.course : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteCourseModal
          course={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
