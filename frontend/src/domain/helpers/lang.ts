// src/domain/helpers/lang.ts

/** IDs de idioma que espera el backend */
export type BackendLang = 1 | 2 | 3; // 1=ca, 2=es, 3=en

const LANG_CODE_TO_ID: Record<string, BackendLang> = {
  ca: 1,
  es: 2,
  en: 3,
};

/**
 * Convierte un código de idioma (ca|es|en, o similares: 'es-ES', 'CA', etc.)
 * en el id numérico que espera el backend.
 * Fallback: 2 ('es').
 */
export const langToBackend = (lng?: string): BackendLang => {
  const code = (lng || "").slice(0, 2).toLowerCase();
  return LANG_CODE_TO_ID[code] ?? 2;
};

/**
 * Normaliza cualquier entrada de idioma que pueda llegarte a repos/servicios:
 * - number -> se devuelve tal cual (siempre que sea 1,2,3; si no cuadra, fallback).
 * - string numérica -> se parsea a number y se valida (1,2,3; si no cuadra, fallback).
 * - string código -> se mapea (ca|es|en; si no cuadra, fallback).
 * Fallback: 2 ('es').
 */
export const normalizeLangForApi = (lang?: string | number): BackendLang => {
  if (typeof lang === "number") {
    return lang === 1 || lang === 2 || lang === 3 ? lang : 2;
  }
  if (lang && /^\d+$/.test(lang)) {
    const n = Number(lang);
    return n === 1 || n === 2 || n === 3 ? (n as BackendLang) : 2;
  }
  return langToBackend(lang);
};
