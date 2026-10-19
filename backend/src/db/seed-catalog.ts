import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./client.ts";
import { categories, courses } from "./schema/index.ts";

/* eslint-disable no-console -- CLI script output */

const parsed = z
  .object({
    SEED_ADMIN_EMAIL: z.string().optional(),
  })
  .safeParse(process.env);

if (!parsed.success) {
  console.error("Env error", parsed.error);
  process.exit(1);
}

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

const COURSES = [
  {
    slug: "analisis-datos-excel-powerbi",
    title: "Análisis de Datos con Excel y Power BI",
    categorySlug: "datos",
    level: "beginner" as const,
    priceCents: 4900,
    status: "published" as const,
    featured: true,
    studentsCount: 3420,
    ratingAvg: "4.8",
    lessonsCount: 48,
    durationMinutes: 1440,
  },
  {
    slug: "fundamentos-ux-ui",
    title: "Fundamentos de Diseño UX/UI",
    categorySlug: "diseno",
    level: "beginner" as const,
    priceCents: 3900,
    status: "published" as const,
    featured: true,
    studentsCount: 2870,
    ratingAvg: "4.9",
    lessonsCount: 36,
    durationMinutes: 1080,
  },
  {
    slug: "python-desde-cero",
    title: "Python desde cero para automatizar tareas",
    categorySlug: "programacion",
    level: "beginner" as const,
    priceCents: 0,
    status: "published" as const,
    featured: true,
    studentsCount: 5210,
    ratingAvg: "4.7",
    lessonsCount: 60,
    durationMinutes: 1800,
  },
  {
    slug: "marketing-digital-estrategico",
    title: "Marketing Digital Estratégico",
    categorySlug: "marketing",
    level: "intermediate" as const,
    priceCents: 4500,
    status: "published" as const,
    featured: true,
    studentsCount: 1980,
    ratingAvg: "4.6",
    lessonsCount: 32,
    durationMinutes: 960,
  },
  {
    slug: "finanzas-no-financieros",
    title: "Finanzas para no financieros",
    categorySlug: "finanzas",
    level: "beginner" as const,
    priceCents: 0,
    status: "published" as const,
    featured: false,
    studentsCount: 4100,
    ratingAvg: "4.5",
    lessonsCount: 20,
    durationMinutes: 480,
  },
  {
    slug: "ingles-profesional",
    title: "Inglés para entornos profesionales B1-B2",
    categorySlug: "idiomas",
    level: "intermediate" as const,
    priceCents: 5900,
    status: "published" as const,
    featured: false,
    studentsCount: 2650,
    ratingAvg: "4.7",
    lessonsCount: 80,
    durationMinutes: 2400,
  },
  {
    slug: "liderazgo-equipos",
    title: "Liderazgo y gestión de equipos",
    categorySlug: "liderazgo",
    level: "intermediate" as const,
    priceCents: 3500,
    status: "published" as const,
    featured: false,
    studentsCount: 1540,
    ratingAvg: "4.8",
    lessonsCount: 24,
    durationMinutes: 720,
  },
  {
    slug: "introduccion-nube-aws",
    title: "Introducción a la nube con AWS",
    categorySlug: "cloud",
    level: "beginner" as const,
    priceCents: 5500,
    status: "published" as const,
    featured: false,
    studentsCount: 1320,
    ratingAvg: "4.6",
    lessonsCount: 42,
    durationMinutes: 1200,
  },
];

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

  for (const course of COURSES) {
    const existing = await db.query.courses.findFirst({
      where: eq(courses.slug, course.slug),
    });
    if (existing) {
      skipped++;
      continue;
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, course.categorySlug),
    });
    if (!category) {
      console.warn(`Category not found for slug: ${course.categorySlug}`);
      continue;
    }

    const { categorySlug: _categorySlug, ...rest } = course;
    await db.insert(courses).values({
      ...rest,
      categoryId: category.id,
      currency: "USD",
      publishedAt: new Date(),
    });
    inserted++;
  }
  console.log(`Courses: ${inserted} inserted, ${skipped} skipped.`);
} finally {
  await pool.end();
}
