import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { Modal } from "@/modules/admin/components/Modal";
import type { AdminUser } from "@/shared/types/adminUser";
import { roleName } from "@/shared/utils/roles";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import BanIcon from "@/assets/icons/ban.svg";
import "./Button.css";
import "./ConfirmMessage.css";

type SuspendUserModalProps = {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
};

export function SuspendUserModal({
  user,
  onClose,
  onConfirm,
}: SuspendUserModalProps) {
  return (
    <Modal
      size="sm"
      title="Suspender cuenta"
      description={`${user.name} · ${roleName[user.role]}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={onClose}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className="admin-button admin-button--danger"
            onClick={onConfirm}
          >
            <MaskIcon src={BanIcon} />
            Suspender cuenta
          </button>
        </>
      }
    >
      <div className="confirm-message">
        <span className="confirm-message__icon">
          <MaskIcon src={AlertIcon} />
        </span>
        <div>
          <p>
            <strong>{user.email}</strong> no podrá iniciar sesión ni acceder a
            sus {user.role === "teacher" ? "cursos asignados" : "cursos"} hasta
            que reactives la cuenta.
          </p>
          <p className="confirm-message__detail">
            Sus datos, progreso y certificados se conservan. Puedes reactivarla
            en cualquier momento.
          </p>
        </div>
      </div>
    </Modal>
  );
}
