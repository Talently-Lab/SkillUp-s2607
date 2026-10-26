import { useState } from "react";
import { Link } from "react-router";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { StatusBadge } from "@/modules/admin/components/StatusBadge";
import { AssignedCourseList } from "@/modules/teacher/components/AssignedCourseList";
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
import { useAuthStore } from "@/shared/stores/authStore";
import { coursePath } from "@/shared/utils/paths";
import ExternalLinkIcon from "@/assets/icons/external-link.svg";
import InboxIcon from "@/assets/icons/inbox.svg";
import "@/modules/admin/components/Button.css";
import "@/modules/admin/pages/AdminPage.css";
import "./Teacher.css";

export function Teacher() {
  const user = useAuthStore((state) => state.user);
  const { courses, metrics, getRoster, getModules, updateModules } =
    useTeacherDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<CourseTab>("syllabus");

  const selected =
    courses.find((course) => course.id === selectedId) ?? courses[0];
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="teacher-dashboard">
      <header>
        <h1 className="teacher-dashboard__title">Hola, {firstName}</h1>
        <p className="teacher-dashboard__subtitle">
          Así van tus cursos esta semana.
        </p>
      </header>

      {!selected ? (
        <div className="admin-page__panel admin-page__empty">
          <MaskIcon src={InboxIcon} className="admin-page__empty-icon" />
          <p className="admin-page__empty-title">
            Aún no tienes cursos asignados
          </p>
          <p className="admin-page__empty-text">
            El equipo académico te asignará cursos pronto. Aquí podrás editar su
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
                {selected.status !== "draft" && (
                  <Link
                    to={coursePath(selected.slug)}
                    className="teacher-dashboard__preview"
                  >
                    Ver como alumno
                    <MaskIcon src={ExternalLinkIcon} />
                  </Link>
                )}
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
                  <SyllabusEditor
                    key={selected.id}
                    modules={getModules(selected)}
                    onUpdate={(updater) => updateModules(selected, updater)}
                  />
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

          <p className="admin-page__note">
            Los datos son de demostración: los cambios se pierden al recargar la
            página.
          </p>
        </>
      )}
    </div>
  );
}
