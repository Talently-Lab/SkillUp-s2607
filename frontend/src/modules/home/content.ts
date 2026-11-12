import type { IconName } from "@/shared/components/Icon";

/* Demo content for the landing. The project is a demo, so stats, testimonials
   and companies are mock data. */

export const HEADLINE_WORDS = [
  "Power BI",
  "Excel",
  "Python",
  "Figma",
  "SQL",
  "UX/UI",
];
export const TRY_SUGGESTIONS = ["Excel", "Python", "Figma", "Power BI"];

export const STATS: Array<{
  icon: IconName;
  tone: string;
  value: string;
  suffix?: string;
  label: string;
}> = [
  {
    icon: "users",
    tone: "violet",
    value: "18.000",
    label: "estudiantes aprendiendo",
  },
  {
    icon: "star",
    tone: "sun",
    value: "4,8",
    suffix: " / 5",
    label: "valoración promedio",
  },
  { icon: "book", tone: "teal", value: "120", label: "cursos prácticos" },
  { icon: "cert", tone: "green", value: "12", label: "cursos gratis" },
];

export const CHAPTERS = [
  {
    title: "Explorá el catálogo",
    text: "Filtrá por área, nivel y duración hasta dar con tu curso.",
    time: "0:00",
  },
  {
    title: "Inscribite en un minuto",
    text: "Con tu email o con Google, y entrás al contenido al instante.",
    time: "0:20",
  },
  {
    title: "Aprendé y certificate",
    text: "Avanzá desde cualquier dispositivo y llevate tu certificado.",
    time: "0:40",
  },
];

export const QUOTES = [
  {
    metric: { value: "3 meses", label: "de cero a analista de datos" },
    text: "Arranqué sin saber nada de datos. Tres meses después armé el primer dashboard de mi equipo en Power BI y me ascendieron a analista.",
    name: "Camila Suárez",
    role: "Analista de datos · Córdoba",
    tint: "var(--teal)",
  },
  {
    text: "Los cursos van directo a lo práctico. Pude estudiar de noche después del trabajo sin perderme.",
    name: "Joaquín Pérez",
    role: "Desarrollador junior · Rosario",
    tint: "var(--sun)",
  },
  {
    text: "El curso de UX/UI me dio el portfolio que necesitaba para conseguir mis primeros clientes.",
    name: "Rocío Medina",
    role: "Diseñadora freelance · Mendoza",
    tint: "#b9a4ff",
  },
];

export const COMPANIES = [
  "mercadoandino",
  "Nubia Fintech",
  "Tandil Labs",
  "Grupo Litoral",
  "Patagonia.data",
];

/** Icon and tint for each area chip, matched by the category name */
const AREA_STYLES: Array<{
  match: RegExp;
  icon: IconName;
  bg: string;
  fg: string;
}> = [
  {
    match: /dato|data|anal/i,
    icon: "chart",
    bg: "var(--teal-soft)",
    fg: "var(--teal-text)",
  },
  { match: /dise|ux|ui/i, icon: "pen", bg: "#ffe9f0", fg: "#c2255c" },
  {
    match: /progra|desarrollo|code|web/i,
    icon: "code",
    bg: "var(--primary-soft)",
    fg: "var(--primary)",
  },
  { match: /market/i, icon: "megaphone", bg: "#e6efff", fg: "#2f6fe0" },
  {
    match: /finan|negocio/i,
    icon: "coin",
    bg: "var(--sun-soft)",
    fg: "#7a5200",
  },
  {
    match: /idioma|ingl/i,
    icon: "globe",
    bg: "var(--success-bg)",
    fg: "var(--success)",
  },
  { match: /lider|gesti|soft/i, icon: "compass", bg: "#fdeee4", fg: "#8a3f12" },
  {
    match: /cloud|nube|devops/i,
    icon: "cloud",
    bg: "var(--info-bg)",
    fg: "var(--info)",
  },
];

export function areaStyle(category: string) {
  return (
    AREA_STYLES.find((style) => style.match.test(category)) ?? {
      icon: "book" as IconName,
      bg: "var(--surface-2)",
      fg: "var(--ink)",
    }
  );
}
