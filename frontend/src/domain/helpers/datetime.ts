// src/domain/helpers/datetime.ts

/**
 * Formatea una fecha ISO (por ej. "2025-09-02T22:00:00.000+00:00")
 * al formato "dd-MM-YYYY HH:mm" en la zona horaria local del navegador,
 * o en la zona especificada en options.timeZone.
 *
 * @example
 * formatIsoToDisplay("2025-09-02T22:00:00.000+00:00") // -> "02-09-2025 00:00" (depende de tu TZ)
 * formatIsoToDisplay("2025-09-02T22:00:00.000+00:00", { timeZone: "Europe/Madrid" }) // "03-09-2025 00:00"
 */
export function formatIsoToDisplay(
  value?: string | Date,
  options?: { timeZone?: string }
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: options?.timeZone,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");
  const hh = get("hour");
  const mi = get("minute");

  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
}

/**
 * Convierte fechas ISO a formato DD-MM-YYYY para display.
 * Acepta "YYYY-MM-DD" o ISO con hora "YYYY-MM-DDTHH:mm:ssZ".
 * Si no puede parsear, devuelve el valor original.
 */
export function formatIsoDateToDmy(input?: string | null): string {
  if (!input) return "";
  try {
    const s = String(input).trim();
    const datePart = s.includes("T") ? s.slice(0, 10) : s; // "YYYY-MM-DD"
    const [y, m, d] = datePart.split("-");
    if (y && m && d) return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;

    // Fallback: intentar con Date (por si llega en otro formato)
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return String(input);
  }
}
