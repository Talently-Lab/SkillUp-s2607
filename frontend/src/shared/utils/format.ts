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
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const moneyRounded = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moneyCompact = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoneyRounded(amount: number): string {
  return moneyRounded.format(amount);
}

/** "US$ 45,2 k", for chart axes */
export function formatMoneyCompact(amount: number): string {
  return moneyCompact.format(amount);
}

/** "8,5%" */
export function formatPercent(value: number): string {
  return `${value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
