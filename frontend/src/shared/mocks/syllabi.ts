import type { CourseSyllabus } from "../types/syllabus";

export const syllabi: CourseSyllabus[] = [
  {
    courseId: "analisis-datos-excel-powerbi",
    description: [
      "Aprende a transformar datos en decisiones. En este curso pasarás de hojas de cálculo desordenadas a tableros interactivos que cualquier equipo puede entender.",
      "Trabajarás con casos reales de ventas, recursos humanos y operaciones, y terminarás con un dashboard propio listo para tu portafolio.",
    ],
    outcomes: [
      "Limpiar y estructurar datos con Power Query",
      "Crear tablas dinámicas y fórmulas avanzadas en Excel",
      "Diseñar dashboards interactivos en Power BI",
      "Comunicar hallazgos con visualizaciones claras",
    ],
    modules: [
      {
        title: "Fundamentos del análisis de datos",
        lessons: [
          { title: "Qué hace un analista de datos", minutes: 12 },
          { title: "Tipos de datos y fuentes comunes", minutes: 18 },
          { title: "Buenas prácticas en hojas de cálculo", minutes: 22 },
        ],
      },
      {
        title: "Excel para análisis",
        lessons: [
          { title: "Funciones de búsqueda: BUSCARX e ÍNDICE", minutes: 26 },
          { title: "Tablas dinámicas paso a paso", minutes: 30 },
          { title: "Limpieza de datos con Power Query", minutes: 34 },
        ],
      },
      {
        title: "Visualización con Power BI",
        lessons: [
          { title: "Conectar y modelar datos", minutes: 28 },
          { title: "Medidas básicas con DAX", minutes: 32 },
          { title: "Diseño de un dashboard efectivo", minutes: 25 },
        ],
      },
      {
        title: "Proyecto final",
        lessons: [
          { title: "Brief del proyecto: ventas regionales", minutes: 10 },
          { title: "Construcción del dashboard", minutes: 45 },
          { title: "Presentación de resultados", minutes: 20 },
        ],
      },
    ],
  },
  {
    courseId: "fundamentos-ux-ui",
    description: [
      "Descubre cómo se diseñan productos digitales que la gente disfruta usar. Aprenderás el proceso completo, desde entender al usuario hasta entregar interfaces pulidas.",
      "Cada módulo incluye ejercicios prácticos y al final diseñarás el flujo completo de una app móvil.",
    ],
    outcomes: [
      "Investigar usuarios y definir problemas reales",
      "Construir wireframes y flujos de navegación",
      "Aplicar principios de jerarquía visual y tipografía",
      "Prototipar y validar ideas en Figma",
    ],
    modules: [
      {
        title: "Introducción al diseño centrado en el usuario",
        lessons: [
          { title: "UX vs. UI: qué hace cada disciplina", minutes: 14 },
          { title: "El proceso de diseño en 5 etapas", minutes: 20 },
          { title: "Entrevistas con usuarios", minutes: 24 },
        ],
      },
      {
        title: "Arquitectura de información",
        lessons: [
          { title: "Card sorting y mapas de sitio", minutes: 22 },
          { title: "Flujos de usuario", minutes: 18 },
          { title: "Wireframes de baja fidelidad", minutes: 26 },
        ],
      },
      {
        title: "Diseño visual de interfaces",
        lessons: [
          { title: "Color, contraste y accesibilidad", minutes: 28 },
          { title: "Tipografía para pantallas", minutes: 20 },
          { title: "Componentes y sistemas", minutes: 30 },
        ],
      },
      {
        title: "Prototipado y validación",
        lessons: [
          { title: "Prototipos interactivos en Figma", minutes: 32 },
          { title: "Pruebas de usabilidad", minutes: 24 },
          { title: "Proyecto: app de reservas", minutes: 40 },
        ],
      },
    ],
  },
  {
    courseId: "python-desde-cero",
    description: [
      "Empieza a programar sin experiencia previa. Aprenderás Python con un enfoque práctico: automatizar tareas repetitivas que hoy te quitan tiempo.",
      "Al terminar podrás escribir scripts que organizan archivos, procesan hojas de cálculo y envían reportes automáticamente.",
    ],
    outcomes: [
      "Dominar la sintaxis básica de Python",
      "Trabajar con archivos, carpetas y hojas de cálculo",
      "Automatizar reportes y correos",
      "Escribir código limpio y fácil de mantener",
    ],
    modules: [
      {
        title: "Primeros pasos con Python",
        lessons: [
          { title: "Instalación y tu primer programa", minutes: 15 },
          { title: "Variables y tipos de datos", minutes: 22 },
          { title: "Condicionales y bucles", minutes: 28 },
        ],
      },
      {
        title: "Estructuras de datos",
        lessons: [
          { title: "Listas y tuplas", minutes: 24 },
          { title: "Diccionarios", minutes: 22 },
          { title: "Funciones reutilizables", minutes: 30 },
        ],
      },
      {
        title: "Automatización práctica",
        lessons: [
          { title: "Organizar archivos automáticamente", minutes: 26 },
          { title: "Leer y escribir Excel con openpyxl", minutes: 32 },
          { title: "Enviar correos desde Python", minutes: 24 },
        ],
      },
      {
        title: "Proyecto final",
        lessons: [
          { title: "Diseño del bot de reportes", minutes: 18 },
          { title: "Implementación paso a paso", minutes: 45 },
          { title: "Programar tareas recurrentes", minutes: 20 },
        ],
      },
    ],
  },
  {
    courseId: "marketing-digital-estrategico",
    description: [
      "Construye estrategias de marketing digital basadas en datos, no en intuición. Aprenderás a conectar objetivos de negocio con canales y métricas concretas.",
      "Incluye plantillas descargables y un plan de marketing completo para una marca real.",
    ],
    outcomes: [
      "Definir buyer personas y propuestas de valor",
      "Planificar campañas multicanal",
      "Medir resultados con KPIs relevantes",
      "Optimizar el presupuesto de pauta",
    ],
    modules: [
      {
        title: "Estrategia y objetivos",
        lessons: [
          { title: "Del objetivo de negocio al plan", minutes: 18 },
          { title: "Buyer personas", minutes: 22 },
          { title: "Embudo de conversión", minutes: 20 },
        ],
      },
      {
        title: "Canales digitales",
        lessons: [
          { title: "SEO y contenidos", minutes: 28 },
          { title: "Redes sociales orgánicas", minutes: 24 },
          { title: "Email marketing", minutes: 22 },
        ],
      },
      {
        title: "Publicidad y medición",
        lessons: [
          { title: "Campañas en Meta y Google Ads", minutes: 32 },
          { title: "Analítica web", minutes: 26 },
          { title: "Tableros de KPIs", minutes: 20 },
        ],
      },
      {
        title: "Plan de marketing",
        lessons: [
          { title: "Caso práctico", minutes: 30 },
          { title: "Presentación del plan", minutes: 18 },
        ],
      },
    ],
  },
];
