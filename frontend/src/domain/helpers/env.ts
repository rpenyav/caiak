// src/domain/helpers/env.ts
const toBool = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase() === "true";

export const APP_NAME = String(import.meta.env.VITE_APP_NAME || "App");
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "");
export const SECURITY_BASE_URL = String(
  import.meta.env.VITE_SECURITY_BASE_URL || API_BASE_URL || ""
);
export const BASE_URL = String(import.meta.env.VITE_BASE_URL || "");
export const LANGUAGE_DEFAULT = String(
  import.meta.env.VITE_LANGUAGE_DEFAULT || "es"
);

// ¡EL CRÍTICO!
export const USE_MOCK_LOGIN = toBool(import.meta.env.VITE_USE_MOCK_LOGIN);

// Nombre de cookie para el access token
export const ACCESS_TOKEN_COOKIE = String(
  import.meta.env.VITE_ACCESS_TOKEN_COOKIE || "access_token"
);
