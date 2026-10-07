import { useRef, useState } from "react";

import type { Course } from "../../../shared/types/course";
import type { StarValue } from "../../../shared/types/review";
import {
  formatNumber,
  formatRelativeTime,
} from "../../../shared/utils/format";
import { getCourseReviews, getReviewSummary, STARS } from "../utils/reviews";
import { Pagination } from "./Pagination";
import { StarRating } from "./StarRating";
import StarFilledIcon from "../../../assets/icons/star-filled.svg";
import "./CourseReviews.css";

type CourseReviewsProps = {
  course: Course;
};

/** Keeps the section short so users don't have to scroll through every comment */
const REVIEWS_PER_PAGE = 5;

export function CourseReviews({ course }: CourseReviewsProps) {
  const [filter, setFilter] = useState<StarValue | null>(null);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const summary = getReviewSummary(course);
  const reviews = getCourseReviews(course);
  const filtered = filter
    ? reviews.filter((review) => review.rating === filter)
    : reviews;
  const totalPages = Math.ceil(filtered.length / REVIEWS_PER_PAGE);
  const visible = filtered.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE,
  );

  const changeFilter = (value: StarValue | null) => {
    setFilter(value);
    setPage(1);
  };

  const changePage = (value: number) => {
    setPage(value);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="opiniones"
      className="course-reviews"
      aria-labelledby="reviews-heading"
    >
      <h2 id="reviews-heading" className="course-detail__section-title">
        Opiniones de estudiantes
      </h2>

      {reviews.length === 0 ? (
        <div className="course-reviews__empty">
          <p className="course-reviews__empty-title">
            Este curso aún no tiene opiniones
          </p>
          <p className="course-reviews__empty-text">
            Las primeras llegarán cuando sus estudiantes lo completen.
          </p>
        </div>
      ) : (
        <div className="course-reviews__layout">
          <div>
            <div className="course-reviews__score">
              <p className="course-reviews__average">
                {summary.average.toFixed(1)}
              </p>
              <div>
                <StarRating value={summary.average} size="md" />
                <p className="course-reviews__total">
                  {formatNumber(summary.count)} valoraciones
                </p>
              </div>
            </div>

            <ul className="course-reviews__bars" aria-label="Desglose por estrellas">
              {STARS.map((stars) => {
                const count = summary.counts[stars];
                const percent = summary.count
                  ? Math.round((count / summary.count) * 100)
                  : 0;
                const isActive = filter === stars;
                return (
                  <li key={stars}>
                    <button
                      type="button"
                      className={
                        isActive
                          ? "course-reviews__bar course-reviews__bar--active"
                          : "course-reviews__bar"
                      }
                      onClick={() => changeFilter(isActive ? null : stars)}
                      aria-pressed={isActive}
                      aria-label={`${stars} estrellas: ${percent}%. ${isActive ? "Quitar filtro" : "Filtrar comentarios"}`}
                    >
                      <span className="course-reviews__bar-label">
                        {stars}
                        <img
                          className="course-reviews__bar-star"
                          src={StarFilledIcon}
                          alt=""
                        />
                      </span>
                      <span className="course-reviews__bar-track">
                        <span
                          className="course-reviews__bar-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="course-reviews__bar-percent">
                        {percent}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div ref={listRef} className="course-reviews__comments">
            <div className="course-reviews__comments-header">
              <p className="course-reviews__comments-title">
                {filter ? (
                  <>
                    Comentarios con <strong>{filter} estrellas</strong>
                  </>
                ) : (
                  "Comentarios más recientes"
                )}
              </p>
              {filter && (
                <button
                  type="button"
                  className="course-reviews__show-all"
                  onClick={() => changeFilter(null)}
                >
                  Ver todos
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <p className="course-reviews__no-results">
                Todavía no hay comentarios con {filter}{" "}
                {filter === 1 ? "estrella" : "estrellas"}.
              </p>
            ) : (
              <ul className="course-reviews__list">
                {visible.map((review) => (
                  <li key={review.id} className="course-review">
                    <span className="course-review__avatar" aria-hidden="true">
                      {review.authorName.charAt(0)}
                    </span>
                    <div className="course-review__content">
                      <p className="course-review__author">
                        {review.authorName}
                      </p>
                      <div className="course-review__meta">
                        <StarRating value={review.rating} />
                        <span className="course-review__date">
                          {formatRelativeTime(review.createdAt)}
                        </span>
                      </div>
                      <p className="course-review__text">{review.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="course-reviews__pagination">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={changePage}
                label="Páginas de opiniones"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
