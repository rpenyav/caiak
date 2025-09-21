import Cookies from "js-cookie";

const COOKIE_KEYS = ["accessToken"];

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
    const cookieToken = Cookies.get("accessToken");
    const lsToken = localStorage.getItem("accessToken");
    return cookieToken || lsToken || null;
  } catch {
    return null;
  }
}
