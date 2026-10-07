import type { CourseLevel } from "../../../shared/types/course";

export type PriceFilter = "all" | "free" | "paid";
export type DurationFilter = "all" | "short" | "medium" | "long";
export type SortOption = "popular" | "rating" | "shortest" | "price";

export const levels: CourseLevel[] = ["Principiante", "Intermedio", "Avanzado"];

export const priceOptions: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "free", label: "Gratis" },
  { value: "paid", label: "De pago" },
];

export const durationOptions: { value: DurationFilter; label: string }[] = [
  { value: "all", label: "Cualquier duración" },
  { value: "short", label: "Menos de 10 h" },
  { value: "medium", label: "10 a 30 h" },
  { value: "long", label: "Más de 30 h" },
];

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Más populares" },
  { value: "rating", label: "Mejor valorados" },
  { value: "shortest", label: "Menor duración" },
  { value: "price", label: "Menor precio" },
];
