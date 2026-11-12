import { Link, useSearchParams } from "react-router";

import { Skeleton } from "@/shared/components/Skeleton";
import { useDelayedFlag } from "@/shared/hooks/useDelayedFlag";
import { useAuthStore } from "@/shared/stores/authStore";
import { ContinueCard } from "@/modules/student/components/ContinueCard";
import { DashboardTabs } from "@/modules/student/components/DashboardTabs";
import { EmptyCourses } from "@/modules/student/components/EmptyCourses";
import { EnrolledCourseRow } from "@/modules/student/components/EnrolledCourseRow";
import { ProgressSummary } from "@/modules/student/components/ProgressSummary";
import { RecommendedCourses } from "@/modules/student/components/RecommendedCourses";
import {
  dashboardTabs,
  panelId,
  tabFromParam,
  tabId,
  type DashboardTab,
} from "@/modules/student/constants/tabs";
import { useStudentDashboard } from "@/modules/student/hooks/useStudentDashboard";
import "./Student.css";

const RECOMMENDED_LIMIT = 3;

export function Student() {
  const user = useAuthStore((state) => state.user)!;
  const [params, setParams] = useSearchParams();
  const tab = tabFromParam(params.get("tab"));

  const { data, error, isLoading, retry } = useStudentDashboard(user.id);

  if (isLoading) return <StudentSkeleton />;

  if (error || !data) {
    return (
      <div className="student-dashboard__error container" role="alert">
        <h1 className="student-dashboard__error-title">
          No pudimos cargar tus cursos
        </h1>
        <p className="student-dashboard__error-text">
          Revisá tu conexión y probá de nuevo en unos segundos.
        </p>
        <button
          type="button"
          className="student-dashboard__error-btn"
          onClick={retry}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { enrolled, featured, featuredNext, catalog } = data;
  const completedLessons = enrolled.reduce(
    (total, item) => total + item.progress.completed,
    0,
  );
  const hoursLearned = enrolled.reduce(
    (total, item) =>
      total + (item.progress.percent / 100) * item.course.durationHours,
    0,
  );

  // Courses from the student's categories first
  const enrolledCategories = new Set(
    enrolled.map((item) => item.course.category),
  );
  const recommended = catalog
    .filter((course) => !enrolled.some((item) => item.course.id === course.id))
    .sort(
      (a, b) =>
        Number(enrolledCategories.has(b.category)) -
        Number(enrolledCategories.has(a.category)),
    )
    .slice(0, RECOMMENDED_LIMIT);

  const firstName = user.name.split(" ")[0];

  const changeTab = (next: DashboardTab) => {
    const param = dashboardTabs.find((item) => item.value === next)?.param;
    setParams(param ? { tab: param } : {}, { replace: true });
  };

  return (
    <div className="student-dashboard container">
      <header>
        <h1 className="display student-dashboard__title">Hola, {firstName}</h1>
        <p className="student-dashboard__subtitle">
          {enrolled.length === 0
            ? "Todavía no tenés cursos. Elegí el primero y empezá hoy."
            : `Tenés ${enrolled.length} ${enrolled.length === 1 ? "curso activo" : "cursos activos"}. Seguí así.`}
        </p>
      </header>

      <DashboardTabs
        value={tab}
        counts={{ courses: enrolled.length }}
        onChange={changeTab}
      />

      <div
        id={panelId(tab)}
        role="tabpanel"
        aria-labelledby={tabId(tab)}
        className="student-dashboard__panel"
      >
        {/* TODO: certificados y pagos quedan fuera del MVP, ver constants/tabs.ts */}
        {tab === "courses" &&
          (enrolled.length === 0 ? (
            <EmptyCourses />
          ) : (
            <div className="student-dashboard__grid">
              <div className="student-dashboard__main">
                {featured && (
                  <ContinueCard
                    course={featured.course}
                    progress={featured.progress}
                    next={featuredNext}
                  />
                )}

                <section aria-labelledby="my-courses-heading">
                  <div className="student-dashboard__section-header">
                    <h2
                      id="my-courses-heading"
                      className="student-dashboard__section-title"
                    >
                      Mis cursos activos
                    </h2>
                    <Link to="/catalog" className="student-dashboard__more">
                      Inscribirme en otro
                    </Link>
                  </div>
                  <ul className="student-dashboard__courses">
                    {enrolled.map(({ course, progress }) => (
                      <EnrolledCourseRow
                        key={course.id}
                        course={course}
                        progress={progress}
                      />
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="student-dashboard__aside">
                <ProgressSummary
                  completedLessons={completedLessons}
                  hoursLearned={hoursLearned}
                />
                {recommended.length > 0 && (
                  <RecommendedCourses courses={recommended} />
                )}
              </aside>
            </div>
          ))}
      </div>
    </div>
  );
}

/** Continue card, course rows and side cards while the dashboard loads */
function StudentSkeleton() {
  const visible = useDelayedFlag(true);
  return (
    <div
      className="student-dashboard container"
      aria-busy="true"
      aria-label="Cargando tus cursos…"
    >
      {visible && (
        <>
          <Skeleton variant="title" width={260} height={48} />
          <Skeleton variant="text" width={320} />
          <div className="student-dashboard__grid">
            <div className="student-dashboard__main">
              <Skeleton height={260} className="student-skeleton__hero" />
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} height={96} />
              ))}
            </div>
            <div className="student-dashboard__aside">
              <Skeleton height={160} />
              <Skeleton height={240} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
