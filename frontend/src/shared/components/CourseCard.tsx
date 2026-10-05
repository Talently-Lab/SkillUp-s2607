import type { Course } from "../types/course";
import { formatPrice } from "../utils/format";

import ArrowRightIcon from "../../assets/icons/arrow-right.svg";
import BarChartIcon from "../../assets/icons/bar-chart.svg";
import CartShoppingIcon from "../../assets/icons/cart-shopping.svg";
import ClockIcon from "../../assets/icons/clock.svg";
import StarIcon from "../../assets/icons/star.svg";
import "./CourseCard.css";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const isFree = course.price === null;

  return (
    <article className="course-card">
      <div className="course-card__media">
        <img
          className="course-card__image"
          src={course.image}
          alt=""
          loading="lazy"
        />
      </div>

      <div className="course-card__body">
        <p className="course-card__category">{course.category}</p>
        <h3 className="course-card__title">{course.title}</h3>
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
              <button type="button" className="course-card__buy-btn">
                Comprar ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
