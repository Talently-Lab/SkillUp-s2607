import { Link, useSearchParams } from "react-router";

import { useAuth } from "../../../shared/hooks/useAuth";
import { courses } from "../../../shared/mocks/courses";
import { enrollmentsByUser } from "../../../shared/mocks/enrollments";
import { ContinueCard } from "../components/ContinueCard";
import { DashboardTabs } from "../components/DashboardTabs";
import { EmptyCourses } from "../components/EmptyCourses";
import { EnrolledCourseRow } from "../components/EnrolledCourseRow";
import { ProgressSummary } from "../components/ProgressSummary";
import { RecommendedCourses } from "../components/RecommendedCourses";
import {
  dashboardTabs,
  panelId,
  tabFromParam,
  tabId,
  type DashboardTab,
} from "../constants/tabs";
import { getCourseProgress } from "../utils/progress";
import "./Student.css";

const RECOMMENDED_LIMIT = 3;

export function Student() {
  const user = useAuth().user!;
  const [params, setParams] = useSearchParams();
  const tab = tabFromParam(params.get("tab"));

  // TODO: obtener las inscripciones desde la API cuando esté lista
  const enrolled = (enrollmentsByUser[user.id] ?? []).flatMap((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    return course
      ? [{ course, progress: getCourseProgress(course, enrollment) }]
      : [];
  });

  // The first course still in progress, or the first one if all are done
  const featured =
    enrolled.find((item) => item.progress.next !== null) ?? enrolled[0];
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
  const recommended = courses
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
        <h1 className="student-dashboard__title">Hola, {firstName}</h1>
        <p className="student-dashboard__subtitle">
          {enrolled.length === 0
            ? "Aún no tienes cursos. Elige el primero y empieza hoy."
            : `Tienes ${enrolled.length} ${enrolled.length === 1 ? "curso activo" : "cursos activos"}. Sigue así.`}
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
        {/* TODO: las pestañas de certificados y pagos están pendientes */}
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
