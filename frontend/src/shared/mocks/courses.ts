import type { Course } from "../types/course";

import DataAnalysisImage from "../../assets/images/courses/data-analysis.jpg";
import UxUiImage from "../../assets/images/courses/ux-ui.jpg";
import PythonImage from "../../assets/images/courses/python.jpg";
import MarketingImage from "../../assets/images/courses/marketing.jpg";

export const featuredCourses: Course[] = [
  {
    id: "analisis-datos-excel-powerbi",
    title: "Análisis de Datos con Excel y Power BI",
    category: "Datos",
    level: "Principiante",
    durationHours: 24,
    price: 49,
    rating: 4.8,
    image: DataAnalysisImage,
    instructor: "Lucía Fernández",
  },
  {
    id: "fundamentos-ux-ui",
    title: "Fundamentos de Diseño UX/UI",
    category: "Diseño",
    level: "Principiante",
    durationHours: 18,
    price: 39,
    rating: 4.9,
    image: UxUiImage,
    instructor: "Martín Rojas",
  },
  {
    id: "python-desde-cero",
    title: "Python desde cero para automatizar tareas",
    category: "Programación",
    level: "Principiante",
    durationHours: 30,
    price: null,
    rating: 4.7,
    image: PythonImage,
    instructor: "Andrés Castillo",
  },
  {
    id: "marketing-digital-estrategico",
    title: "Marketing Digital Estratégico",
    category: "Marketing",
    level: "Intermedio",
    durationHours: 16,
    price: 45,
    rating: 4.6,
    image: MarketingImage,
    instructor: "Valentina Ortiz",
  },
];
