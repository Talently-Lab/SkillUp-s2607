import { Link, Navigate, useParams } from "react-router";

import { ApiError } from "@/shared/api/http";
import { LessonVideo } from "@/shared/components/LessonVideo";
import { Loader, PageLoader } from "@/shared/components/Loader";
import { useFetch } from "@/shared/hooks/useFetch";
import { coursesService } from "@/shared/services/coursesService";
import { enrollmentsService } from "@/shared/services/enrollmentsService";
import { modulesService } from "@/shared/services/modulesService";
import type { Course } from "@/shared/types/course";
import type { EnrollmentProgress } from "@/shared/types/enrollment";
import type { CourseModule } from "@/shared/types/lesson";
import { coursePath } from "@/shared/utils/paths";
import { LessonSidebar } from "@/modules/student/components/LessonSidebar";
import { ProgressBar } from "@/modules/student/components/ProgressBar";
import { useClassroom } from "@/modules/student/hooks/useClassroom";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import "./Learn.css";

type ClassroomData = {
  course: Course;
  enrollmentId: string;
  modules: CourseModule[];
  progress: EnrollmentProgress;
};

/** null when the student is not enrolled in the course */
async function loadClassroom(slug: string): Promise<ClassroomData | null> {
  const course = await coursesService.getBySlug(slug);
  // Asked before the modules because it renews an expired session, so the
  // lessons come unlocked
  const enrollment = (await enrollmentsService.listMine()).find(
    (item) => item.courseId === course.id,
  );
  if (!enrollment) return null;

  const [modules, progress] = await Promise.all([
    modulesService.listByCourse(course.id),
    enrollmentsService.getProgress(enrollment.id),
  ]);
  return { course, enrollmentId: enrollment.id, modules, progress };
}

export function Learn() {
  const { slug = "" } = useParams();
  const { data, error, isLoading, retry } = useFetch(`classroom-${slug}`, () =>
    loadClassroom(slug),
  );

  if (isLoading) return <PageLoader label="Cargando el curso…" />;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="learn-message" role="alert">
        <h1 className="learn-message__title">
          {notFound
            ? "No encontramos este curso"
            : "No pudimos cargar el curso"}
        </h1>
        <p className="learn-message__text">
          {notFound
            ? "Puede que haya cambiado de nombre o ya no esté disponible."
            : "Revisa tu conexión e inténtalo de nuevo en unos segundos."}
        </p>
        {notFound ? (
          <Link to="/student" className="learn-message__btn">
            Volver a mi panel
          </Link>
        ) : (
          <button type="button" className="learn-message__btn" onClick={retry}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Not enrolled: the course page shows the preview and the enroll button
  if (!data) return <Navigate to={coursePath(slug)} replace />;

  return <Classroom key={slug} {...data} />;
}

function Classroom({ course, enrollmentId, modules, progress }: ClassroomData) {
  const room = useClassroom({ enrollmentId, modules, progress });
  const { active } = room;

  return (
    <div className="learn">
      <header className="learn-header">
        <Link to="/student" className="learn-header__back">
          <img
            className="learn-header__back-icon"
            src={ChevronLeftIcon}
            alt=""
          />
          Mi panel
        </Link>
        <span className="learn-header__divider" aria-hidden="true" />
        <p className="learn-header__title">{course.title}</p>
        <div className="learn-header__progress">
          <span className="learn-header__stats">
            {room.progress.completed}/{room.progress.total} ·{" "}
            {room.progress.percent}%
          </span>
          <div className="learn-header__bar">
            <ProgressBar
              value={room.progress.percent}
              size="sm"
              label="Progreso general del curso"
            />
          </div>
        </div>
      </header>

      {!active ? (
        <div className="learn-message">
          <h1 className="learn-message__title">
            Este curso aún no tiene clases publicadas
          </h1>
          <p className="learn-message__text">
            El docente está preparando el contenido. Vuelve pronto.
          </p>
        </div>
      ) : (
        <div className="learn__layout">
          <main className="learn__main">
            {room.finished && (
              <div className="learn__finished" role="status">
                <img
                  className="learn__finished-icon"
                  src={CheckCircleIcon}
                  alt=""
                />
                <div>
                  <p className="learn__finished-title">
                    ¡Felicitaciones! Completaste el curso
                  </p>
                  <p className="learn__finished-text">
                    Puedes repasar cualquier clase cuando quieras.
                  </p>
                </div>
              </div>
            )}

            <div className="learn__lesson-header">
              <p className="learn__lesson-meta">
                Módulo {active.moduleIndex + 1} · {active.moduleTitle} · Clase{" "}
                {room.activeIndex + 1} de {room.lessons.length}
              </p>
              <h1 className="learn__lesson-title">{active.title}</h1>
            </div>

            <LessonVideo
              key={active.id}
              videoUrl={active.videoUrl}
              title={active.title}
              poster={course.image}
            />

            <div className="learn__actions">
              <button
                type="button"
                className="learn__btn learn__btn--outline"
                onClick={() => room.goTo(-1)}
                disabled={room.activeIndex === 0}
              >
                <img className="learn__btn-icon" src={ChevronLeftIcon} alt="" />
                Anterior
              </button>

              <div className="learn__actions-end">
                {room.isCompleted ? (
                  <>
                    <span className="learn__completed">
                      <img
                        className="learn__completed-icon"
                        src={CheckCircleIcon}
                        alt=""
                      />
                      Clase completada
                    </span>
                    {room.activeIndex < room.lessons.length - 1 && (
                      <button
                        type="button"
                        className="learn__btn learn__btn--primary"
                        onClick={() => room.goTo(1)}
                      >
                        Siguiente clase
                        <img
                          className="learn__btn-icon learn__btn-icon--light"
                          src={ChevronRightIcon}
                          alt=""
                        />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="learn__btn learn__btn--accent"
                    onClick={room.completeAndNext}
                    disabled={room.isSaving}
                  >
                    {room.isSaving && <Loader />}
                    {room.activeIndex < room.lessons.length - 1
                      ? "Marcar como completada y seguir"
                      : "Marcar como completada"}
                  </button>
                )}
              </div>
            </div>
          </main>

          <aside className="learn__aside">
            <LessonSidebar
              modules={modules}
              completedIds={room.completedIds}
              activeId={active.id}
              activeModuleIndex={active.moduleIndex}
              progress={room.progress}
              onSelect={room.select}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
