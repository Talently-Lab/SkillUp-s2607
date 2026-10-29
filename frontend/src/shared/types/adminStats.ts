export interface TopCourse {
  id: string;
  slug: string;
  title: string;
  students: number;
  price: number | null;
}

/** Platform-wide numbers for the admin dashboard */
export interface PlatformStats {
  /** `total` counts the drafts too */
  courses: { total: number; published: number };
  students: number;
  enrollments: { total: number; completed: number };
  /** Percent of the enrollments already completed, one decimal */
  completionRate: number;
  /** Published courses with the most students, at most 5 */
  topCourses: TopCourse[];
}
