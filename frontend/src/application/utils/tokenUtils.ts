// src/application/utils/tokenUtils.ts
import Cookies from "js-cookie";

const COOKIE_KEYS = ["access_token", "authentication_token"];

export function setTokens(rawToken: string) {
  COOKIE_KEYS.forEach((k) =>
    Cookies.set(k, rawToken, { expires: 7, sameSite: "lax", path: "/" })
  );
  try {
    COOKIE_KEYS.forEach((k) => localStorage.setItem(k, rawToken));
  } catch {}
  window.dispatchEvent(new Event("auth:token"));
}

export function clearTokens() {
  COOKIE_KEYS.forEach((k) => Cookies.remove(k, { path: "/" }));
  try {
    COOKIE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}

  window.dispatchEvent(new Event("auth:token"));
}

export function getStoredToken(): string | null {
  try {
    const cookieToken =
      Cookies.get("access_token") || Cookies.get("authentication_token");
    const lsToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("authentication_token");
    return cookieToken || lsToken || null;
  } catch {
    return null;
  }
}
