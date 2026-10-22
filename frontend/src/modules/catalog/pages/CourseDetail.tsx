import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { ApiError } from "@/shared/api/http";
import { Loader, PageLoader } from "@/shared/components/Loader";
import { useFetch } from "@/shared/hooks/useFetch";
import { coursesService } from "@/shared/services/coursesService";
import type { Course } from "@/shared/types/course";
import type { Lesson } from "@/shared/types/lesson";
import { formatNumber } from "@/shared/utils/format";
import { learnPath } from "@/shared/utils/paths";
import { getSyllabus } from "@/shared/utils/syllabus";
import { CourseReviews } from "@/modules/catalog/components/CourseReviews";
import { EnrollCard } from "@/modules/catalog/components/EnrollCard";
import { LessonPreviewModal } from "@/modules/catalog/components/LessonPreviewModal";
import { MobileEnrollBar } from "@/modules/catalog/components/MobileEnrollBar";
import { SyllabusAccordion } from "@/modules/catalog/components/SyllabusAccordion";
import { useCourseAccess } from "@/modules/catalog/hooks/useCourseAccess";
import { getReviewSummary } from "@/modules/catalog/utils/reviews";
import BarChartIcon from "@/assets/icons/bar-chart.svg";
import CheckIcon from "@/assets/icons/check.svg";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import PeopleIcon from "@/assets/icons/people.svg";
import PlayIcon from "@/assets/icons/play.svg";
import StarFilledIcon from "@/assets/icons/star-filled.svg";
import "./CourseDetail.css";

export function CourseDetail() {
  const { slug = "" } = useParams();
  const {
    data: course,
    error,
    isLoading,
    retry,
  } = useFetch(`course-${slug}`, () => coursesService.getBySlug(slug));

  // Coming from the catalog the page would keep its scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) return <PageLoader label="Cargando curso…" />;

  if (error && !(error instanceof ApiError && error.status === 404)) {
    return (
      <div className="course-not-found container" role="alert">
        <h1 className="course-not-found__title">
          No pudimos cargar este curso
        </h1>
        <p className="course-not-found__text">
          Revisa tu conexión e inténtalo de nuevo en unos segundos.
        </p>
        <button
          type="button"
          className="course-not-found__btn"
          onClick={retry}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found container">
        <h1 className="course-not-found__title">No encontramos este curso</h1>
        <p className="course-not-found__text">
          Puede que haya cambiado de nombre o ya no esté disponible.
        </p>
        <Link to="/catalog" className="course-not-found__btn">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return <CourseDetailView course={course} />;
}

function CourseDetailView({ course }: { course: Course }) {
  const navigate = useNavigate();
  const access = useCourseAccess(course);
  const [preview, setPreview] = useState<Lesson | null>(null);
  // The API has no description paragraphs or outcomes yet, they come from the mocks
  const syllabus = getSyllabus(course);
  const summary = getReviewSummary(course);
  const lessonsTotal = access.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const enrollProps = {
    course,
    enrolled: access.enrolled,
    canEnroll: access.canEnroll,
    enrolling: access.enrolling,
    onEnroll: access.enroll,
  };

  const play = (lesson: Lesson) => {
    if (access.enrolled) navigate(learnPath(course.slug, lesson.id));
    else setPreview(lesson);
  };

  const initials = course.instructor
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="course-detail">
      <section className="course-hero">
        <div className="course-hero__inner container">
          <nav className="course-hero__breadcrumb" aria-label="Ruta de navegación">
            <Link to="/catalog" className="course-hero__breadcrumb-link">
              Catálogo
            </Link>
            <img
              className="course-hero__breadcrumb-icon"
              src={ChevronRightIcon}
              alt=""
            />
            <span className="course-hero__breadcrumb-current">
              {course.category}
            </span>
          </nav>
          <div className="course-hero__content">
            <h1 className="course-hero__title">{course.title}</h1>
            <p className="course-hero__summary">{syllabus.description[0]}</p>
            <dl className="course-hero__meta">
              <div className="course-hero__meta-item">
                <dt className="visually-hidden">Valoración</dt>
                <img
                  className="course-hero__star"
                  src={StarFilledIcon}
                  alt=""
                />
                <dd>
                  <a href="#opiniones" className="course-hero__rating-link">
                    <strong>{summary.average.toFixed(1)}</strong> (
                    {formatNumber(summary.count)} valoraciones)
                  </a>
                </dd>
              </div>
              <div className="course-hero__meta-item">
                <dt className="visually-hidden">Estudiantes</dt>
                <img className="course-hero__icon" src={PeopleIcon} alt="" />
                <dd>{formatNumber(course.students)} estudiantes</dd>
              </div>
              <div className="course-hero__meta-item">
                <dt className="visually-hidden">Duración</dt>
                <img className="course-hero__icon" src={ClockIcon} alt="" />
                <dd>{course.durationHours} h</dd>
              </div>
              <div className="course-hero__meta-item">
                <dt className="visually-hidden">Nivel</dt>
                <img className="course-hero__icon" src={BarChartIcon} alt="" />
                <dd>{course.level}</dd>
              </div>
            </dl>
            <p className="course-hero__instructor">
              Impartido por <strong>{course.instructor}</strong>
            </p>
          </div>
        </div>
      </section>

      <div className="course-detail__layout container">
        <div className="course-detail__main">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="course-detail__section-title">
              Sobre este curso
            </h2>
            <div className="course-detail__description">
              {syllabus.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section
            className="course-outcomes"
            aria-labelledby="outcomes-heading"
          >
            <h2 id="outcomes-heading" className="course-detail__section-title">
              Lo que aprenderás
            </h2>
            <ul className="course-outcomes__list">
              {syllabus.outcomes.map((outcome) => (
                <li key={outcome} className="course-outcomes__item">
                  <img className="course-outcomes__icon" src={CheckIcon} alt="" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="syllabus-heading">
            <h2 id="syllabus-heading" className="course-detail__section-title">
              Temario
            </h2>
            {access.isLoading ? (
              <p className="course-detail__syllabus-state">
                <Loader /> Cargando temario…
              </p>
            ) : access.error ? (
              <div className="course-detail__syllabus-state" role="alert">
                <p>No pudimos cargar el temario.</p>
                <button
                  type="button"
                  className="course-detail__syllabus-retry"
                  onClick={access.retry}
                >
                  Reintentar
                </button>
              </div>
            ) : access.modules.length === 0 ? (
              <p className="course-detail__syllabus-state">
                El docente está preparando el temario. Vuelve pronto.
              </p>
            ) : (
              <>
                <p className="course-detail__syllabus-meta">
                  <img
                    className="course-detail__syllabus-icon"
                    src={PlayIcon}
                    alt=""
                  />
                  {access.modules.length}{" "}
                  {access.modules.length === 1 ? "módulo" : "módulos"} ·{" "}
                  {lessonsTotal} {lessonsTotal === 1 ? "lección" : "lecciones"}{" "}
                  · {course.durationHours} h en total
                </p>
                <SyllabusAccordion
                  modules={access.modules}
                  enrolled={access.enrolled}
                  onPlay={play}
                />
              </>
            )}
          </section>

          <CourseReviews key={course.id} course={course} />

          <section aria-labelledby="teacher-heading">
            <h2 id="teacher-heading" className="course-detail__section-title">
              Tu docente
            </h2>
            <div className="course-teacher">
              <span className="course-teacher__avatar" aria-hidden="true">
                {initials}
              </span>
              <div>
                <p className="course-teacher__name">{course.instructor}</p>
                <p className="course-teacher__role">
                  Especialista en {course.category.toLowerCase()}
                </p>
                <p className="course-teacher__bio">
                  Más de 10 años de experiencia profesional y miles de
                  estudiantes formados en SkillUp Campus. Sus cursos combinan
                  explicaciones claras con práctica desde la primera lección.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="course-detail__aside" aria-label="Inscripción">
          <div className="course-detail__aside-inner">
            <EnrollCard {...enrollProps} />
          </div>
        </aside>
      </div>

      <MobileEnrollBar {...enrollProps} />

      {preview && (
        <LessonPreviewModal
          lesson={preview}
          poster={course.image}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
