import { useState } from "react";
import { useSearchParams } from "react-router";

import { courses } from "../../../shared/mocks/courses";
import type { Course, CourseLevel } from "../../../shared/types/course";
import { normalizeText } from "../../../shared/utils/format";
import type {
  DurationFilter,
  PriceFilter,
  SortOption,
} from "../constants/filters";

export interface CatalogFilterState {
  categories: string[];
  levels: CourseLevel[];
  price: PriceFilter;
  duration: DurationFilter;
}

const initialFilters: CatalogFilterState = {
  categories: [],
  levels: [],
  price: "all",
  duration: "all",
};

function matchesDuration(hours: number, duration: DurationFilter): boolean {
  if (duration === "short") return hours < 10;
  if (duration === "medium") return hours >= 10 && hours <= 30;
  if (duration === "long") return hours > 30;
  return true;
}

function matchesFilters(
  course: Course,
  query: string,
  filters: CatalogFilterState,
): boolean {
  if (query) {
    const haystack = normalizeText(
      `${course.title} ${course.category} ${course.instructor}`,
    );
    if (!haystack.includes(query)) return false;
  }
  if (
    filters.categories.length &&
    !filters.categories.includes(course.category)
  )
    return false;
  if (filters.levels.length && !filters.levels.includes(course.level))
    return false;
  if (filters.price === "free" && course.price !== null) return false;
  if (filters.price === "paid" && course.price === null) return false;
  return matchesDuration(course.durationHours, filters.duration);
}

function compareCourses(a: Course, b: Course, sort: SortOption): number {
  switch (sort) {
    case "rating":
      return b.rating - a.rating;
    case "shortest":
      return a.durationHours - b.durationHours;
    case "price":
      return (a.price ?? 0) - (b.price ?? 0);
    default:
      return b.students - a.students;
  }
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/** The search query lives in the URL (?q=) so it can be shared or linked. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilterState>(initialFilters);
  const [sort, setSort] = useState<SortOption>("popular");

  const query = params.get("q") ?? "";
  const normalizedQuery = normalizeText(query.trim());

  const results = courses
    .filter((course) => matchesFilters(course, normalizedQuery, filters))
    .sort((a, b) => compareCourses(a, b, sort));

  const activeCount =
    filters.categories.length +
    filters.levels.length +
    (filters.price !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0);

  const setQuery = (value: string) =>
    setParams(value ? { q: value } : {}, { replace: true });

  const toggleCategory = (category: string) =>
    setFilters((prev) => ({
      ...prev,
      categories: toggle(prev.categories, category),
    }));

  const toggleLevel = (level: CourseLevel) =>
    setFilters((prev) => ({ ...prev, levels: toggle(prev.levels, level) }));

  const setPrice = (price: PriceFilter) =>
    setFilters((prev) => ({ ...prev, price }));

  const setDuration = (duration: DurationFilter) =>
    setFilters((prev) => ({ ...prev, duration }));

  const resetFilters = () => setFilters(initialFilters);

  const resetAll = () => {
    resetFilters();
    setQuery("");
  };

  return {
    query,
    setQuery,
    filters,
    sort,
    setSort,
    results,
    activeCount,
    toggleCategory,
    toggleLevel,
    setPrice,
    setDuration,
    resetFilters,
    resetAll,
  };
}
