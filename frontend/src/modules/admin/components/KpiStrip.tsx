import type { CSSProperties } from "react";

import type { RevenueKpis } from "@/modules/admin/utils/metrics";
import type { PlatformStats } from "@/shared/types/adminStats";
import {
  formatMoneyRounded,
  formatNumber,
  formatPercent,
} from "@/shared/utils/format";
import TrendingDownIcon from "@/assets/icons/trending-down.svg";
import TrendingUpIcon from "@/assets/icons/trending-up.svg";
import "./KpiStrip.css";

type KpiStripProps = {
  revenue: RevenueKpis;
  stats: PlatformStats;
};

export function KpiStrip({ revenue, stats }: KpiStripProps) {
  const isUp = revenue.monthDelta >= 0;

  const secondary = [
    {
      label: "Estudiantes activos",
      value: formatNumber(stats.students.active),
      hint: `Últimos 30 días · ${formatNumber(stats.enrollments.total)} inscripciones`,
    },
    {
      label: "Docentes registrados",
      value: formatNumber(stats.teachers.total),
      hint: `${formatNumber(stats.teachers.withPublishedCourses)} con cursos publicados`,
    },
    {
      label: "Tasa de finalización",
      value: formatPercent(stats.completionRate),
      hint: "Promedio ponderado por inscritos",
    },
  ];

  return (
    <section aria-label="Métricas generales" className="kpi-strip">
      <div className="kpi-strip__hero">
        <p className="kpi-strip__hero-label">Ingresos totales acumulados</p>
        <p className="kpi-strip__hero-value">
          {formatMoneyRounded(revenue.totalRevenue)}
        </p>
        <div className="kpi-strip__hero-footer">
          <span
            className={`kpi-strip__delta ${isUp ? "kpi-strip__delta--up" : "kpi-strip__delta--down"}`}
          >
            <span
              className="kpi-strip__delta-icon"
              style={
                {
                  "--icon": `url("${isUp ? TrendingUpIcon : TrendingDownIcon}")`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
            {isUp ? "+" : ""}
            {formatPercent(revenue.monthDelta)} vs mes anterior
          </span>
          <span className="kpi-strip__hero-hint">
            {formatMoneyRounded(revenue.lastYearRevenue)} en los últimos 12
            meses
          </span>
        </div>
      </div>

      <dl className="kpi-strip__list">
        {secondary.map((kpi) => (
          <div key={kpi.label} className="kpi-strip__item">
            <dt className="kpi-strip__label">{kpi.label}</dt>
            <dd className="kpi-strip__value">{kpi.value}</dd>
            <dd className="kpi-strip__hint">{kpi.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
