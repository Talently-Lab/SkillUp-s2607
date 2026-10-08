import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useDismiss } from "@/shared/hooks/useDismiss";
import { notificationsByUser } from "@/shared/mocks/notifications";
import type {
  AppNotification,
  NotificationType,
} from "@/shared/types/notification";
import { formatRelativeTime } from "@/shared/utils/format";
import BellIcon from "@/assets/icons/bell.svg";
import BellOffIcon from "@/assets/icons/bell-off.svg";
import CartShoppingIcon from "@/assets/icons/cart-shopping.svg";
import CertificateIcon from "@/assets/icons/certificate-ssl.svg";
import CheckIcon from "@/assets/icons/check.svg";
import GraduationCapIcon from "@/assets/icons/graduation-cap.svg";
import "./NotificationBell.css";

type NotificationBellProps = {
  userId: string;
};

const typeIcon: Record<NotificationType, string> = {
  payment: CartShoppingIcon,
  quiz: CheckIcon,
  certificate: CertificateIcon,
  welcome: GraduationCapIcon,
};

export function NotificationBell({ userId }: NotificationBellProps) {
  // TODO: obtener las notificaciones desde la API cuando esté lista
  const [notifications, setNotifications] = useState<AppNotification[]>(
    () => notificationsByUser[userId] ?? [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((item) => !item.read).length;

  useDismiss(ref, isOpen, () => setIsOpen(false));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

  const openItem = (item: AppNotification) => {
    markRead(item.id);
    if (!item.href) return;
    setIsOpen(false);
    navigate(item.href);
  };

  return (
    <div ref={ref} className="notification-bell">
      <button
        type="button"
        className={
          isOpen
            ? "notification-bell__trigger notification-bell__trigger--open"
            : "notification-bell__trigger"
        }
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={
          unreadCount
            ? `Notificaciones, ${unreadCount} sin leer`
            : "Notificaciones"
        }
      >
        <img className="notification-bell__icon" src={BellIcon} alt="" />
        {unreadCount > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-bell__panel"
          role="dialog"
          aria-label="Notificaciones"
        >
          <div className="notification-bell__header">
            <div>
              <p className="notification-bell__heading">Notificaciones</p>
              <p className="notification-bell__summary">
                {unreadCount ? `${unreadCount} sin leer` : "Todo leído"}
              </p>
            </div>
            <button
              type="button"
              className="notification-bell__read-all"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-bell__empty">
              <img
                className="notification-bell__empty-icon"
                src={BellOffIcon}
                alt=""
              />
              <p className="notification-bell__empty-title">Estás al día</p>
              <p className="notification-bell__empty-text">
                Te avisaremos de pagos, quizzes y certificados.
              </p>
            </div>
          ) : (
            <ul className="notification-bell__list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.read
                      ? "notification-bell__item"
                      : "notification-bell__item notification-bell__item--unread"
                  }
                >
                  <button
                    type="button"
                    className="notification-bell__item-btn"
                    onClick={() => openItem(item)}
                  >
                    <span
                      className={`notification-bell__type notification-bell__type--${item.type}`}
                    >
                      <img
                        className="notification-bell__type-icon"
                        src={typeIcon[item.type]}
                        alt=""
                      />
                    </span>
                    <span className="notification-bell__content">
                      <span className="notification-bell__title">
                        {item.title}
                      </span>
                      <span className="notification-bell__body">
                        {item.body}
                      </span>
                      <span className="notification-bell__time">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </span>
                  </button>
                  {!item.read && (
                    <button
                      type="button"
                      className="notification-bell__mark"
                      onClick={() => markRead(item.id)}
                      title="Marcar como leída"
                      aria-label={`Marcar como leída: ${item.title}`}
                    >
                      <span className="notification-bell__dot" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
