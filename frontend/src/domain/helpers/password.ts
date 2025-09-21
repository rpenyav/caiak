// src/domain/helpers/password.ts
export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; errorKey: string; message: string };

export function validatePassword(
  pwd: string,
  {
    minLength = 8,
    requireLetter = true,
    requireNumber = true,
  }: {
    minLength?: number;
    requireLetter?: boolean;
    requireNumber?: boolean;
  } = {}
): PasswordValidationResult {
  if (!pwd || pwd.trim().length === 0) {
    return {
      ok: false,
      errorKey: "user.password_required",
      message: "La contraseña es obligatoria.",
    };
  }
  if (pwd.length < minLength) {
    return {
      ok: false,
      errorKey: "user.password_minlength",
      message: `La contraseña debe tener al menos ${minLength} caracteres.`,
    };
  }
  if (requireLetter && !/[A-Za-z]/.test(pwd)) {
    return {
      ok: false,
      errorKey: "user.password_need_letter",
      message: "La contraseña debe contener al menos una letra.",
    };
  }
  if (requireNumber && !/\d/.test(pwd)) {
    return {
      ok: false,
      errorKey: "user.password_need_number",
      message: "La contraseña debe contener al menos un número.",
    };
  }
  return { ok: true };
}

// Valida el par (password, confirm). Reutiliza validatePassword.
export function validatePasswordPair(
  password: string,
  confirm: string,
  t?: (k: string) => string | undefined
): { ok: boolean; errors: { next?: string; confirm?: string } } {
  const errors: { next?: string; confirm?: string } = {};

  const res = validatePassword(password);
  if (!res.ok) {
    errors.next =
      (res.errorKey && t?.(res.errorKey)) ||
      res.message ||
      "Contraseña inválida.";
  }

  if (!confirm) {
    errors.confirm =
      t?.("user.confirmPassword_required") || "Debe repetir la contraseña.";
  } else if (password && confirm !== password) {
    errors.confirm =
      t?.("user.password_mismatch") || "Las contraseñas no coinciden.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
