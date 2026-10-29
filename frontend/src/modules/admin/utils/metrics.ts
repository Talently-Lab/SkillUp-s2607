import type { Course } from "@/shared/types/course";

/** Share of the list price actually collected after promos, coupons and refunds */
const NET_FACTOR = 0.86;
/** Share of the all-time revenue earned in the last 12 months */
const LAST_YEAR_SHARE = 0.62;

export function courseRevenue(course: Course): number {
  return course.price
    ? Math.round(course.price * course.students * NET_FACTOR)
    : 0;
}

export type MonthlySale = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

const monthWeights = [
  5.2, 5.8, 6.4, 6.1, 6.9, 7.6, 8.0, 8.4, 8.1, 9.4, 10.6, 11.5,
];
const monthFormat = new Intl.DateTimeFormat("es-AR", { month: "short" });

export function getMonthlySales(
  totalRevenue: number,
  averageTicket: number,
  now = new Date(),
): MonthlySale[] {
  const yearRevenue = totalRevenue * LAST_YEAR_SHARE;
  const weightsSum = monthWeights.reduce((total, weight) => total + weight, 0);

  return monthWeights.map((weight, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (monthWeights.length - 1 - index),
      1,
    );
    const revenue = Math.round((yearRevenue * weight) / weightsSum);
    const label = monthFormat.format(date).replace(".", "");

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      revenue,
      orders: averageTicket ? Math.round(revenue / averageTicket) : 0,
    };
  });
}

export function averageTicket(courses: Course[]): number {
  const paid = courses.filter((course) => course.price && course.students);
  const units = paid.reduce((total, course) => total + course.students, 0);
  const revenue = paid.reduce(
    (total, course) => total + courseRevenue(course),
    0,
  );
  return units ? revenue / units : 0;
}

/** The API has no sales data yet, so these come from the demo courses */
export type RevenueKpis = {
  totalRevenue: number;
  lastYearRevenue: number;
  monthDelta: number;
};

export function getRevenueKpis(
  courses: Course[],
  monthly: MonthlySale[],
): RevenueKpis {
  const last = monthly.at(-1)?.revenue ?? 0;
  const previous = monthly.at(-2)?.revenue ?? 0;

  return {
    totalRevenue: courses.reduce(
      (total, course) => total + courseRevenue(course),
      0,
    ),
    lastYearRevenue: monthly.reduce((total, month) => total + month.revenue, 0),
    monthDelta: previous ? ((last - previous) / previous) * 100 : 0,
  };
}
