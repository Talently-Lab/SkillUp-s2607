import type { CourseStatus } from "@/shared/types/course";
import "./StatusBadge.css";

export function StatusBadge({
  status = "published",
}: {
  status?: CourseStatus;
}) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {status === "published" ? "Publicado" : "Borrador"}
    </span>
  );
}
