import type { UserStatus } from "@/shared/types/adminUser";
import type { CourseStatus } from "@/shared/types/course";
import "./StatusBadge.css";

const labels: Record<CourseStatus | UserStatus, string> = {
  published: "Publicado",
  draft: "Borrador",
  active: "Activa",
  suspended: "Suspendida",
};

export function StatusBadge({
  status = "published",
}: {
  status?: CourseStatus | UserStatus;
}) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
