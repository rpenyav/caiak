// src/utils/text.ts
export type TruncatePosition = "end" | "start" | "middle";

export interface TruncateOptions {
  max?: number; // longitud máx. (por defecto 30)
  position?: TruncatePosition; // dónde cortar: end | start | middle
  ellipsis?: string; // símbolo de corte (por defecto "…")
  byWords?: boolean; // respetar palabras al cortar (solo "end")
}

export function truncateText(
  input: string,
  max: number = 30,
  opts: TruncateOptions = {}
): string {
  const { position = "end", ellipsis = "…", byWords = false } = opts;

  if (typeof input !== "string") return "";
  const s = input.trim();
  if (s.length <= max || max <= 0) return s;

  if (position === "start") {
    return ellipsis + s.slice(s.length - max + ellipsis.length);
  }

  if (position === "middle") {
    const half = Math.max(1, Math.floor((max - ellipsis.length) / 2));
    return s.slice(0, half) + ellipsis + s.slice(s.length - half);
  }

  // end (opción por defecto)
  if (!byWords) {
    return s.slice(0, max - ellipsis.length) + ellipsis;
  }

  // end + byWords: corta intentando no partir palabras
  const cut = Math.max(0, max - ellipsis.length);
  const slice = s.slice(0, cut);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > cut * 0.6) {
    return slice.slice(0, lastSpace) + ellipsis;
  }
  return slice + ellipsis;
}
