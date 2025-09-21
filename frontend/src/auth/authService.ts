// src/auth/authService.ts
import Cookies from "js-cookie";
import { loginRepository } from "./authRepository";
import {
  setTokens,
  clearTokens,
  getStoredToken,
} from "@/application/utils/tokenUtils";

/** Claves de artefactos de invitación que debemos limpiar */
const INVITE_KEYS = [
  "invite_token",
  "invite_dto",
  "invite_lang",
  "invite_tercero_id",
] as const;

/** Limpia tokens (cookies + LS) y artefactos de invitación */
export function clearAuthAndInvite() {
  try {
    clearTokens();
    INVITE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* no-op */
  }
}

/** LOGIN real: pega al backend, guarda token si llega en Authorization */
export async function login(
  username: string,
  password: string
): Promise<boolean> {
  const rawToken = await loginRepository(username, password);
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  if (rawToken) {
    setTokens(rawToken); // cookies + LS + evento
    Cookies.set("access_token", rawToken, {
      secure: isHttps,
      sameSite: "Lax",
      path: "/",
    });
    window.dispatchEvent(new Event("auth:token"));
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
