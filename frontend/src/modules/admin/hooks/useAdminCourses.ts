import { useEffect, useState } from "react";

import { courseRevenue } from "@/modules/admin/utils/metrics";
import { adminCoursesService } from "@/shared/services/coursesService";
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
type LoadStatus = "loading" | "ready" | "error";

export const isDraft = (course: Course) => course.status === "draft";

function sortValue(course: Course, key: SortKey): string | number {
  if (key === "price") return course.price ?? 0;
  if (key === "revenue") return courseRevenue(course);
  return course[key];
}

/**
 * Loads every course once and filters and sorts them here. The mutations
 * throw the API error so the caller can show it.
 */
export function useAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "title", dir: "asc" });

  useEffect(() => {
    let ignore = false;
    adminCoursesService.list().then(
      (data) => {
        if (ignore) return;
        setCourses(data);
        setLoadStatus("ready");
      },
      () => {
        if (!ignore) setLoadStatus("error");
      },
    );
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const reload = () => {
    setLoadStatus("loading");
    setAttempt((prev) => prev + 1);
  };

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

  const replaceCourse = (updated: Course) =>
    setCourses((prev) =>
      prev.map((course) => (course.id === updated.id ? updated : course)),
    );

  const createCourse = async (input: CourseInput) => {
    const created = await adminCoursesService.create(input);
    setCourses((prev) => [created, ...prev]);
  };

  const updateCourse = async (id: string, input: CourseInput) => {
    replaceCourse(await adminCoursesService.update(id, input));
  };

  const deleteCourse = async (id: string) => {
    await adminCoursesService.remove(id);
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  const toggleStatus = async (course: Course) => {
    replaceCourse(
      await adminCoursesService.setStatus(
        course.id,
        isDraft(course) ? "published" : "draft",
      ),
    );
  };

  return {
    courses,
    isLoading: loadStatus === "loading",
    hasError: loadStatus === "error",
    reload,
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
