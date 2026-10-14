import { useState } from "react";

import { courseRevenue } from "@/modules/admin/utils/metrics";
import { courses as mockCourses } from "@/shared/mocks/courses";
import type { Course, CourseInput, CourseStatus } from "@/shared/types/course";
import { normalizeText } from "@/shared/utils/format";

export type StatusFilter = "all" | CourseStatus;
export type SortKey =
  | "title"
  | "category"
  | "durationHours"
  | "price"
  | "students"
  | "revenue";
export type SortState = { key: SortKey; dir: "asc" | "desc" };

export const isDraft = (course: Course) => course.status === "draft";

function createId(title: string): string {
  const slug = normalizeText(title)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
}

function sortValue(course: Course, key: SortKey): string | number {
  if (key === "price") return course.price ?? 0;
  if (key === "revenue") return courseRevenue(course);
  return course[key];
}

export function useAdminCourses() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "title", dir: "asc" });

  const counts: Record<StatusFilter, number> = {
    all: courses.length,
    published: courses.filter((course) => !isDraft(course)).length,
    draft: courses.filter(isDraft).length,
  };

  const search = normalizeText(query.trim());
  const dir = sort.dir === "asc" ? 1 : -1;
  const rows = courses
    .filter((course) => {
      if (
        search &&
        !normalizeText(`${course.title} ${course.instructor}`).includes(search)
      )
        return false;
      if (category !== "all" && course.category !== category) return false;
      if (status === "published" && isDraft(course)) return false;
      if (status === "draft" && !isDraft(course)) return false;
      return true;
    })
    .sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      if (typeof av === "string" && typeof bv === "string")
        return av.localeCompare(bv, "es") * dir;
      return ((av as number) - (bv as number)) * dir;
    });

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
  };

  const createCourse = (input: CourseInput) =>
    setCourses((prev) => [
      { ...input, id: createId(input.title), rating: 0, students: 0 },
      ...prev,
    ]);

  const updateCourse = (id: string, input: CourseInput) =>
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id ? { ...course, ...input } : course,
      ),
    );

  const deleteCourse = (id: string) =>
    setCourses((prev) => prev.filter((course) => course.id !== id));

  const toggleStatus = (id: string) =>
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? { ...course, status: isDraft(course) ? "published" : "draft" }
          : course,
      ),
    );

  return {
    courses,
    rows,
    counts,
    query,
    setQuery,
    category,
    setCategory,
    status,
    setStatus,
    sort,
    toggleSort,
    resetFilters,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleStatus,
  };
}
