import type { RegisterFormData } from "@/infrastructure/types";

/** Obtiene credenciales con las que intentar el login tras un registro. */
export const getCredentialsFromRegister = (data: RegisterFormData) => {
  return {
    // si tu backend usa email como usuario, cambia a: username: data.email
    username: data.documentNumber,
    password: data.password,
  };
};
