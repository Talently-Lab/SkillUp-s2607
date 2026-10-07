import { useEffect, useRef, type ReactNode } from "react";

import CloseIcon from "../../../assets/icons/close.svg";
import "./FilterDrawer.css";

type FilterDrawerProps = {
  open: boolean;
  resultCount: number;
  onClose: () => void;
  children: ReactNode;
};

const desktopQuery = "(min-width: 1024px)";

export function FilterDrawer({
  open,
  resultCount,
  onClose,
  children,
}: FilterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // The drawer is mobile-only: close it if the viewport grows to desktop
    const media = window.matchMedia(desktopQuery);
    const onMediaChange = () => media.matches && onClose();

    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="filter-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros"
    >
      <div className="filter-drawer__backdrop" onClick={onClose} />
      <div className="filter-drawer__panel">
        <div className="filter-drawer__header">
          <p className="filter-drawer__title">Filtrar cursos</p>
          <button
            ref={closeButtonRef}
            type="button"
            className="filter-drawer__close"
            onClick={onClose}
            aria-label="Cerrar filtros"
          >
            <img className="filter-drawer__close-icon" src={CloseIcon} alt="" />
          </button>
        </div>
        <div className="filter-drawer__body">{children}</div>
        <div className="filter-drawer__footer">
          <button
            type="button"
            className="filter-drawer__submit"
            onClick={onClose}
          >
            Ver {resultCount} {resultCount === 1 ? "curso" : "cursos"}
          </button>
        </div>
      </div>
    </div>
  );
}
