/**
 * Formatea un número como importe en euros con 2 decimales.
 * Devuelve "-" si el valor no es válido.
 */
export function formatEuro(
  value: number | null | undefined,
  locale: string = "ca-ES"
): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback simple
    return `${value.toFixed(2)} €`;
  }
}
