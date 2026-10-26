import { useState } from "react";

import type { EditableModule, RosterEntry } from "@/modules/teacher/types";
import { getMockRoster } from "@/modules/teacher/utils/roster";
import { toEditableModules } from "@/modules/teacher/utils/syllabus";
import { courses } from "@/shared/mocks/courses";
import type { Course } from "@/shared/types/course";
import { getSyllabus } from "@/shared/utils/syllabus";

/**
 * The API doesn't link the mock courses to real teachers yet, so the panel
 * shows the courses of a demo teacher.
 * TODO: get the assigned courses, rosters and syllabi from the teacher endpoints
 */
const MOCK_INSTRUCTOR = "Lucía Fernández";
const assigned = courses.filter(
  (course) => course.instructor === MOCK_INSTRUCTOR,
);
const rosters = new Map(
  assigned.map((course) => [course.id, getMockRoster(course)]),
);

export type TeacherMetricsData = {
  totalStudents: number;
  courseCount: number;
  /** null while no published course has ratings */
  avgRating: number | null;
  completionRate: number;
  atRisk: number;
};

function getMetrics(): TeacherMetricsData {
  const entries = [...rosters.values()].flat();
  const rated = assigned.filter(
    (course) => course.rating > 0 && course.status !== "draft",
  );
  const completed = entries.filter((entry) => entry.status === "completed");

  return {
    totalStudents: assigned.reduce(
      (total, course) => total + course.students,
      0,
    ),
    courseCount: assigned.length,
    avgRating: rated.length
      ? rated.reduce((total, course) => total + course.rating, 0) / rated.length
      : null,
    completionRate: entries.length
      ? Math.round((completed.length / entries.length) * 100)
      : 0,
    atRisk: entries.filter((entry) => entry.status === "at-risk").length,
  };
}

const metrics = getMetrics();

export function useTeacherDashboard() {
  const [syllabi, setSyllabi] = useState<Record<string, EditableModule[]>>(() =>
    Object.fromEntries(
      assigned.map((course) => [
        course.id,
        toEditableModules(getSyllabus(course).modules),
      ]),
    ),
  );

  const getRoster = (course: Course): RosterEntry[] =>
    rosters.get(course.id) ?? [];

  const updateModules = (
    course: Course,
    updater: (modules: EditableModule[]) => EditableModule[],
  ) =>
    setSyllabi((current) => ({
      ...current,
      [course.id]: updater(current[course.id] ?? []),
    }));

  return {
    courses: assigned,
    metrics,
    getRoster,
    getModules: (course: Course) => syllabi[course.id] ?? [],
    updateModules,
  };
}
