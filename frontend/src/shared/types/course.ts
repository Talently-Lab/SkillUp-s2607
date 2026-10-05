export type CourseLevel = "Principiante" | "Intermedio" | "Avanzado";

export interface Course {
  id: string;
  title: string;
  category: string;
  level: CourseLevel;
  durationHours: number;
  /** null means the course is free */
  price: number | null;
  rating: number;
  image: string;
  instructor: string;
}
