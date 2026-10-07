import type { StarValue } from "../types/review";

export interface SampleReview {
  author: string;
  rating: StarValue;
  daysAgo: number;
  text: string;
}

/** Pool of student comments; each course shows a rotating selection. */
export const sampleReviews: SampleReview[] = [
  {
    author: "Camila Torres",
    rating: 5,
    daysAgo: 3,
    text:
      "Las explicaciones son claras y cada módulo termina con un ejercicio que te obliga a aplicar lo aprendido. Lo recomiendo.",
  },
  {
    author: "Joaquín Méndez",
    rating: 5,
    daysAgo: 9,
    text:
      "Muy bien estructurado. Pude avanzar a mi ritmo después del trabajo y los quizzes ayudan a fijar los conceptos.",
  },
  {
    author: "Florencia Díaz",
    rating: 4,
    daysAgo: 14,
    text:
      "Contenido muy completo. Me hubiera gustado algún ejemplo más avanzado al final, pero la base queda sólida.",
  },
  {
    author: "Mateo Rojas",
    rating: 5,
    daysAgo: 21,
    text:
      "El docente responde rápido las dudas del foro. Se nota que el curso está pensado para quien empieza de cero.",
  },
  {
    author: "Lucía Herrera",
    rating: 4,
    daysAgo: 27,
    text:
      "Buen ritmo y buenos recursos descargables. Algunas clases podrían ser un poco más cortas.",
  },
  {
    author: "Santiago Pérez",
    rating: 5,
    daysAgo: 34,
    text:
      "Apliqué lo aprendido en mi trabajo la misma semana. El certificado además suma mucho en mi perfil profesional.",
  },
  {
    author: "Valeria Castro",
    rating: 3,
    daysAgo: 41,
    text:
      "El contenido es bueno, aunque el segundo módulo me resultó algo denso. Con los resúmenes de cada clase se entiende mejor.",
  },
  {
    author: "Tomás Aguirre",
    rating: 5,
    daysAgo: 48,
    text:
      "De los mejores cursos online que hice. Práctico, directo y con plantillas que sigo usando.",
  },
  {
    author: "Martina Silva",
    rating: 4,
    daysAgo: 56,
    text:
      "Claro y ordenado. Las plantillas y el material de cada clase ahorran muchísimo tiempo.",
  },
  {
    author: "Nicolás Vega",
    rating: 5,
    daysAgo: 63,
    text:
      "Excelente relación calidad-precio. Terminé con un proyecto propio para mostrar en entrevistas.",
  },
  {
    author: "Paula Benítez",
    rating: 5,
    daysAgo: 70,
    text:
      "Lo que más valoro es que cada clase va al grano. En pocas semanas ya me sentía con confianza para usarlo en el día a día.",
  },
  {
    author: "Ignacio Romero",
    rating: 4,
    daysAgo: 78,
    text:
      "Muy buen curso para arrancar. Sumaría más ejercicios opcionales para quienes queremos practicar un poco más.",
  },
  {
    author: "Agustina López",
    rating: 5,
    daysAgo: 85,
    text:
      "El proyecto final está muy bien pensado: integra todo lo visto y queda como pieza para el portafolio.",
  },
  {
    author: "Federico Sosa",
    rating: 3,
    daysAgo: 93,
    text:
      "Buen contenido en general, aunque algunos videos tienen el audio un poco bajo. Los materiales escritos compensan.",
  },
  {
    author: "Carolina Medina",
    rating: 5,
    daysAgo: 101,
    text:
      "Venía de intentar aprender por mi cuenta con videos sueltos y la diferencia es enorme. Todo tiene un orden lógico.",
  },
  {
    author: "Diego Acosta",
    rating: 4,
    daysAgo: 112,
    text:
      "Docente muy claro y con ejemplos de la vida real. Volvería a hacer otro curso en la plataforma.",
  },
  {
    author: "Renata Molina",
    rating: 5,
    daysAgo: 124,
    text:
      "Pude hacerlo desde el celular en los viajes al trabajo. La plataforma guarda el progreso y eso ayuda mucho.",
  },
  {
    author: "Bruno Giménez",
    rating: 2,
    daysAgo: 138,
    text:
      "Esperaba un nivel un poco más profundo en la última parte. Para quien empieza de cero, igual lo veo útil.",
  },
];
