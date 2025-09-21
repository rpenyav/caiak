import { loginRepository } from "./authRepository";
import {
  clearTokens,
  setTokens,
  getStoredToken,
} from "@/application/utils/tokenUtils";

/** Limpia tokens (cookies + LS) y artefactos de invitación */
export function clearAuthAndInvite() {
  try {
    clearTokens();
  } catch {
    /* no-op */
  }
}

/** LOGIN: hace la llamada al repositorio y almacena el token */
export async function login(email: string, password: string): Promise<boolean> {
  const token = await loginRepository(email, password);
  if (token) {
    setTokens(token);
    return true;
  }
  return false;
}

/** Devuelve el token desde cookies/LS si existe */
export function getToken(): string | null {
  return getStoredToken();
}

/** LOGOUT: borra todo y redirige inmediatamente al login */
export function logout(): void {
  clearAuthAndInvite();
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}
