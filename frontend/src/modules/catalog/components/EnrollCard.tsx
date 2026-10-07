import type { Course } from "../../../shared/types/course";
import { formatPrice } from "../../../shared/utils/format";
import CartShoppingIcon from "../../../assets/icons/cart-shopping.svg";
import CertificateIcon from "../../../assets/icons/certificate-ssl.svg";
import ClockIcon from "../../../assets/icons/clock.svg";
import LockIcon from "../../../assets/icons/lock.svg";
import MonitorSmartphoneIcon from "../../../assets/icons/monitor-smartphone.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import "./EnrollCard.css";

type EnrollCardProps = {
  course: Course;
};

export function EnrollCard({ course }: EnrollCardProps) {
  const isFree = course.price === null;
  const includes = [
    { icon: ClockIcon, label: `${course.durationHours} horas de contenido` },
    { icon: PlayIcon, label: `${course.lessons} lecciones en video` },
    { icon: MonitorSmartphoneIcon, label: "Acceso desde cualquier dispositivo" },
    { icon: CertificateIcon, label: "Certificado verificable" },
  ];

  return (
    <div className="enroll-card">
      <img className="enroll-card__image" src={course.image} alt="" />
      <div className="enroll-card__body">
        {isFree ? (
          <>
            <p className="enroll-card__price enroll-card__price--free">Gratis</p>
            {/* TODO: la inscripción está pendiente de ser desarrollada */}
            <button type="button" className="enroll-card__btn enroll-card__btn--primary">
              Inscribirme
            </button>
            <p className="enroll-card__note">
              Acceso inmediato tras la inscripción
            </p>
          </>
        ) : (
          <>
            <p className="enroll-card__price">{formatPrice(course.price)}</p>
            {/* TODO: el checkout está pendiente de ser desarrollado */}
            <button type="button" className="enroll-card__btn enroll-card__btn--primary">
              Comprar ahora
            </button>
            {/* TODO: el carrito está pendiente de ser desarrollado */}
            <button type="button" className="enroll-card__btn enroll-card__btn--outline">
              <img className="enroll-card__btn-icon" src={CartShoppingIcon} alt="" />
              Añadir al carrito
            </button>
            <p className="enroll-card__note">
              <img className="enroll-card__note-icon" src={LockIcon} alt="" />
              Pago seguro · Acceso inmediato tras el pago
            </p>
          </>
        )}

        <ul className="enroll-card__includes">
          {includes.map(({ icon, label }) => (
            <li key={label} className="enroll-card__include">
              <img className="enroll-card__include-icon" src={icon} alt="" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
