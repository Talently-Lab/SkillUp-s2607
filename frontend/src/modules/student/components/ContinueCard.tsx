import { Link } from "react-router";

import type { EnrolledCourse } from "@/shared/types/enrollment";
import { coursePath, learnPath } from "@/shared/utils/paths";
import {
  isCourseFinished,
  type CourseProgress,
  type NextLesson,
} from "@/modules/student/utils/progress";
import { ProgressBar } from "./ProgressBar";
import PlayFilledIcon from "@/assets/icons/play-filled.svg";
import "./ContinueCard.css";

type ContinueCardProps = {
  course: EnrolledCourse;
  progress: CourseProgress;
  next: NextLesson | null;
};

export function ContinueCard({ course, progress, next }: ContinueCardProps) {
  const notStarted = progress.completed === 0;
  const finished = isCourseFinished(progress);

  return (
    <section className="continue-card" aria-labelledby="continue-heading">
      <div className="continue-card__media">
        <img className="continue-card__image" src={course.image} alt="" />
      </div>
      <div className="continue-card__body">
        <p className="continue-card__eyebrow">
          {notStarted ? "Empieza aquí" : "Continúa donde lo dejaste"}
        </p>
        <h2 id="continue-heading" className="continue-card__title">
          {course.title}
        </h2>
        {next && (
          <p className="continue-card__next">
            <span className="continue-card__next-label">
              Siguiente · Módulo {next.moduleIndex + 1}:
            </span>{" "}
            {next.title}
          </p>
        )}

        <div className="continue-card__footer">
          <div className="continue-card__stats">
            <span>
              {progress.completed} de {progress.total} clases completadas
            </span>
            <span className="continue-card__percent">{progress.percent}%</span>
          </div>
          <ProgressBar
            value={progress.percent}
            label={`Progreso en ${course.title}`}
          />
          <div className="continue-card__actions">
            <Link
              to={learnPath(course.slug, next?.id)}
              className="continue-card__btn continue-card__btn--primary"
            >
              <img
                className="continue-card__btn-icon"
                src={PlayFilledIcon}
                alt=""
              />
              {finished
                ? "Repasar el curso"
                : notStarted
                  ? "Entrar al curso"
                  : "Continuar aprendiendo"}
            </Link>
            <Link
              to={coursePath(course.slug)}
              className="continue-card__btn continue-card__btn--ghost"
            >
              Ver temario
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
