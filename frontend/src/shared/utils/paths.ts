export const coursePath = (slug: string) => `/catalog/${slug}`;

/** The classroom of a course, optionally opened on one lesson */
export function learnPath(slug: string, lessonId?: string): string {
  const path = `/student/courses/${slug}`;
  return lessonId ? `${path}?lesson=${lessonId}` : path;
}
