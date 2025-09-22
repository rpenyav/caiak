// src/application/utils/tokenUtils.ts
import Cookies from "js-cookie";

const COOKIE_KEY = "accessToken";

export function setTokens(rawToken: string) {
  Cookies.set(COOKIE_KEY, rawToken, {
    expires: 7,
    sameSite: "lax",
    path: "/",
    ...(window.location.protocol === "https:" ? { secure: true } : {}),
  });
  window.dispatchEvent(new Event("auth:token"));
}

export function clearTokens() {
  Cookies.remove(COOKIE_KEY, { path: "/" });
  window.dispatchEvent(new Event("auth:token"));
}

export function getStoredToken(): string | null {
  return Cookies.get(COOKIE_KEY) ?? null;
}
