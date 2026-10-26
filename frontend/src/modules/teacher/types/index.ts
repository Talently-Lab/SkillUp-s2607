import type { StudentProfile } from "@/shared/types/student";
import type { SyllabusLesson } from "@/shared/types/syllabus";

export type RosterStatus = "on-track" | "at-risk" | "completed";

export type RosterEntry = StudentProfile & {
  /** 0-100 */
  progress: number;
  lastActiveDays: number;
  status: RosterStatus;
};

/** The ids only exist so React keeps each row while they are reordered */
export type EditableLesson = SyllabusLesson & { id: string };

export type EditableModule = {
  id: string;
  title: string;
  lessons: EditableLesson[];
};
