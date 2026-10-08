import { syllabi } from "@/shared/mocks/syllabi";
import type { Course } from "@/shared/types/course";
import type { CourseSyllabus } from "@/shared/types/syllabus";

/** Courses without a written syllabus get a generic one built from their data. */
export function getSyllabus(course: Course): CourseSyllabus {
  const found = syllabi.find((s) => s.courseId === course.id);
  if (found) return found;

  const topic = course.category.toLowerCase();
  return {
    courseId: course.id,
    description: [
      `${course.title} es un curso de nivel ${course.level.toLowerCase()} diseñado para que apliques lo aprendido desde la primera semana.`,
      `A lo largo de ${course.lessons} lecciones combinarás teoría breve, ejemplos reales y ejercicios prácticos guiados por ${course.instructor}.`,
    ],
    outcomes: [
      `Comprender los fundamentos de ${topic}`,
      "Aplicar herramientas y métodos actuales",
      "Resolver casos prácticos reales",
      "Completar un proyecto para tu portafolio",
    ],
    modules: [
      {
        title: `Introducción a ${topic}`,
        lessons: [
          { title: "Bienvenida y objetivos del curso", minutes: 10 },
          { title: "Conceptos esenciales", minutes: 22 },
          { title: "Herramientas que usaremos", minutes: 18 },
        ],
      },
      {
        title: "Conceptos clave",
        lessons: [
          { title: "Marco de trabajo", minutes: 26 },
          { title: "Errores comunes y cómo evitarlos", minutes: 20 },
          { title: "Ejercicio guiado", minutes: 30 },
        ],
      },
      {
        title: "Práctica aplicada",
        lessons: [
          { title: "Caso de estudio", minutes: 28 },
          { title: "Taller práctico", minutes: 35 },
        ],
      },
      {
        title: "Proyecto final",
        lessons: [
          { title: "Planteamiento del proyecto", minutes: 15 },
          { title: "Desarrollo y entrega", minutes: 40 },
        ],
      },
    ],
  };
}

export function getModuleMinutes(lessons: { minutes: number }[]): number {
  return lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}
