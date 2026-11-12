import { Link } from "react-router";

import BookOpenIcon from "@/assets/icons/book-open.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import "./EmptyCourses.css";

export function EmptyCourses() {
  return (
    <div className="empty-courses">
      <span className="empty-courses__icon-wrap">
        <img className="empty-courses__icon" src={BookOpenIcon} alt="" />
      </span>
      <h2 className="empty-courses__title">
        Tu panel está listo para tu primer curso
      </h2>
      <p className="empty-courses__text">
        Explorá el catálogo e inscribite con un clic. Tu progreso aparecerá
        acá.
      </p>
      <Link to="/catalog" className="empty-courses__btn">
        Ver catálogo
        <img className="empty-courses__btn-icon" src={ArrowRightIcon} alt="" />
      </Link>
    </div>
  );
}
