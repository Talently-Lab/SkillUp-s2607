import type { Course } from "../../../shared/types/course";
import { formatPrice } from "../../../shared/utils/format";
import CartShoppingIcon from "../../../assets/icons/cart-shopping.svg";
import "./MobileEnrollBar.css";

type MobileEnrollBarProps = {
  course: Course;
};

export function MobileEnrollBar({ course }: MobileEnrollBarProps) {
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
        {isFree ? (
          // TODO: la inscripción está pendiente de ser desarrollada
          <button type="button" className="mobile-enroll__btn">
            Inscribirme
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
