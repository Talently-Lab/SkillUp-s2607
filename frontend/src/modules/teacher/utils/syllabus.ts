import type { TeacherModule } from "@/shared/types/teacher";
import { isVideoUrl } from "@/shared/utils/video";

/** Moves an item one place; the list is returned as is at the edges */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);

  return next;
}

export function nextPosition(items: { position: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.position), 0) + 1;
}

/** Lessons whose duration couldn't be read don't count */
export function moduleSeconds(module: TeacherModule): number {
  return module.lessons.reduce(
    (total, lesson) => total + (lesson.durationSeconds ?? 0),
    0,
  );
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;

  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function formatSeconds(seconds: number): string {
  if (seconds > 0 && seconds < 60) return `${seconds} s`;

  return formatMinutes(Math.round(seconds / 60));
}

const MIN_TITLE = 2;

export function titleError(title: string): string | null {
  return title.length < MIN_TITLE
    ? `El título necesita al menos ${MIN_TITLE} caracteres.`
    : null;
}

/** An empty link is fine, it removes the video */
export function videoUrlError(videoUrl: string): string | null {
  return videoUrl && !isVideoUrl(videoUrl)
    ? "Pega un enlace válido que empiece con https://"
    : null;
}
