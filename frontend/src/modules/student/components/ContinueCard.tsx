import { Link } from "react-router";

import type { Course } from "../../../shared/types/course";
import type { CourseProgress } from "../utils/progress";
import { ProgressBar } from "./ProgressBar";
import PlayFilledIcon from "../../../assets/icons/play-filled.svg";
import "./ContinueCard.css";

type ContinueCardProps = {
  course: Course;
  progress: CourseProgress;
};

export function ContinueCard({ course, progress }: ContinueCardProps) {
  const notStarted = progress.completed === 0;
  const finished = progress.next === null;

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
        {progress.next && (
          <p className="continue-card__next">
            <span className="continue-card__next-label">
              Siguiente · Módulo {progress.next.moduleIndex + 1}:
            </span>{" "}
            {progress.next.title}
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
            {/* TODO: apuntar al aula del curso cuando esté desarrollada */}
            <Link
              to={`/catalog/${course.id}`}
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
              to={`/catalog/${course.id}`}
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
