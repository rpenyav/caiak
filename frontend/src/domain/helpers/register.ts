// src/domain/helpers/register.ts

import type {
  Phase,
  RegisterFormData,
  RegisterFormErrors,
} from "../interfaces";
import { validatePassword } from "./password";

export const EMPTY_REGISTER = (dni: string = ""): RegisterFormData => ({
  documentType: "DNI",
  documentNumber: dni,
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  phoneLandlinePrefix: "",
  phoneLandlineNumber: "",
  phoneMobilePrefix: "",
  phoneMobileNumber: "",
  address: "",
  postalCode: "",
  city: "",
  language: "es",
  country: "ES",
  province: "",
  password: "",
  provinceId: null,
  cityId: null,
  confirmPassword: "",
});

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v || "");
const isEmpty = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim().length === 0);

type ValidateOpts = {
  /** si true, no valida password/confirmPassword */
  hidePassword?: boolean;
};

export function validateRegister(
  data: RegisterFormData,
  t?: (k: string) => string | undefined,
  opts: ValidateOpts = {}
): [boolean, RegisterFormErrors] {
  const errors: RegisterFormErrors = {};
  const tr = (k: string, fb: string) => t?.(k) || fb;

  // Requeridos comunes (además de los ya existentes)
  const required: Array<[keyof RegisterFormData, string, string]> = [
    [
      "documentType",
      "user.documentType_required",
      "Tipo de documento obligatorio.",
    ],
    [
      "documentNumber",
      "user.documentNumber_required",
      "Número de documento obligatorio.",
    ],
    ["firstName", "user.firstName_required", "Nombre obligatorio."],
    ["lastName", "user.lastName_required", "Apellidos obligatorios."],
    [
      "birthDate",
      "user.birthDate_required",
      "Fecha de nacimiento obligatoria.",
    ],
    // [
    //   "phoneLandlinePrefix",
    //   "user.phoneLandlinePrefix_required",
    //   "Prefijo de teléfono fijo obligatorio.",
    // ],
    [
      "phoneLandlineNumber",
      "user.phoneLandlineNumber_required",
      "Teléfono fijo obligatorio.",
    ],
    // [
    //   "phoneMobilePrefix",
    //   "user.phoneMobilePrefix_required",
    //   "Prefijo de teléfono móvil obligatorio.",
    // ],
    [
      "phoneMobileNumber",
      "user.phoneMobileNumber_required",
      "Teléfono móvil obligatorio.",
    ],
    ["address", "user.address_required", "Dirección obligatoria."],
    ["postalCode", "user.postalCode_required", "Código postal obligatorio."],
    ["city", "user.city_required", "Ciudad obligatoria."],
    ["language", "user.language_required", "Idioma obligatorio."],
    ["country", "user.country_required", "País obligatorio."],
  ];

  for (const [key, i18nKey, fallback] of required) {
    if (isEmpty(data[key])) {
      errors[key] = tr(i18nKey, fallback);
    }
  }

  // Email: requerido + formato
  if (isEmpty(data.email)) {
    errors.email = tr("user.email_required", "Email obligatorio.");
  } else if (!isEmail(data.email)) {
    errors.email = tr("user.email_invalid", "Email inválido.");
  }

  // Passwords (salvo que pidan explícitamente ocultarlo)
  if (!opts.hidePassword) {
    const pw = validatePassword(data.password);
    if (!pw.ok) {
      if (pw.errorKey === "user.password_required")
        errors.password = tr("user.password_required", pw.message);
      else if (pw.errorKey === "user.password_minlength")
        errors.password = tr("user.password_minlength", pw.message);
      else if (pw.errorKey === "user.password_need_letter")
        errors.password = tr("user.password_need_letter", pw.message);
      else if (pw.errorKey === "user.password_need_number")
        errors.password = tr("user.password_need_number", pw.message);
      else
        errors.password = tr("user.password_invalid", "Contraseña inválida.");
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = tr(
        "user.confirmPassword_required",
        "Debe repetir la contraseña."
      );
    } else if (data.password && data.confirmPassword !== data.password) {
      errors.confirmPassword = tr(
        "user.password_mismatch",
        "Las contraseñas no coinciden."
      );
    }
  }

  const ok = Object.keys(errors).length === 0;
  return [ok, errors];
}

export const tooltipKeyByPhase = (p: Phase): string => {
  switch (p) {
    case "identify":
      return "identify.tooltip";
    case "login":
      return "login.tooltip";
    case "register_existing":
      return "register.tooltip_existing";
    case "register_new":
      return "register.tooltip_new";
    case "create_user_prompt":
      return "invite.tooltip";
    case "lopd":
      return "lopd.tooltip";
    default:
      return "";
  }
};
