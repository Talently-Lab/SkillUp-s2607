import { and, eq, gt, isNull, like, sql } from "drizzle-orm";
import { db, pool } from "./client.ts";
import { categories, courses, lessons, modules } from "./schema/index.ts";
import { syncCourseLessons } from "../modules/course-modules/course-modules.service.ts";

/* eslint-disable no-console -- CLI script output */

/**
 * Demo catalog for local development. Idempotent:
 * - categories and courses are inserted when missing; on existing courses only
 *   an empty description or cover is filled in
 * - modules and lessons are upserted by position, so lesson ids (and the
 *   students' progress on them) survive a re-run; nothing is deleted
 * - lessonsCount, durationMinutes and enrollment progress are recalculated
 *   from the real lesson rows afterwards
 */

const CATEGORIES = [
  { slug: "datos", name: "Datos" },
  { slug: "diseno", name: "Diseño" },
  { slug: "programacion", name: "Programación" },
  { slug: "marketing", name: "Marketing" },
  { slug: "finanzas", name: "Finanzas" },
  { slug: "idiomas", name: "Idiomas" },
  { slug: "liderazgo", name: "Liderazgo" },
  { slug: "cloud", name: "Cloud" },
];

/**
 * Stock clips from Pexels (free to use, no attribution required). Direct mp4
 * files, so they play in the native <video> player with no third-party chrome.
 * They don't match the lesson topics, they are placeholders for the demo.
 * `seconds` is the clip's real length, saved as the lesson duration.
 */
const PEXELS = "https://videos.pexels.com/video-files";
const VIDEOS = [
  { url: `${PEXELS}/3205624/3205624-hd_1920_1080_25fps.mp4`, seconds: 21 }, // team meeting
  { url: `${PEXELS}/5495845/5495845-hd_1920_1080_30fps.mp4`, seconds: 21 }, // typing code on a laptop
  { url: `${PEXELS}/3255275/3255275-hd_1920_1080_25fps.mp4`, seconds: 10 }, // team at a table, top view
  { url: `${PEXELS}/3130284/3130284-hd_1920_1080_30fps.mp4`, seconds: 20 }, // abstract data particles
  { url: `${PEXELS}/7989451/7989451-hd_1920_1080_25fps.mp4`, seconds: 20 }, // people working on laptops
  { url: `${PEXELS}/3253079/3253079-hd_1920_1080_25fps.mp4`, seconds: 16 }, // sticky notes workshop
  { url: `${PEXELS}/6774633/6774633-hd_1920_1080_30fps.mp4`, seconds: 10 }, // office collaboration
  { url: `${PEXELS}/3129671/3129671-hd_1920_1080_30fps.mp4`, seconds: 40 }, // abstract network
  { url: `${PEXELS}/3209211/3209211-hd_1920_1080_25fps.mp4`, seconds: 13 }, // charts on a desk
  { url: `${PEXELS}/3256542/3256542-hd_1920_1080_25fps.mp4`, seconds: 15 }, // conversation at work
  { url: `${PEXELS}/3141210/3141210-hd_1920_1080_25fps.mp4`, seconds: 20 }, // abstract digital globe
  { url: `${PEXELS}/3255270/3255270-hd_1920_1080_25fps.mp4`, seconds: 14 }, // developer at her desk
];

/** Lesson title; its video and duration come from the next clip in VIDEOS */
type LessonSeed = string;
type ModuleSeed = { title: string; lessons: LessonSeed[] };

type CourseSeed = {
  slug: string;
  title: string;
  categorySlug: string;
  level: "beginner" | "intermediate" | "advanced";
  priceCents: number;
  featured: boolean;
  studentsCount: number;
  ratingAvg: string;
  coverUrl: string;
  description: string;
  modules: ModuleSeed[];
};

const COURSES: CourseSeed[] = [
  {
    slug: "analisis-datos-excel-powerbi",
    title: "Análisis de Datos con Excel y Power BI",
    categorySlug: "datos",
    level: "beginner",
    priceCents: 4900,
    featured: true,
    studentsCount: 3420,
    ratingAvg: "4.8",
    coverUrl: "/images/courses/data-analysis.jpg",
    description:
      "Aprendé a transformar datos en decisiones. Vas a pasar de planillas desordenadas a tableros interactivos en Power BI, trabajando con casos reales de ventas y operaciones, y terminás con un dashboard propio para tu portafolio.",
    modules: [
      {
        title: "Primeros pasos con los datos",
        lessons: [
          "Bienvenida: de la planilla a la decisión",
          "Limpiá y ordená tus datos en Excel",
          "Tablas dinámicas sin miedo",
        ],
      },
      {
        title: "Fórmulas que ahorran horas",
        lessons: [
          "BUSCARX e INDICE/COINCIDIR",
          "Funciones condicionales y de fecha",
          "Armá un reporte mensual automático",
        ],
      },
      {
        title: "Power BI desde cero",
        lessons: [
          "Conectá Power BI a tus fuentes",
          "Modelado de datos y relaciones",
          "Medidas básicas con DAX",
        ],
      },
      {
        title: "Tableros que cuentan una historia",
        lessons: [
          "Elegí el gráfico correcto",
          "Diseñá un dashboard interactivo",
          "Publicá y compartí tu tablero",
        ],
      },
    ],
  },
  {
    slug: "fundamentos-ux-ui",
    title: "Fundamentos de Diseño UX/UI",
    categorySlug: "diseno",
    level: "beginner",
    priceCents: 3900,
    featured: true,
    studentsCount: 2870,
    ratingAvg: "4.9",
    coverUrl: "/images/courses/ux-ui.jpg",
    description:
      "Descubrí cómo se diseñan productos digitales que la gente disfruta usar. Recorrés el proceso completo, desde entender al usuario hasta prototipar interfaces pulidas en Figma, con ejercicios prácticos en cada módulo.",
    modules: [
      {
        title: "Entender al usuario",
        lessons: [
          "Qué es UX y qué es UI",
          "Entrevistas y research rápido",
          "Definí personas y problemas",
        ],
      },
      {
        title: "De la idea al wireframe",
        lessons: [
          "Arquitectura de información",
          "Flujos de usuario",
          "Wireframes en Figma",
        ],
      },
      {
        title: "Interfaces que se sienten bien",
        lessons: [
          "Tipografía, color y jerarquía",
          "Sistemas de componentes",
          "Prototipá y testeá con usuarios",
        ],
      },
    ],
  },
  {
    slug: "python-desde-cero",
    title: "Python desde cero para automatizar tareas",
    categorySlug: "programacion",
    level: "beginner",
    priceCents: 0,
    featured: true,
    studentsCount: 5210,
    ratingAvg: "4.7",
    coverUrl: "/images/courses/python.jpg",
    description:
      "Empezá a programar sin experiencia previa. Aprendés Python con un enfoque práctico: automatizar las tareas repetitivas que hoy te quitan tiempo, como ordenar archivos, procesar planillas y enviar reportes.",
    modules: [
      {
        title: "Primeros pasos con Python",
        lessons: [
          "Bienvenida y qué vas a automatizar",
          "Instalar Python y un editor",
          "Tu primer script",
        ],
      },
      {
        title: "Fundamentos del lenguaje",
        lessons: [
          "Variables y tipos de datos",
          "Condicionales y bucles",
          "Funciones",
        ],
      },
      {
        title: "Trabajar con archivos",
        lessons: [
          "Leer y escribir archivos de texto",
          "Renombrar y ordenar archivos en lote",
          "Procesar archivos CSV",
        ],
      },
      {
        title: "Automatizaciones reales",
        lessons: [
          "Enviar correos automáticos",
          "Descargar datos de una web",
          "Programar tareas recurrentes",
        ],
      },
    ],
  },
  {
    slug: "marketing-digital-estrategico",
    title: "Marketing Digital Estratégico",
    categorySlug: "marketing",
    level: "intermediate",
    priceCents: 4500,
    featured: true,
    studentsCount: 1980,
    ratingAvg: "4.6",
    coverUrl: "/images/courses/marketing.jpg",
    description:
      "Construí estrategias de marketing digital basadas en datos, no en intuición. Vas a conectar objetivos de negocio con canales y métricas concretas, y armar un plan de marketing completo para una marca.",
    modules: [
      {
        title: "Estrategia antes que tácticas",
        lessons: [
          "Del objetivo de negocio al plan",
          "Conocé a tu audiencia",
          "Propuesta de valor y posicionamiento",
        ],
      },
      {
        title: "Canales y contenido",
        lessons: [
          "SEO y contenido que posiciona",
          "Redes sociales con propósito",
          "Email marketing que convierte",
        ],
      },
      {
        title: "Medí y optimizá",
        lessons: [
          "Métricas que importan",
          "Campañas pagas y presupuesto",
          "Armá tu tablero de marketing",
        ],
      },
    ],
  },
  {
    slug: "finanzas-no-financieros",
    title: "Finanzas para no financieros",
    categorySlug: "finanzas",
    level: "beginner",
    priceCents: 0,
    featured: false,
    studentsCount: 4100,
    ratingAvg: "4.5",
    coverUrl: "/images/courses/finance.jpg",
    description:
      "Entendé los números de tu negocio o de tu área sin ser contador. Aprendés a leer estados financieros, calcular márgenes y armar un presupuesto realista para tomar mejores decisiones.",
    modules: [
      {
        title: "Los números de tu negocio",
        lessons: [
          "Por qué las finanzas te importan",
          "Leé un estado de resultados",
          "Balance y flujo de fondos",
        ],
      },
      {
        title: "Decisiones con números",
        lessons: [
          "Costos, márgenes y punto de equilibrio",
          "Armá un presupuesto realista",
          "Evaluá una inversión simple",
        ],
      },
    ],
  },
  {
    slug: "ingles-profesional",
    title: "Inglés para entornos profesionales B1-B2",
    categorySlug: "idiomas",
    level: "intermediate",
    priceCents: 5900,
    featured: false,
    studentsCount: 2650,
    ratingAvg: "4.7",
    coverUrl: "/images/courses/english.jpg",
    description:
      "Ganá confianza para usar el inglés en tu trabajo. Practicás situaciones reales: reuniones, presentaciones, emails y entrevistas, con vocabulario y estructuras que vas a usar desde el primer día.",
    modules: [
      {
        title: "Comunicación en el trabajo",
        lessons: [
          "Presentate con confianza",
          "Small talk en reuniones",
          "Vocabulario para tu día a día",
        ],
      },
      {
        title: "Reuniones y presentaciones",
        lessons: [
          "Participá en reuniones en inglés",
          "Estructurá una presentación",
          "Respondé preguntas difíciles",
        ],
      },
      {
        title: "Escritura profesional",
        lessons: [
          "Emails claros y concisos",
          "Mensajes en Slack y chats",
          "Preparate para una entrevista",
        ],
      },
    ],
  },
  {
    slug: "liderazgo-equipos",
    title: "Liderazgo y gestión de equipos",
    categorySlug: "liderazgo",
    level: "intermediate",
    priceCents: 3500,
    featured: false,
    studentsCount: 1540,
    ratingAvg: "4.8",
    coverUrl: "/images/courses/leadership.jpg",
    description:
      "Liderá equipos con claridad y empatía. Trabajás herramientas concretas para dar feedback, delegar, fijar objetivos y sostener conversaciones difíciles sin perder la confianza del equipo.",
    modules: [
      {
        title: "El rol del líder",
        lessons: [
          "De colega a líder",
          "Tu estilo de liderazgo",
          "Construí confianza en el equipo",
        ],
      },
      {
        title: "Comunicación y feedback",
        lessons: [
          "Reuniones uno a uno efectivas",
          "Dar y recibir feedback",
          "Conversaciones difíciles",
        ],
      },
      {
        title: "Equipos de alto rendimiento",
        lessons: [
          "Objetivos claros con OKR",
          "Delegá sin perder el control",
          "Gestioná conflictos",
        ],
      },
    ],
  },
  {
    slug: "introduccion-nube-aws",
    title: "Introducción a la nube con AWS",
    categorySlug: "cloud",
    level: "beginner",
    priceCents: 5500,
    featured: false,
    studentsCount: 1320,
    ratingAvg: "4.6",
    coverUrl: "/images/courses/cloud.jpg",
    description:
      "Dá tus primeros pasos en la nube con AWS. Conocés los servicios esenciales de cómputo, almacenamiento y bases de datos, configurás permisos de forma segura y desplegás tu primera aplicación.",
    modules: [
      {
        title: "Fundamentos de la nube",
        lessons: [
          "Qué es la nube y por qué importa",
          "Regiones, zonas y servicios clave",
          "Creá tu cuenta y controlá costos",
        ],
      },
      {
        title: "Servicios esenciales",
        lessons: [
          "Servidores virtuales con EC2",
          "Almacenamiento con S3",
          "Bases de datos administradas",
        ],
      },
      {
        title: "Seguridad y despliegue",
        lessons: [
          "Usuarios y permisos con IAM",
          "Redes con VPC",
          "Desplegá tu primera aplicación",
        ],
      },
    ],
  },
];

/**
 * Content for courses created outside this seed (e.g. from the admin panel).
 * Only applied when a course with that slug already exists.
 */
const EXTRA_CONTENT: {
  slug: string;
  description: string;
  modules: ModuleSeed[];
}[] = [
  {
    slug: "zustand-crash-course",
    description:
      "Manejá el estado de tus apps React de forma simple con Zustand. Creás stores, usás selectores para cuidar el rendimiento y aplicás patrones que escalan en proyectos reales.",
    modules: [
      {
        title: "Primeros pasos con Zustand",
        lessons: [
          "Por qué Zustand",
          "Creá tu primer store",
          "Leé y actualizá el estado",
        ],
      },
      {
        title: "Patrones para apps reales",
        lessons: [
          "Selectores y rendimiento",
          "Middlewares: persist y devtools",
          "Organizá stores grandes en slices",
        ],
      },
      {
        title: "TypeScript y buenas prácticas",
        lessons: [
          "Tipá tus stores con TypeScript",
          "Acciones asíncronas y llamadas a una API",
          "Testeá tus stores",
        ],
      },
    ],
  },
];

let videoIndex = 0;
function nextVideo() {
  const video = VIDEOS[videoIndex % VIDEOS.length];
  if (!video) throw new Error("VIDEOS is empty");
  videoIndex++;
  return video;
}

/** Upserts the course's modules and lessons by position, then syncs totals */
async function seedContent(courseId: string, slug: string, seed: ModuleSeed[]) {
  let lessonRows = 0;
  await db.transaction(async (tx) => {
    for (const [m, mod] of seed.entries()) {
      const [moduleRow] = await tx
        .insert(modules)
        .values({ courseId, title: mod.title, position: m + 1 })
        .onConflictDoUpdate({
          target: [modules.courseId, modules.position],
          set: { title: mod.title, updatedAt: sql`now()` },
        })
        .returning({ id: modules.id });
      if (!moduleRow) throw new Error(`Module upsert failed for ${slug}`);

      for (const [l, title] of mod.lessons.entries()) {
        const video = nextVideo();
        const values = {
          title,
          videoUrl: video.url,
          durationSeconds: video.seconds,
        };
        await tx
          .insert(lessons)
          .values({ ...values, moduleId: moduleRow.id, position: l + 1 })
          .onConflictDoUpdate({
            target: [lessons.moduleId, lessons.position],
            set: { ...values, updatedAt: sql`now()` },
          });
        lessonRows++;
      }

      const extraLessons = await tx
        .select({ id: lessons.id })
        .from(lessons)
        .where(
          and(
            eq(lessons.moduleId, moduleRow.id),
            gt(lessons.position, mod.lessons.length),
          ),
        );
      if (extraLessons.length > 0) {
        console.warn(
          `  ${slug}: module ${m + 1} has ${extraLessons.length} extra lesson(s) not in the seed (kept)`,
        );
      }
    }

    const extraModules = await tx
      .select({ id: modules.id })
      .from(modules)
      .where(
        and(eq(modules.courseId, courseId), gt(modules.position, seed.length)),
      );
    if (extraModules.length > 0) {
      console.warn(
        `  ${slug}: ${extraModules.length} extra module(s) not in the seed (kept)`,
      );
    }

    // lessonsCount, durationMinutes and every enrollment's progress
    await syncCourseLessons(courseId, tx);
  });
  console.log(`  ${slug}: ${seed.length} modules, ${lessonRows} lessons`);
}

try {
  // Seed categories
  let inserted = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    });
    if (existing) {
      skipped++;
    } else {
      await db.insert(categories).values(cat);
      inserted++;
    }
  }
  console.log(`Categories: ${inserted} inserted, ${skipped} skipped.`);

  // Seed courses
  inserted = 0;
  skipped = 0;
  const contentTargets: { id: string; slug: string; modules: ModuleSeed[] }[] =
    [];

  for (const course of COURSES) {
    const { categorySlug, modules: courseModules, ...rest } = course;
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, course.slug),
    });

    if (existing) {
      skipped++;
      // Fill in what's missing, never overwrite edits made from the app
      await db
        .update(courses)
        .set({ description: course.description })
        .where(and(eq(courses.id, existing.id), isNull(courses.description)));
      await db
        .update(courses)
        .set({ coverUrl: course.coverUrl })
        .where(and(eq(courses.id, existing.id), isNull(courses.coverUrl)));
      contentTargets.push({
        id: existing.id,
        slug: course.slug,
        modules: courseModules,
      });
      continue;
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });
    if (!category) {
      console.warn(`Category not found for slug: ${categorySlug}`);
      continue;
    }

    const [created] = await db
      .insert(courses)
      .values({
        ...rest,
        categoryId: category.id,
        currency: "USD",
        status: "published",
        publishedAt: new Date(),
      })
      .returning({ id: courses.id });
    if (created) {
      contentTargets.push({
        id: created.id,
        slug: course.slug,
        modules: courseModules,
      });
    }
    inserted++;
  }
  console.log(`Courses: ${inserted} inserted, ${skipped} skipped.`);

  for (const extra of EXTRA_CONTENT) {
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, extra.slug),
    });
    if (!existing) continue;
    await db
      .update(courses)
      .set({ description: extra.description })
      .where(and(eq(courses.id, existing.id), isNull(courses.description)));
    contentTargets.push({
      id: existing.id,
      slug: extra.slug,
      modules: extra.modules,
    });
  }

  // Covers saved as an absolute dev URL (http://localhost…) break anywhere
  // else; without one the app shows its category's default cover
  const brokenCovers = await db
    .update(courses)
    .set({ coverUrl: null })
    .where(like(courses.coverUrl, "http://localhost%"))
    .returning({ slug: courses.slug });
  for (const { slug } of brokenCovers) {
    console.log(`  ${slug}: cleared its localhost cover`);
  }

  // Seed modules and lessons
  console.log("Content:");
  for (const target of contentTargets) {
    await seedContent(target.id, target.slug, target.modules);
  }
} finally {
  await pool.end();
}
