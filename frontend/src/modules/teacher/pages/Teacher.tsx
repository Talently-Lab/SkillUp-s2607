import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { StatusBadge } from "@/modules/admin/components/StatusBadge";
import { AssignedCourseList } from "@/modules/teacher/components/AssignedCourseList";
import { CourseDetailsModal } from "@/modules/teacher/components/CourseDetailsModal";
import { CourseTabs } from "@/modules/teacher/components/CourseTabs";
import { StudentRoster } from "@/modules/teacher/components/StudentRoster";
import { SyllabusEditor } from "@/modules/teacher/components/SyllabusEditor";
import { TeacherMetrics } from "@/modules/teacher/components/TeacherMetrics";
import {
  courseTabId,
  coursePanelId,
  type CourseTab,
} from "@/modules/teacher/constants/tabs";
import { useTeacherDashboard } from "@/modules/teacher/hooks/useTeacherDashboard";
import { showTeacherError } from "@/modules/teacher/utils/teacherErrorMessage";
import { Loader } from "@/shared/components/Loader";
import { Skeleton } from "@/shared/components/Skeleton";
import { useDelayedFlag } from "@/shared/hooks/useDelayedFlag";
import { useFetch } from "@/shared/hooks/useFetch";
import { categoriesService } from "@/shared/services/categoriesService";
import type { TeacherCourseInput } from "@/shared/services/teacherService";
import { useAuthStore } from "@/shared/stores/authStore";
import { coursePath } from "@/shared/utils/paths";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import ExternalLinkIcon from "@/assets/icons/external-link.svg";
import InboxIcon from "@/assets/icons/inbox.svg";
import PencilIcon from "@/assets/icons/pencil.svg";
import "@/modules/admin/components/Button.css";
import "@/modules/admin/pages/AdminPage.css";
import "./Teacher.css";

export function Teacher() {
  const user = useAuthStore((state) => state.user);
  const dashboard = useTeacherDashboard();
  const { courses, metrics, getRoster } = dashboard;
  const categoriesQuery = useFetch("categories", categoriesService.list);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<CourseTab>("syllabus");
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const selected =
    courses.find((course) => course.id === selectedId) ?? courses[0];
  const isDraft = selected?.status === "draft";
  const firstName = user?.name.split(" ")[0] ?? "";

  // Errors reach the form, which shows them and stays open
  const saveDetails = async (input: Partial<TeacherCourseInput>) => {
    await dashboard.updateCourse(selected.id, input);
    setIsEditing(false);
    toast.success("Datos del curso guardados");
  };

  const togglePublished = async () => {
    setIsPublishing(true);
    try {
      await dashboard.updateCourse(selected.id, {
        status: isDraft ? "published" : "draft",
      });
      if (isDraft)
        toast.success("Curso publicado", {
          description: "Ya aparece en el catálogo.",
        });
      else
        toast.success("El curso pasó a borrador", {
          description:
            "Sale del catálogo, los alumnos inscritos conservan el acceso.",
        });
    } catch (error) {
      showTeacherError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <header>
        <h1 className="display teacher-dashboard__title">Hola, {firstName}</h1>
        <p className="teacher-dashboard__subtitle">
          Así van tus cursos esta semana.
        </p>
      </header>

      {dashboard.isLoading ? (
        <TeacherSkeleton />
      ) : dashboard.hasError ? (
        <div className="admin-page__panel admin-page__empty" role="alert">
          <MaskIcon src={AlertIcon} className="admin-page__empty-icon" />
          <p className="admin-page__empty-title">
            No pudimos cargar tus cursos
          </p>
          <p className="admin-page__empty-text">
            Revisá tu conexión y probá de nuevo.
          </p>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={dashboard.reload}
          >
            Reintentar
          </button>
        </div>
      ) : !selected ? (
        <div className="admin-page__panel admin-page__empty">
          <MaskIcon src={InboxIcon} className="admin-page__empty-icon" />
          <p className="admin-page__empty-title">
            Todavía no tenés cursos asignados
          </p>
          <p className="admin-page__empty-text">
            El equipo académico te asignará cursos pronto. Acá vas a poder editar su
            temario y seguir a tus alumnos.
          </p>
          <Link to="/catalog" className="admin-button admin-button--secondary">
            Explorar el catálogo
          </Link>
        </div>
      ) : (
        <>
          <TeacherMetrics metrics={metrics} />

          <div className="teacher-dashboard__grid">
            <aside className="teacher-dashboard__aside">
              <AssignedCourseList
                courses={courses}
                selectedId={selected.id}
                onSelect={setSelectedId}
              />
            </aside>

            <section
              aria-labelledby="teacher-course-title"
              className="teacher-dashboard__course"
            >
              <div className="teacher-dashboard__course-header">
                <div className="teacher-dashboard__course-heading">
                  <p className="teacher-dashboard__course-meta">
                    {selected.category} · {selected.level}
                    <StatusBadge status={selected.status} />
                  </p>
                  <h2
                    id="teacher-course-title"
                    className="teacher-dashboard__course-title"
                  >
                    {selected.title}
                  </h2>
                </div>
                <div className="teacher-dashboard__course-actions">
                  {!isDraft && (
                    <Link
                      to={coursePath(selected.slug)}
                      className="teacher-dashboard__preview"
                    >
                      Ver como alumno
                      <MaskIcon src={ExternalLinkIcon} />
                    </Link>
                  )}
                  <button
                    type="button"
                    className="admin-button admin-button--sm admin-button--secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    <MaskIcon src={PencilIcon} />
                    Editar datos
                  </button>
                  <button
                    type="button"
                    className={
                      isDraft
                        ? "admin-button admin-button--sm admin-button--primary"
                        : "admin-button admin-button--sm admin-button--secondary"
                    }
                    onClick={togglePublished}
                    disabled={isPublishing}
                  >
                    {isPublishing && <Loader size={14} />}
                    {isDraft ? "Publicar" : "Pasar a borrador"}
                  </button>
                </div>
              </div>

              <CourseTabs
                value={tab}
                studentCount={getRoster(selected).length}
                onChange={setTab}
              />

              <div
                id={coursePanelId(tab)}
                role="tabpanel"
                aria-labelledby={courseTabId(tab)}
                className="teacher-dashboard__panel"
              >
                {tab === "syllabus" ? (
                  <SyllabusEditor key={selected.id} courseId={selected.id} />
                ) : (
                  <StudentRoster
                    key={selected.id}
                    course={selected}
                    roster={getRoster(selected)}
                  />
                )}
              </div>
            </section>
          </div>

          {isEditing && (
            <CourseDetailsModal
              course={selected}
              categories={categoriesQuery.data ?? []}
              onClose={() => setIsEditing(false)}
              onSave={saveDetails}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Metrics, course list and detail placeholders while the dashboard loads */
function TeacherSkeleton() {
  const visible = useDelayedFlag(true);
  return (
    <div className="teacher-skeleton" aria-busy="true" aria-label="Cargando tus cursos…">
      {visible && (
        <>
          <div className="teacher-skeleton__metrics">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} height={92} className="teacher-skeleton__card" />
            ))}
          </div>
          <div className="teacher-skeleton__grid">
            <div className="teacher-skeleton__list">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} height={78} />
              ))}
            </div>
            <Skeleton height={420} />
          </div>
        </>
      )}
    </div>
  );
}
