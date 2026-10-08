import { Link } from "react-router";

import type { Course } from "@/shared/types/course";
import type { CourseProgress } from "@/modules/student/utils/progress";
import { ProgressBar } from "./ProgressBar";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import PlayFilledIcon from "@/assets/icons/play-filled.svg";
import PlayFilledDarkIcon from "@/assets/icons/play-filled-dark.svg";
import "./EnrolledCourseRow.css";

type EnrolledCourseRowProps = {
  course: Course;
  progress: CourseProgress;
};

export function EnrolledCourseRow({
  course,
  progress,
}: EnrolledCourseRowProps) {
  const complete = progress.next === null;

  return (
    <li className="enrolled-row">
      <img
        className="enrolled-row__image"
        src={course.image}
        alt=""
        loading="lazy"
      />

      <div className="enrolled-row__info">
        <div className="enrolled-row__tags">
          <span className="enrolled-row__category">{course.category}</span>
          {complete ? (
            <span className="enrolled-row__badge enrolled-row__badge--complete">
              <img
                className="enrolled-row__badge-icon"
                src={CheckCircleIcon}
                alt=""
              />
              Completado
            </span>
          ) : (
            <span className="enrolled-row__badge">Inscrito · Activo</span>
          )}
        </div>
        <Link to={`/catalog/${course.id}`} className="enrolled-row__title">
          {course.title}
        </Link>
        <div className="enrolled-row__progress">
          <div className="enrolled-row__bar">
            <ProgressBar
              value={progress.percent}
              size="sm"
              label={`Progreso en ${course.title}`}
            />
          </div>
          <span className="enrolled-row__count">
            <strong>{progress.percent}%</strong> · {progress.completed}/
            {progress.total} clases
          </span>
        </div>
      </div>

      {/* TODO: apuntar al aula del curso cuando esté desarrollada */}
      <Link
        to={`/catalog/${course.id}`}
        className={
          complete
            ? "enrolled-row__btn enrolled-row__btn--outline"
            : "enrolled-row__btn"
        }
      >
        <img
          className="enrolled-row__btn-icon"
          src={complete ? PlayFilledDarkIcon : PlayFilledIcon}
          alt=""
        />
        {complete
          ? "Repasar"
          : progress.completed === 0
            ? "Entrar al curso"
            : "Continuar"}
      </Link>
    </li>
  );
}
