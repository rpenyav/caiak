// src/application/utils/jwt.ts

/**
 * Decodifica un JWT (sin validar firma) y devuelve el payload.
 * Devuelve null si el token no es válido.
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    // atob espera padding correcto; ajustamos si hace falta
    const padLength = 4 - (payloadB64.length % 4 || 4);
    const padded = payloadB64 + "=".repeat(padLength === 4 ? 0 : padLength);

    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Intenta extraer el identificador de usuario de un JWT.
 * Se prueban varias claims habituales: 'userId', 'sub', 'id', '_id'
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const candidates = ["userId", "sub", "id", "_id"];
  for (const key of candidates) {
    const val = payload[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return val;
    }
  }
  return null;
}

/** Devuelve el `exp` (segundos epoch) o null si no existe. */
export function getTokenExp(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const exp = payload["exp"];
  return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
}

/** Milisegundos que faltan para expirar. Null si no hay `exp`. */
export function msUntilExpiry(token: string): number | null {
  const exp = getTokenExp(token);
  if (exp == null) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  return (exp - nowSec) * 1000;
}

/**
 * ¿Está expirado el token? Se permite un margen (skew) en segundos
 * para evitar falsos positivos por desfases de reloj.
 */
export function isTokenExpired(token: string, skewSeconds = 15): boolean {
  const exp = getTokenExp(token);
  if (exp == null) return false; // si no hay exp, no forzamos logout por tiempo
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= exp - skewSeconds;
}
