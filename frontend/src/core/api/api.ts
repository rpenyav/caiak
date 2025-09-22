// src/infrastructure/api/api.ts
import Cookies from "js-cookie";

type Json =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

export type HttpError = Error & {
  status?: number;
  code?: number | string;
  raw?: unknown;
};

const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const getAuthHeaders = (): HeadersInit => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function doFetch(
  url: string,
  options: RequestInit,
  injectAuth: boolean
): Promise<any> {
  const headers: HeadersInit = {
    ...baseHeaders,
    ...(injectAuth ? getAuthHeaders() : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const err: HttpError = new Error(
      (payload && ((payload as any).message || (payload as any).errorString)) ||
        `HTTP ${response.status}`
    );
    err.status = response.status;
    if (payload && (payload as any).code !== undefined) {
      err.code = (payload as any).code;
    }
    err.raw = payload;

    // 🚨 Señalizamos expiración/unauthorized cuando la petición era con auth
    if (injectAuth && (response.status === 401 || response.status === 403)) {
      try {
        window.dispatchEvent(
          new CustomEvent("auth:expired", {
            detail: { status: response.status, url },
          })
        );
      } catch {
        // no-op en entornos sin window
      }
    }

    throw err;
  }

  return payload as Json;
}

/** Con auth (Bearer si existe cookie) */
export const fetchWithAuth = (url: string, options: RequestInit = {}) =>
  doFetch(url, options, true);

/** Sin auth (mejorada con status/code/raw en el error) */
export const fetchWithoutAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();

  if (!response.ok) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // no-op
    }
    const msg =
      (parsed && (parsed.message || parsed.errorString)) ||
      text ||
      "Request error";
    const err: HttpError = new Error(msg);
    err.status = response.status;
    if (parsed && parsed.code !== undefined) err.code = parsed.code;
    err.raw = parsed || text;
    throw err;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
