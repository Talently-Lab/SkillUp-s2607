import { courseRevenue } from "@/modules/admin/utils/metrics";
import type { Course } from "@/shared/types/course";
import {
  formatMoneyRounded,
  formatNumber,
  formatPercent,
} from "@/shared/utils/format";
import "./TopCourses.css";

const TOP_LIMIT = 3;

type TopCoursesProps = {
  courses: Course[];
  totalRevenue: number;
};

export function TopCourses({ courses, totalRevenue }: TopCoursesProps) {
  const top = courses
    .filter((course) => courseRevenue(course) > 0)
    .sort((a, b) => courseRevenue(b) - courseRevenue(a))
    .slice(0, TOP_LIMIT);

  return (
    <section aria-labelledby="top-courses-heading" className="top-courses">
      <h2 id="top-courses-heading" className="top-courses__title">
        Cursos más vendidos
      </h2>

      {top.length === 0 ? (
        <p className="top-courses__empty">Aún no hay ventas registradas.</p>
      ) : (
        <ol className="top-courses__list">
          {top.map((course, index) => {
            const revenue = courseRevenue(course);
            const share = totalRevenue ? (revenue / totalRevenue) * 100 : 0;

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
                    {course.instructor} · {formatNumber(course.students)} ventas
                  </p>
                  <div className="top-courses__revenue">
                    <span className="top-courses__bar" aria-hidden="true">
                      <span
                        className="top-courses__bar-fill"
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                    </span>
                    <span className="top-courses__amount">
                      {formatMoneyRounded(revenue)}
                    </span>
                  </div>
                  <p className="top-courses__share">
                    {formatPercent(share)} de los ingresos
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
