import { sampleReviews } from "../../../shared/mocks/reviews";
import type { Course } from "../../../shared/types/course";
import type {
  Review,
  ReviewSummary,
  StarCounts,
  StarValue,
} from "../../../shared/types/review";

export const STARS: StarValue[] = [5, 4, 3, 2, 1];

const DAY_MS = 86_400_000;

function hash(value: string): number {
  let h = 7;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Star distribution whose mean matches the course rating. Roughly one in
 * seven students leaves a rating.
 */
export function getReviewSummary(course: Course): ReviewSummary {
  const counts: StarCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const count =
    course.students > 0 ? Math.max(6, Math.round(course.students * 0.14)) : 0;
  if (count === 0) return { average: 0, count, counts };

  const p1 = 0.01;
  const p2 = 0.02;
  const rest = 1 - p1 - p2;
  const mean = Math.min(5, Math.max(3, (course.rating - p1 - 2 * p2) / rest));
  const p5 = mean >= 4 ? (mean - 4) * rest : 0;
  const p4 = mean >= 4 ? rest - p5 : (mean - 3) * rest;
  const p3 = mean >= 4 ? 0 : rest - p4;

  counts[5] = Math.round(p5 * count);
  counts[4] = Math.round(p4 * count);
  counts[3] = Math.round(p3 * count);
  counts[2] = Math.round(p2 * count);
  counts[1] = Math.round(p1 * count);
  counts[mean >= 4 ? 5 : 4] += count - STARS.reduce((s, n) => s + counts[n], 0);

  return { average: course.rating, count, counts };
}

/**
 * A rotating selection of the comment pool, so courses don't all look
 * identical. Only ratings present in the summary are used, so a star filter
 * never shows comments for a 0% bar.
 */
export function getCourseReviews(course: Course): Review[] {
  if (course.students === 0) return [];
  const { counts } = getReviewSummary(course);
  const pool = sampleReviews.filter((sample) => counts[sample.rating] > 0);
  if (pool.length === 0) return [];

  const seed = hash(course.id);
  const offset = seed % pool.length;
  const length = Math.min(pool.length, 8 + (seed % 11));
  const now = Date.now();

  return Array.from({ length }, (_, i) => {
    const sample = pool[(offset + i) % pool.length];
    return {
      id: `${course.id}-${i}`,
      courseId: course.id,
      authorName: sample.author,
      rating: sample.rating,
      text: sample.text,
      createdAt: new Date(now - (sample.daysAgo + i) * DAY_MS).toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
