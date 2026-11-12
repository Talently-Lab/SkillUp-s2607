import { Link } from "react-router";

import type { Course } from "@/shared/types/course";
import type { Enrollment } from "@/shared/types/enrollment";
import { learnPath } from "@/shared/utils/paths";

import BarChartIcon from "@/assets/icons/bar-chart.svg";
import CheckCircleIcon from "@/assets/icons/check-circle.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import StarIcon from "@/assets/icons/star-filled.svg";
import "./CourseCard.css";

type CourseCardProps = {
  course: Course;
  /** The signed-in student's enrollment in this course, if any */
  enrollment?: Pick<Enrollment, "status" | "progressPercent">;
  /** Small ribbon over the image, e.g. "#1 del mes" on the landing */
  ribbon?: string;
};

const AVATAR_TINTS = ["#cbb8ff", "#a9f5e8", "#ffe08a", "#ffc2d4", "#bfe3ff"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CourseCard({ course, enrollment, ribbon }: CourseCardProps) {
  const isFree = course.price === null;
  const isCompleted = enrollment?.status === "completed";
  const coursePath = `/catalog/${course.slug}`;
  const tint = AVATAR_TINTS[course.instructor.length % AVATAR_TINTS.length];

  return (
    <article className="course-card">
      <div className="course-card__media">
        <img
          className="course-card__image"
          src={course.image}
          alt=""
          loading="lazy"
        />
        <span className="course-card__tag">{course.category}</span>
        {isFree && !enrollment && (
          <span className="course-card__tag course-card__tag--free">GRATIS</span>
        )}
        {ribbon && <span className="course-card__ribbon">★ {ribbon}</span>}
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
        <h3 className="course-card__title">
          <Link to={coursePath} className="course-card__link">
            {course.title}
          </Link>
        </h3>
        <p className="course-card__instructor">
          <i aria-hidden="true" style={{ background: tint }}>
            {initials(course.instructor)}
          </i>
          {course.instructor}
        </p>

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
          <div className="course-card__meta-item course-card__meta-item--star">
            <dt className="visually-hidden">Valoración</dt>
            <img className="course-card__meta-icon" src={StarIcon} alt="" />
            <dd>{course.rating.toFixed(1).replace(".", ",")}</dd>
          </div>
        </dl>
      </div>

      <div className="course-card__footer">
        {enrollment ? (
          <>
            <span className="course-card__enrolled">Ya estás inscripto</span>
            <Link
              to={learnPath(course.slug)}
              className="btn btn-primary btn-sm course-card__action"
            >
              {isCompleted ? "Repasar" : "Continuar"}
            </Link>
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
              {isFree ? (
                "Gratis"
              ) : (
                <>
                  <small>US$</small>
                  {course.price}
                </>
              )}
            </span>
            <Link
              to={coursePath}
              className={`btn btn-sm course-card__action ${isFree ? "btn-soft" : "btn-primary"}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              {isFree ? "Empezá gratis" : "Ver curso"}
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

/** Same footprint as CourseCard so the grid doesn't jump when data arrives */
export function CourseCardSkeleton() {
  return (
    <div className="course-card course-card--skeleton" aria-hidden="true">
      <span className="sk course-card__media" />
      <div className="course-card__body">
        <span className="sk sk--title" style={{ width: "90%" }} />
        <span className="sk sk--title" style={{ width: "60%" }} />
        <span className="course-card__instructor">
          <span className="sk sk--circle" style={{ width: 24, height: 24 }} />
          <span className="sk sk--text" style={{ width: "45%" }} />
        </span>
        <span className="sk sk--text" style={{ width: "70%" }} />
      </div>
      <div className="course-card__footer">
        <span className="sk" style={{ width: 60, height: 22 }} />
        <span className="sk" style={{ width: 90, height: 32, borderRadius: 10 }} />
      </div>
    </div>
  );
}
