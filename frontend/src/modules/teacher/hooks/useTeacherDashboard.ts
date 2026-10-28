import { useEffect, useState } from "react";

import type { RosterEntry } from "@/modules/teacher/types";
import { toRosterEntry } from "@/modules/teacher/utils/roster";
import { teacherService } from "@/shared/services/teacherService";
import type { Course } from "@/shared/types/course";

type LoadStatus = "loading" | "ready" | "error";

export type TeacherMetricsData = {
  totalStudents: number;
  courseCount: number;
  /** null while no published course has ratings */
  avgRating: number | null;
  completionRate: number;
  atRisk: number;
};

function getMetrics(
  courses: Course[],
  rosters: Record<string, RosterEntry[]>,
): TeacherMetricsData {
  const entries = Object.values(rosters).flat();
  const rated = courses.filter(
    (course) => course.rating > 0 && course.status !== "draft",
  );
  const completed = entries.filter((entry) => entry.status === "completed");

  return {
    totalStudents: courses.reduce(
      (total, course) => total + course.students,
      0,
    ),
    courseCount: courses.length,
    avgRating: rated.length
      ? rated.reduce((total, course) => total + course.rating, 0) / rated.length
      : null,
    completionRate: entries.length
      ? Math.round((completed.length / entries.length) * 100)
      : 0,
    atRisk: entries.filter((entry) => entry.status === "at-risk").length,
  };
}

/**
 * Loads the teacher's courses and the students of each one up front: the
 * metrics need every roster. A teacher has a few courses, so the requests
 * go in parallel.
 */
async function loadDashboard() {
  const courses = await teacherService.listCourses();
  const enrollments = await Promise.all(
    courses.map((course) => teacherService.listEnrollments(course.id)),
  );
  const now = Date.now();
  const rosters = Object.fromEntries(
    courses.map((course, index) => [
      course.id,
      enrollments[index].map((enrollment) => toRosterEntry(enrollment, now)),
    ]),
  );

  return { courses, rosters };
}

export function useTeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rosters, setRosters] = useState<Record<string, RosterEntry[]>>({});
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    loadDashboard().then(
      (data) => {
        if (ignore) return;
        setCourses(data.courses);
        setRosters(data.rosters);
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

  const getRoster = (course: Course): RosterEntry[] => rosters[course.id] ?? [];

  return {
    courses,
    isLoading: loadStatus === "loading",
    hasError: loadStatus === "error",
    reload,
    metrics: getMetrics(courses, rosters),
    getRoster,
  };
}
