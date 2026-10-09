import type { Course } from "@/shared/types/course";

/** Share of the list price actually collected after promos, coupons and refunds */
const NET_FACTOR = 0.86;
/** Share of the all-time revenue earned in the last 12 months */
const LAST_YEAR_SHARE = 0.62;
/** Share of the enrollments that belong to students active in the last 30 days */
const ACTIVE_SHARE = 0.58;

export function courseRevenue(course: Course): number {
  return course.price
    ? Math.round(course.price * course.students * NET_FACTOR)
    : 0;
}

function hash(value: string): number {
  let result = 11;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

/** Estimated completion rate (percent) of a course, stable across renders */
function completionRate(course: Course): number {
  return course.students ? 38 + (hash(course.id) % 35) : 0;
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

export type PlatformKpis = {
  totalRevenue: number;
  lastYearRevenue: number;
  monthDelta: number;
  activeStudents: number;
  totalEnrollments: number;
  teachers: number;
  courses: number;
  completion: number;
};

export function getPlatformKpis(
  courses: Course[],
  monthly: MonthlySale[],
): PlatformKpis {
  const totalRevenue = courses.reduce(
    (total, course) => total + courseRevenue(course),
    0,
  );
  const totalEnrollments = courses.reduce(
    (total, course) => total + course.students,
    0,
  );
  // Weighted by the enrollments, so big courses count more
  const completion = totalEnrollments
    ? courses.reduce(
        (total, course) => total + completionRate(course) * course.students,
        0,
      ) / totalEnrollments
    : 0;
  const last = monthly.at(-1)?.revenue ?? 0;
  const previous = monthly.at(-2)?.revenue ?? 0;

  return {
    totalRevenue,
    lastYearRevenue: monthly.reduce((total, month) => total + month.revenue, 0),
    monthDelta: previous ? ((last - previous) / previous) * 100 : 0,
    activeStudents: Math.round(totalEnrollments * ACTIVE_SHARE),
    totalEnrollments,
    teachers: new Set(courses.map((course) => course.instructor)).size,
    courses: courses.length,
    completion: Math.round(completion * 10) / 10,
  };
}
