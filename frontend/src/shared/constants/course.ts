import type { CourseLevel } from "@/shared/types/course";

export const levels: CourseLevel[] = ["Principiante", "Intermedio", "Avanzado"];

/**
 * Covers live in /public so their URL is stable across builds and can be
 * saved as the course `coverUrl`.
 */
export const courseImages = {
  dataAnalysis: "/images/courses/data-analysis.jpg",
  uxUi: "/images/courses/ux-ui.jpg",
  python: "/images/courses/python.jpg",
  marketing: "/images/courses/marketing.jpg",
  finance: "/images/courses/finance.jpg",
  english: "/images/courses/english.jpg",
  leadership: "/images/courses/leadership.jpg",
  cloud: "/images/courses/cloud.jpg",
};

export const coverOptions = Object.values(courseImages);

/** Cover shown when a course has no `coverUrl`, by category slug */
const categoryCovers: Record<string, string> = {
  datos: courseImages.dataAnalysis,
  diseno: courseImages.uxUi,
  programacion: courseImages.python,
  marketing: courseImages.marketing,
  finanzas: courseImages.finance,
  idiomas: courseImages.english,
  liderazgo: courseImages.leadership,
  cloud: courseImages.cloud,
};

export function defaultCover(categorySlug: string): string {
  return categoryCovers[categorySlug] ?? courseImages.dataAnalysis;
}
