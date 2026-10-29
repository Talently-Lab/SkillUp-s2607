import { KpiStrip } from "@/modules/admin/components/KpiStrip";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { SalesChart } from "@/modules/admin/components/SalesChart";
import { TopCourses } from "@/modules/admin/components/TopCourses";
import {
  averageTicket,
  getMonthlySales,
  getRevenueKpis,
} from "@/modules/admin/utils/metrics";
import { PageLoader } from "@/shared/components/Loader";
import { useFetch } from "@/shared/hooks/useFetch";
import { courses } from "@/shared/mocks/courses";
import { adminStatsService } from "@/shared/services/adminStatsService";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import "@/modules/admin/components/Button.css";
import "./AdminPage.css";
import "./Admin.css";

const today = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

// TODO: obtener las ventas desde la API cuando las exponga
const monthly = getMonthlySales(
  getRevenueKpis(courses, []).totalRevenue,
  averageTicket(courses),
);
const revenue = getRevenueKpis(courses, monthly);

export function Admin() {
  const statsQuery = useFetch("admin-stats", adminStatsService.get);
  const stats = statsQuery.data;

  return (
    <div className="admin-dashboard">
      <header>
        <h1 className="admin-dashboard__title">Panel de control</h1>
        <p className="admin-dashboard__subtitle">
          Resumen del campus al {today}
        </p>
      </header>

      {statsQuery.isLoading ? (
        <PageLoader label="Cargando métricas…" />
      ) : !stats ? (
        <div className="admin-page__empty" role="alert">
          <MaskIcon src={AlertIcon} className="admin-page__empty-icon" />
          <p className="admin-page__empty-title">
            No pudimos cargar las métricas
          </p>
          <p className="admin-page__empty-text">
            Revisa tu conexión e inténtalo de nuevo.
          </p>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={statsQuery.retry}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <KpiStrip revenue={revenue} stats={stats} />

          <div className="admin-dashboard__grid">
            <SalesChart data={monthly} />
            <TopCourses
              courses={stats.topCourses}
              totalEnrollments={stats.enrollments.total}
            />
          </div>

          <p className="admin-dashboard__note">
            Los ingresos y las ventas mensuales son de demostración, el resto de
            las métricas viene de la plataforma.
          </p>
        </>
      )}
    </div>
  );
}
