import { useEffect, useRef, type ReactNode } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import CloseIcon from "@/assets/icons/close.svg";
import "./Modal.css";

type ModalProps = {
  title: string;
  description?: string;
  size?: "sm" | "lg";
  footer: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({
  title,
  description,
  size = "lg",
  footer,
  children,
  onClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby="modal-title"
      onClose={onClose}
      // A click on the dialog itself (not its content) is a click on the backdrop
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal__panel">
        <header className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <MaskIcon src={CloseIcon} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        <footer className="modal__footer">{footer}</footer>
      </div>
    </dialog>
  );
}
