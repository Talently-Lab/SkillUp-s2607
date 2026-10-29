import type { TopCourse } from "@/shared/types/adminStats";
import {
  formatNumber,
  formatPercent,
  formatPrice,
} from "@/shared/utils/format";
import "./TopCourses.css";

const TOP_LIMIT = 3;

type TopCoursesProps = {
  courses: TopCourse[];
  totalEnrollments: number;
};

export function TopCourses({ courses, totalEnrollments }: TopCoursesProps) {
  // The API already sends them sorted by students
  const top = courses
    .filter((course) => course.students > 0)
    .slice(0, TOP_LIMIT);

  return (
    <section aria-labelledby="top-courses-heading" className="top-courses">
      <h2 id="top-courses-heading" className="top-courses__title">
        Cursos con más inscritos
      </h2>

      {top.length === 0 ? (
        <p className="top-courses__empty">Aún no hay inscripciones.</p>
      ) : (
        <ol className="top-courses__list">
          {top.map((course, index) => {
            const share = totalEnrollments
              ? (course.students / totalEnrollments) * 100
              : 0;

            return (
              <li key={course.id} className="top-courses__item">
                <span
                  className={`top-courses__rank ${index === 0 ? "top-courses__rank--first" : ""}`}
                  aria-label={`Puesto ${index + 1}`}
                >
                  {index + 1}
                </span>
                <div className="top-courses__body">
                  <p className="top-courses__course">{course.title}</p>
                  <p className="top-courses__meta">
                    {formatPrice(course.price)}
                  </p>
                  <div className="top-courses__revenue">
                    <span className="top-courses__bar" aria-hidden="true">
                      <span
                        className="top-courses__bar-fill"
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                    </span>
                    <span className="top-courses__amount">
                      {formatNumber(course.students)}
                    </span>
                  </div>
                  <p className="top-courses__share">
                    {formatPercent(share)} de las inscripciones
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
