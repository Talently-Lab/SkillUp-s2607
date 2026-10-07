export interface SyllabusLesson {
  title: string;
  minutes: number;
}

export interface SyllabusModule {
  title: string;
  lessons: SyllabusLesson[];
}

export interface CourseSyllabus {
  courseId: string;
  description: string[];
  outcomes: string[];
  modules: SyllabusModule[];
}
