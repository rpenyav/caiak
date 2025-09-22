// authRepository.ts
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
        validateStatus: () => true,
      }
    );

    if (response.status >= 200 && response.status < 300) {
      const headers = response.headers || {};
      const authHeader =
        (headers["authorization"] as string) ??
        (headers["Authorization"] as string);

      const body = response.data || {};
      const candidates = [
        stripBearer(authHeader),
        stripBearer(body.token),
        stripBearer(body.accessToken),
        stripBearer(body.access_token),
      ]
        .map(normalizeToken)
        .filter(Boolean) as string[];

      return candidates[0] ?? null;
    }

    console.error("Error en la respuesta del servidor:", response.data);
    return null;
  } catch (error) {
    console.error("Error al hacer login:", error);
    return null;
  }
};
