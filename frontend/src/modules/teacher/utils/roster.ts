import type { RosterEntry, RosterStatus } from "@/modules/teacher/types";
import { students } from "@/shared/mocks/students";
import type { Course } from "@/shared/types/course";

export const AT_RISK_PROGRESS = 30;
export const INACTIVE_DAYS = 10;

export function rosterStatus(
  progress: number,
  lastActiveDays: number,
): RosterStatus {
  if (progress >= 100) return "completed";

  if (progress < AT_RISK_PROGRESS && lastActiveDays >= INACTIVE_DAYS)
    return "at-risk";

  return "on-track";
}

/**
 * Deterministic demo roster: the most recent students of a course.
 * TODO: replace it with the teacher endpoint once it's ready
 */
export function getMockRoster(course: Course): RosterEntry[] {
  if (course.students === 0) return [];
  const random = seeded(hash(course.id));
  const pool = [...students];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const size = Math.min(
    pool.length,
    course.students,
    9 + Math.floor(random() * 5),
  );

  return pool.slice(0, size).map((student) => {
    const progress = random() < 0.15 ? 100 : Math.floor(random() * 96);
    const lastActiveDays = Math.floor(random() * 21);

    return {
      ...student,
      progress,
      lastActiveDays,
      status: rosterStatus(progress, lastActiveDays),
    };
  });
}

export function formatLastActive(days: number): string {
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";

  return `Hace ${days} días`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

function hash(value: string): number {
  let h = 0;
  for (const char of value) h = (h * 31 + char.charCodeAt(0)) | 0;

  return Math.abs(h) || 1;
}

function seeded(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
