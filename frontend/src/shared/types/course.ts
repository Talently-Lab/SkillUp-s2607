export type CourseLevel = "Principiante" | "Intermedio" | "Avanzado";

export type CourseStatus = "published" | "draft";

export interface Course {
  id: string;
  title: string;
  category: string;
  level: CourseLevel;
  durationHours: number;
  lessons: number;
  /** null means the course is free */
  price: number | null;
  rating: number;
  students: number;
  image: string;
  instructor: string;
  featured: boolean;
  /** Missing means published */
  status?: CourseStatus;
}

export type CourseInput = Omit<Course, "id" | "rating" | "students">;
