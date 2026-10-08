import { useEffect } from "react";
import { Link, useParams } from "react-router";

import { courses } from "../../../shared/mocks/courses";
import { formatNumber } from "../../../shared/utils/format";
import { CourseReviews } from "../components/CourseReviews";
import { EnrollCard } from "../components/EnrollCard";
import { MobileEnrollBar } from "../components/MobileEnrollBar";
import { SyllabusAccordion } from "../components/SyllabusAccordion";
import { getReviewSummary } from "../utils/reviews";
import { getModuleMinutes, getSyllabus } from "../../../shared/utils/syllabus";
import BarChartIcon from "../../../assets/icons/bar-chart.svg";
import CheckIcon from "../../../assets/icons/check.svg";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg";
import ClockIcon from "../../../assets/icons/clock.svg";
import PeopleIcon from "../../../assets/icons/people.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import StarFilledIcon from "../../../assets/icons/star-filled.svg";
import "./CourseDetail.css";

export function CourseDetail() {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);

  // Coming from the catalog the page would keep its scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

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

  const syllabus = getSyllabus(course);
  const summary = getReviewSummary(course);
  const totalMinutes = syllabus.modules.reduce(
    (total, module) => total + getModuleMinutes(module.lessons),
    0,
  );
  const totalHours = Math.max(
    Math.round(totalMinutes / 60),
    course.durationHours,
  );
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
            <p className="course-detail__syllabus-meta">
              <img
                className="course-detail__syllabus-icon"
                src={PlayIcon}
                alt=""
              />
              {syllabus.modules.length} módulos · {course.lessons} lecciones ·{" "}
              {totalHours} h en total
            </p>
            <SyllabusAccordion modules={syllabus.modules} />
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
            <EnrollCard course={course} />
          </div>
        </aside>
      </div>

      <MobileEnrollBar course={course} />
    </div>
  );
}
