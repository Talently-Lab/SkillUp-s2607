import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { StatusBadge } from "@/modules/admin/components/StatusBadge";
import type { Course } from "@/shared/types/course";
import { formatNumber } from "@/shared/utils/format";
import StarFilledIcon from "@/assets/icons/star-filled.svg";
import UsersIcon from "@/assets/icons/users.svg";
import "./AssignedCourseList.css";

type AssignedCourseListProps = {
  courses: Course[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function AssignedCourseList({
  courses,
  selectedId,
  onSelect,
}: AssignedCourseListProps) {
  return (
    <nav aria-label="Cursos asignados" className="assigned-courses">
      <h2 className="assigned-courses__title">
        Cursos asignados{" "}
        <span className="assigned-courses__count">({courses.length})</span>
      </h2>
      <ul className="assigned-courses__list">
        {courses.map((course) => {
          const active = course.id === selectedId;
          return (
            <li key={course.id} className="assigned-courses__item">
              <button
                type="button"
                onClick={() => onSelect(course.id)}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "assigned-courses__button assigned-courses__button--active"
                    : "assigned-courses__button"
                }
              >
                <img
                  src={course.image}
                  alt=""
                  className="assigned-courses__image"
                />
                <span className="assigned-courses__body">
                  <span className="assigned-courses__name">{course.title}</span>
                  <span className="assigned-courses__meta">
                    <span className="assigned-courses__stat">
                      <MaskIcon src={UsersIcon} />
                      {formatNumber(course.students)}
                    </span>
                    {course.rating > 0 && (
                      <span className="assigned-courses__stat">
                        <MaskIcon
                          src={StarFilledIcon}
                          className="assigned-courses__star"
                        />
                        {course.rating.toFixed(1)}
                      </span>
                    )}
                    {course.status === "draft" && (
                      <StatusBadge status="draft" />
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
