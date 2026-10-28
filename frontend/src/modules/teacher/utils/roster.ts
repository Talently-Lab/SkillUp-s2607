import type { RosterEntry, RosterStatus } from "@/modules/teacher/types";
import type { TeacherEnrollment } from "@/shared/types/teacher";

export const AT_RISK_PROGRESS = 30;
export const INACTIVE_DAYS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

export function rosterStatus(
  progress: number,
  lastActiveDays: number,
): RosterStatus {
  if (progress >= 100) return "completed";

  if (progress < AT_RISK_PROGRESS && lastActiveDays >= INACTIVE_DAYS)
    return "at-risk";

  return "on-track";
}

/** A student who hasn't completed any lesson was last active when they enrolled */
export function toRosterEntry(
  {
    status,
    progressPercent,
    enrolledAt,
    lastActivityAt,
    student,
  }: TeacherEnrollment,
  now: number,
): RosterEntry {
  const lastActive = Date.parse(lastActivityAt ?? enrolledAt);
  const lastActiveDays = Math.max(0, Math.floor((now - lastActive) / DAY_MS));

  return {
    ...student,
    progress: progressPercent,
    lastActiveDays,
    status:
      status === "completed"
        ? "completed"
        : rosterStatus(progressPercent, lastActiveDays),
  };
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
