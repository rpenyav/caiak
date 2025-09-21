// src/domain/helpers/lopd.ts
export type LopdConsents = {
  campanyas: boolean; // swCampanyas
  circular: boolean; // swCircular
  tratamiento: boolean; // swTratamiento (OBLIGATORIO)
};

export type LopdConsentsDTO = {
  swCampanyas: "S" | "N";
  swCircular: "S" | "N";
  swTratamiento: "S" | "N";
};

/**
 * Estructura posible en localStorage (compatibilidad con claves antiguas).
 * - campaigns / circulars / consent → nombres legacy usados en UI
 * - campanyas / circular / tratamiento → nombres nuevos equivalentes
 */
type LopdPrefsStorage = {
  campaigns?: boolean;
  circulars?: boolean;
  consent?: boolean;
  campanyas?: boolean;
  circular?: boolean;
  tratamiento?: boolean;
};

export const LOPD_STORAGE_KEY = "lopd:preferences";

export function getLopdConsentsFromStorage(): LopdConsents {
  try {
    const raw = localStorage.getItem(LOPD_STORAGE_KEY);
    const parsed: LopdPrefsStorage = (
      raw ? JSON.parse(raw) : {}
    ) as LopdPrefsStorage;

    return {
      // Usamos nullish coalescing ANTES de convertir a boolean
      campanyas: Boolean(parsed.campaigns ?? parsed.campanyas ?? false),
      circular: Boolean(parsed.circulars ?? parsed.circular ?? false),
      tratamiento: Boolean(parsed.consent ?? parsed.tratamiento ?? false),
    };
  } catch {
    return { campanyas: false, circular: false, tratamiento: false };
  }
}

export function setLopdConsentsToStorage(c: LopdConsents): void {
  try {
    // Conservamos nombres legacy para no romper lecturas previas
    const compat: LopdPrefsStorage = {
      campaigns: !!c.campanyas,
      circulars: !!c.circular,
      consent: !!c.tratamiento,
    };
    localStorage.setItem(LOPD_STORAGE_KEY, JSON.stringify(compat));
  } catch {
    /* noop */
  }
}

const toSN = (b: boolean): "S" | "N" => (b ? "S" : "N");

export function toLopdDTO(c: LopdConsents): LopdConsentsDTO {
  return {
    swCampanyas: toSN(c.campanyas),
    swCircular: toSN(c.circular),
    swTratamiento: toSN(c.tratamiento),
  };
}
