import axios from "axios";

import { SECURITY_BASE_URL } from "@/domain/helpers/env";

const stripBearer = (v?: string | null): string | null =>
  v ? (v.startsWith("Bearer ") ? v.slice(7) : v) : null;

const normalizeToken = (v?: string | null): string | null => {
  const s = (v ?? "").trim();
  if (!s) return null;
  const low = s.toLowerCase();
  if (low === "null" || low === "undefined") return null;
  return s;
};

/**
 * POST {{SERVER_SECURITY}}/api/users/login
 * body: { email, password }
 * El token viene en el header Authorization (Bearer ...).
 * Devuelve token (sin "Bearer ") o null.
 */
export const loginRepository = async (
  email: string,
  password: string
): Promise<string | null> => {
  try {
    const base = SECURITY_BASE_URL || "";
    const url = `${base}/users/login`;
    const response = await axios.post(
      url,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true, // gestionamos manualmente
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // Necesitas Access-Control-Expose-Headers: Authorization en backend
      const authHeader =
        (response.headers && (response.headers["authorization"] as string)) ||
        (response.headers && (response.headers["Authorization"] as string));

      // Fallback temporal por si backend también lo devuelve en body: { token: "Bearer ..." }
      const bodyToken: string | undefined =
        (response.data && response.data.token) || undefined;

      const tokenFromHeader = normalizeToken(stripBearer(authHeader));
      const tokenFromBody = normalizeToken(stripBearer(bodyToken));

      return tokenFromHeader || tokenFromBody || null;
    }

    console.error("Error en la respuesta del servidor:", response.data);
    return null;
  } catch (error) {
    console.error("Error al hacer login:", error);
    return null;
  }
};
