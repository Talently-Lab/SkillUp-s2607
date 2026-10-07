export function formatPrice(price: number | null): string {
  return price === null ? "Gratis" : `US$ ${price}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "hace 3 días", "hace 2 semanas", "el mes pasado"… */
export function formatRelativeTime(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 60) return "Ahora";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86_400 * 7)
    return relative.format(Math.round(seconds / 86_400), "day");
  if (abs < 86_400 * 30)
    return relative.format(Math.round(seconds / (86_400 * 7)), "week");
  if (abs < 86_400 * 365)
    return relative.format(Math.round(seconds / (86_400 * 30)), "month");
  return relative.format(Math.round(seconds / (86_400 * 365)), "year");
}

/** Lowercases and strips accents so "diseño" matches "Diseno". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
