import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { Modal } from "@/modules/admin/components/Modal";
import type { Course } from "@/shared/types/course";
import { formatNumber } from "@/shared/utils/format";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import "./Button.css";
import "./DeleteCourseModal.css";

type DeleteCourseModalProps = {
  course: Course;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteCourseModal({
  course,
  onClose,
  onConfirm,
}: DeleteCourseModalProps) {
  return (
    <Modal
      size="sm"
      title="Eliminar curso"
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
            <MaskIcon src={TrashIcon} />
            Eliminar curso
          </button>
        </>
      }
    >
      <div className="delete-course">
        <span className="delete-course__icon">
          <MaskIcon src={AlertIcon} />
        </span>
        <div>
          <p>
            Vas a eliminar <strong>“{course.title}”</strong>.
          </p>
          <p className="delete-course__detail">
            Dejará de aparecer en el catálogo
            {course.students > 0 && (
              <>
                {" "}
                y <strong>
                  {formatNumber(course.students)} estudiantes
                </strong>{" "}
                perderán el acceso
              </>
            )}
            . Esta acción no se puede deshacer.
          </p>
        </div>
      </div>
    </Modal>
  );
}
