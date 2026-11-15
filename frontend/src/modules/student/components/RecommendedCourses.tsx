import { Link } from "react-router";

import type { Course } from "@/shared/types/course";
import { formatDuration, formatPrice } from "@/shared/utils/format";
import { coursePath } from "@/shared/utils/paths";
import ClockIcon from "@/assets/icons/clock.svg";
import "./RecommendedCourses.css";

type RecommendedCoursesProps = {
  courses: Course[];
};

export function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  return (
    <section aria-labelledby="recommended-heading">
      <h2 id="recommended-heading" className="recommended__title">
        Recomendado para ti
      </h2>
      <ul className="recommended__list">
        {courses.map((course) => (
          <li key={course.id}>
            <Link to={coursePath(course.slug)} className="recommended__item">
              <img
                className="recommended__image"
                src={course.image}
                alt=""
                loading="lazy"
              />
              <span className="recommended__info">
                <span className="recommended__name">{course.title}</span>
                <span className="recommended__meta">
                  <img
                    className="recommended__meta-icon"
                    src={ClockIcon}
                    alt=""
                  />
                  {formatDuration(course.durationHours)} · {formatPrice(course.price)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
