import type { StudentProfile } from "@/shared/types/student";

export type RosterStatus = "on-track" | "at-risk" | "completed";

export type RosterEntry = StudentProfile & {
  /** 0-100 */
  progress: number;
  lastActiveDays: number;
  status: RosterStatus;
};
