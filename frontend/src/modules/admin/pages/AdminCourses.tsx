import { useCallback, useState } from "react";

import { CourseFormModal } from "@/modules/admin/components/CourseFormModal";
import { CourseTable } from "@/modules/admin/components/CourseTable";
import { CourseTableToolbar } from "@/modules/admin/components/CourseTableToolbar";
import { DeleteCourseModal } from "@/modules/admin/components/DeleteCourseModal";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { Notice, type NoticeContent } from "@/modules/admin/components/Notice";
import {
  isDraft,
  useAdminCourses,
} from "@/modules/admin/hooks/useAdminCourses";
import { courseErrorMessage } from "@/modules/admin/utils/courseErrorMessage";
import { courseRevenue } from "@/modules/admin/utils/metrics";
import { PageLoader } from "@/shared/components/Loader";
import { useFetch } from "@/shared/hooks/useFetch";
import { adminUsersService } from "@/shared/services/adminUsersService";
import { categoriesService } from "@/shared/services/categoriesService";
import type { Course, CourseInput } from "@/shared/types/course";
import { formatMoneyRounded, formatNumber } from "@/shared/utils/format";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import SearchXIcon from "@/assets/icons/search-x.svg";
import "@/modules/admin/components/Button.css";
import "./AdminPage.css";

type FormTarget = { mode: "create" } | { mode: "edit"; course: Course } | null;

export function AdminCourses() {
  const table = useAdminCourses();
  const { courses } = table;
  const categoriesQuery = useFetch("categories", categoriesService.list);
  const teachersQuery = useFetch("teachers", adminUsersService.listTeachers);
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<NoticeContent | null>(null);
  const showNotice = (message: string) => setNotice({ message });
  const dismissNotice = useCallback(() => setNotice(null), []);

  const totalStudents = courses.reduce(
    (total, course) => total + course.students,
    0,
  );
  const totalRevenue = courses.reduce(
    (total, course) => total + courseRevenue(course),
    0,
  );

  const categories = categoriesQuery.data ?? [];
  // Without the categories endpoint the filter still works with the loaded courses
  const categoryNames =
    categoriesQuery.data?.map((category) => category.name) ??
    [...new Set(courses.map((course) => course.category))];

  // Errors reach the form, which shows them and stays open
  const handleSave = async (input: CourseInput) => {
    if (formTarget?.mode === "edit") {
      await table.updateCourse(formTarget.course.id, input);
      showNotice(`Cambios guardados en “${input.title}”.`);
    } else {
      await table.createCourse(input);
      showNotice(
        input.status === "published"
          ? `“${input.title}” se creó y publicó.`
          : `“${input.title}” se creó como borrador.`,
      );
    }
    setFormTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await table.deleteCourse(deleteTarget.id);
      showNotice(`“${deleteTarget.title}” se eliminó.`);
    } catch (error) {
      showNotice(courseErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      await table.toggleStatus(course);
      showNotice(
        isDraft(course)
          ? `“${course.title}” ya está publicado.`
          : `“${course.title}” pasó a borrador.`,
      );
    } catch (error) {
      showNotice(courseErrorMessage(error));
    }
  };

  const openCreate = () => setFormTarget({ mode: "create" });

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Cursos</h1>
          <p className="admin-page__subtitle">
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

      <section aria-label="Listado de cursos" className="admin-page__panel">
        <CourseTableToolbar
          categories={categoryNames}
          query={table.query}
          category={table.category}
          status={table.status}
          counts={table.counts}
          onQueryChange={table.setQuery}
          onCategoryChange={table.setCategory}
          onStatusChange={table.setStatus}
        />

        {table.isLoading ? (
          <PageLoader label="Cargando cursos…" />
        ) : table.hasError ? (
          <div className="admin-page__empty" role="alert">
            <MaskIcon src={AlertIcon} className="admin-page__empty-icon" />
            <p className="admin-page__empty-title">
              No pudimos cargar los cursos
            </p>
            <p className="admin-page__empty-text">
              Revisa tu conexión e inténtalo de nuevo.
            </p>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={table.reload}
            >
              Reintentar
            </button>
          </div>
        ) : table.rows.length > 0 ? (
          <CourseTable
            rows={table.rows}
            sort={table.sort}
            onSort={table.toggleSort}
            onEdit={(course) => setFormTarget({ mode: "edit", course })}
            onDelete={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <div className="admin-page__empty">
            <MaskIcon src={SearchXIcon} className="admin-page__empty-icon" />
            <p className="admin-page__empty-title">
              {courses.length === 0
                ? "Todavía no hay cursos"
                : "Ningún curso coincide con los filtros"}
            </p>
            <p className="admin-page__empty-text">
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

        <footer className="admin-page__footer">
          <span>
            Mostrando {table.rows.length} de {courses.length}
          </span>
          <span className="admin-page__hint">
            Doble clic en una fila para editar
          </span>
        </footer>
      </section>

      <Notice notice={notice} onDismiss={dismissNotice} />

      {formTarget && (
        <CourseFormModal
          course={formTarget.mode === "edit" ? formTarget.course : null}
          categories={categories}
          teachers={teachersQuery.data ?? []}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteCourseModal
          course={deleteTarget}
          isDeleting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
