import { Link } from "react-router";

import type { Course } from "@/shared/types/course";
import type { Enrollment } from "@/shared/types/enrollment";
import { formatPrice } from "@/shared/utils/format";
import { learnPath } from "@/shared/utils/paths";

import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import BarChartIcon from "@/assets/icons/bar-chart.svg";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
// TODO: el carrito queda fuera del MVP; descomentar cuando se desarrolle
// import CartShoppingIcon from "@/assets/icons/cart-shopping.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import StarIcon from "@/assets/icons/star.svg";
import "./CourseCard.css";

type CourseCardProps = {
  course: Course;
  /** The signed-in student's enrollment in this course, if any */
  enrollment?: Pick<Enrollment, "status" | "progressPercent">;
};

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const isFree = course.price === null;
  const isCompleted = enrollment?.status === "completed";

  return (
    <article className="course-card">
      <div className="course-card__media">
        <img
          className="course-card__image"
          src={course.image}
          alt=""
          loading="lazy"
        />
        {enrollment && (
          <span
            className={
              isCompleted
                ? "course-card__badge course-card__badge--completed"
                : "course-card__badge"
            }
          >
            {isCompleted && (
              <img
                className="course-card__badge-icon"
                src={CheckCircleIcon}
                alt=""
              />
            )}
            {isCompleted
              ? "Completado"
              : `En curso · ${enrollment.progressPercent}%`}
          </span>
        )}
      </div>

      <div className="course-card__body">
        <p className="course-card__category">{course.category}</p>
        <h3 className="course-card__title">
          <Link to={`/catalog/${course.slug}`} className="course-card__link">
            {course.title}
          </Link>
        </h3>
        <p className="course-card__instructor">{course.instructor}</p>

        <dl className="course-card__meta">
          <div className="course-card__meta-item">
            <dt className="visually-hidden">Duración</dt>
            <img className="course-card__meta-icon" src={ClockIcon} alt="" />
            <dd>{course.durationHours} h</dd>
          </div>
          <div className="course-card__meta-item">
            <dt className="visually-hidden">Nivel</dt>
            <img className="course-card__meta-icon" src={BarChartIcon} alt="" />
            <dd>{course.level}</dd>
          </div>
          <div className="course-card__meta-item">
            <dt className="visually-hidden">Valoración</dt>
            <img className="course-card__meta-icon" src={StarIcon} alt="" />
            <dd>{course.rating.toFixed(1)}</dd>
          </div>
        </dl>

        <div className="course-card__footer">
          {enrollment ? (
            <>
              <span className="course-card__enrolled">Ya estás inscrito</span>
              <div className="course-card__actions">
                <Link
                  to={learnPath(course.slug)}
                  className="course-card__continue-btn"
                >
                  {isCompleted ? "Repasar" : "Continuar"}
                </Link>
              </div>
            </>
          ) : (
            <>
              <span
                className={
                  isFree
                    ? "course-card__price course-card__price--free"
                    : "course-card__price"
                }
              >
                {formatPrice(course.price)}
              </span>

              {isFree ? (
                <span className="course-card__see-more">
                  Ver curso
                  <img
                    className="course-card__see-more-icon"
                    src={ArrowRightIcon}
                    alt=""
                  />
                </span>
              ) : (
                <div className="course-card__actions">
                  {/* TODO: el carrito queda fuera del MVP; descomentar cuando se desarrolle
                  <button
                    type="button"
                    className="course-card__cart-btn"
                    aria-label="Añadir al carrito"
                    title="Añadir al carrito"
                  >
                    <img
                      className="course-card__cart-icon"
                      src={CartShoppingIcon}
                      alt=""
                    />
                  </button>
                  */}
                  <button type="button" className="course-card__buy-btn">
                    Comprar ahora
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
