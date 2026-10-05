export function formatPrice(price: number | null): string {
  return price === null ? "Gratis" : `US$ ${price}`;
}
