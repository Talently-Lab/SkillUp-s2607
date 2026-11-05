import { useState } from "react";
import { Link } from "react-router";

import { ReviewFormModal } from "@/shared/components/ReviewFormModal";
import type { EnrolledCourse } from "@/shared/types/enrollment";
import { coursePath, learnPath } from "@/shared/utils/paths";
import {
  isCourseFinished,
  type CourseProgress,
} from "@/modules/student/utils/progress";
import { ProgressBar } from "@/modules/student/components/ProgressBar";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import PlayFilledIcon from "@/assets/icons/play-filled.svg";
import PlayFilledDarkIcon from "@/assets/icons/play-filled-dark.svg";
import "./EnrolledCourseRow.css";

type EnrolledCourseRowProps = {
  course: EnrolledCourse;
  progress: CourseProgress;
};

export function EnrolledCourseRow({
  course,
  progress,
}: EnrolledCourseRowProps) {
  const complete = isCourseFinished(progress);
  const [reviewing, setReviewing] = useState(false);

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
        <Link to={coursePath(course.slug)} className="enrolled-row__title">
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

      <div className="enrolled-row__actions">
        {complete && (
          <button
            type="button"
            className="enrolled-row__btn"
            onClick={() => setReviewing(true)}
          >
            Dejar reseña
          </button>
        )}
        <Link
          to={learnPath(course.slug)}
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
      </div>

      {reviewing && (
        <ReviewFormModal
          courseTitle={course.title}
          onClose={() => setReviewing(false)}
        />
      )}
    </li>
  );
}
