import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import type { TeacherMetricsData } from "@/modules/teacher/hooks/useTeacherDashboard";
import { INACTIVE_DAYS } from "@/modules/teacher/utils/roster";
import { formatNumber } from "@/shared/utils/format";
import StarFilledIcon from "@/assets/icons/star-filled.svg";
import "./TeacherMetrics.css";

type TeacherMetricsProps = {
  metrics: TeacherMetricsData;
};

export function TeacherMetrics({ metrics }: TeacherMetricsProps) {
  const { totalStudents, courseCount, avgRating, completionRate, atRisk } =
    metrics;

  return (
    <section aria-label="Métricas de tus cursos" className="teacher-metrics">
      <div className="teacher-metrics__hero">
        <p className="teacher-metrics__hero-label">Alumnos inscritos</p>
        <p className="teacher-metrics__hero-value">
          {formatNumber(totalStudents)}
        </p>
        <p className="teacher-metrics__hero-hint">
          en {courseCount}{" "}
          {courseCount === 1 ? "curso asignado" : "cursos asignados"}
        </p>
      </div>

      <dl className="teacher-metrics__list">
        <div className="teacher-metrics__item">
          <dt className="teacher-metrics__label">Valoración media</dt>
          <dd className="teacher-metrics__value">
            {avgRating ? avgRating.toFixed(1) : "—"}
            {avgRating && (
              <MaskIcon
                src={StarFilledIcon}
                className="teacher-metrics__star"
              />
            )}
          </dd>
          <dd className="teacher-metrics__hint">De tus cursos publicados</dd>
        </div>
        <div className="teacher-metrics__item">
          <dt className="teacher-metrics__label">Tasa de finalización</dt>
          <dd className="teacher-metrics__value">{completionRate}%</dd>
          <dd className="teacher-metrics__hint">
            Alumnos que terminaron el curso
          </dd>
        </div>
        <div className="teacher-metrics__item">
          <dt className="teacher-metrics__label">Alumnos en riesgo</dt>
          <dd
            className={
              atRisk > 0
                ? "teacher-metrics__value teacher-metrics__value--danger"
                : "teacher-metrics__value"
            }
          >
            {atRisk}
          </dd>
          <dd className="teacher-metrics__hint">
            Poco avance y {INACTIVE_DAYS}+ días sin actividad
          </dd>
        </div>
      </dl>
    </section>
  );
}
