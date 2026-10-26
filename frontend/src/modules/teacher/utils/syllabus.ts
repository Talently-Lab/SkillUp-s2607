import type { EditableModule } from "@/modules/teacher/types";
import type { SyllabusModule } from "@/shared/types/syllabus";

export const newId = () => crypto.randomUUID();

export function toEditableModules(modules: SyllabusModule[]): EditableModule[] {
  return modules.map((module) => ({
    id: newId(),
    title: module.title,
    lessons: module.lessons.map((lesson) => ({ ...lesson, id: newId() })),
  }));
}

/** Moves an item one place; the list is returned as is at the edges */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);

  return next;
}

/** Puts back an item removed from `index`, used by the undo toasts */
export function insertAt<T>(list: T[], index: number, item: T): T[] {
  const next = [...list];
  next.splice(Math.min(index, next.length), 0, item);

  return next;
}

export function moduleMinutes(module: EditableModule): number {
  return module.lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}

/** 135 → "2 h 15 min" */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;

  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
