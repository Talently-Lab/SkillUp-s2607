import { KpiStrip } from "@/modules/admin/components/KpiStrip";
import { SalesChart } from "@/modules/admin/components/SalesChart";
import { TopCourses } from "@/modules/admin/components/TopCourses";
import {
  averageTicket,
  getMonthlySales,
  getPlatformKpis,
} from "@/modules/admin/utils/metrics";
import { courses } from "@/shared/mocks/courses";
import "./Admin.css";

const today = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export function Admin() {
  // TODO: obtener las métricas desde la API cuando esté lista
  const baseKpis = getPlatformKpis(courses, []);
  const monthly = getMonthlySales(
    baseKpis.totalRevenue,
    averageTicket(courses),
  );
  const kpis = getPlatformKpis(courses, monthly);

  return (
    <div className="admin-dashboard">
      <header>
        <h1 className="admin-dashboard__title">Panel de control</h1>
        <p className="admin-dashboard__subtitle">
          Resumen del campus al {today}
        </p>
      </header>

      <KpiStrip kpis={kpis} />

      <div className="admin-dashboard__grid">
        <SalesChart data={monthly} />
        <TopCourses courses={courses} totalRevenue={kpis.totalRevenue} />
      </div>

      <p className="admin-dashboard__note">
        Ingresos netos estimados tras promociones y cupones. Los datos son de
        demostración.
      </p>
    </div>
  );
}
