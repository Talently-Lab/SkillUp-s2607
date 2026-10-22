import { Link } from "react-router";

import type { Course } from "@/shared/types/course";
import { formatPrice } from "@/shared/utils/format";
import { learnPath } from "@/shared/utils/paths";
import CartShoppingIcon from "@/assets/icons/cart-shopping.svg";
import "./MobileEnrollBar.css";

type MobileEnrollBarProps = {
  course: Course;
  enrolled: boolean;
  /** False for admin and teacher accounts */
  canEnroll: boolean;
  enrolling: boolean;
  onEnroll: () => void;
};

export function MobileEnrollBar({
  course,
  enrolled,
  canEnroll,
  enrolling,
  onEnroll,
}: MobileEnrollBarProps) {
  const isFree = course.price === null;

  return (
    <div className="mobile-enroll">
      <div className="mobile-enroll__inner">
        <div className="mobile-enroll__info">
          <p className="mobile-enroll__title">{course.title}</p>
          <p
            className={
              isFree
                ? "mobile-enroll__price mobile-enroll__price--free"
                : "mobile-enroll__price"
            }
          >
            {formatPrice(course.price)}
          </p>
        </div>
        {isFree && enrolled ? (
          <Link to={learnPath(course.slug)} className="mobile-enroll__btn">
            Ir al curso
          </Link>
        ) : isFree ? (
          <button
            type="button"
            className="mobile-enroll__btn"
            onClick={onEnroll}
            disabled={!canEnroll || enrolling}
          >
            {enrolling ? "Inscribiendo…" : "Inscribirme"}
          </button>
        ) : (
          <>
            {/* TODO: el carrito está pendiente de ser desarrollado */}
            <button
              type="button"
              className="mobile-enroll__cart"
              aria-label="Añadir al carrito"
            >
              <img
                className="mobile-enroll__cart-icon"
                src={CartShoppingIcon}
                alt=""
              />
            </button>
            {/* TODO: el checkout está pendiente de ser desarrollado */}
            <button type="button" className="mobile-enroll__btn">
              Comprar ahora
            </button>
          </>
        )}
      </div>
    </div>
  );
}
