export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  position: number;
  /** null when the lesson is locked or has no video yet */
  videoUrl: string | null;
  /** Locked lessons are only for enrolled students, the first ones are a free preview */
  locked: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}
