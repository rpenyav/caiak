// src/infrastructure/repositories/UserRepository.ts
import type { User } from "@/domain/models/User";
import { fetchWithoutAuth, fetchWithAuth } from "../api/api";

export type RegisterPayload = {
  email: string;
  password: string;
  roles: string[];
};

export class UserRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL as string) {
    this.baseUrl = baseUrl;
  }

  /** Crea usuario (registro). NO requiere auth. */
  async register(data: RegisterPayload): Promise<User> {
    const url = `${this.baseUrl}/users/register`;
    const body = JSON.stringify(data);

    const created = await fetchWithoutAuth(url, {
      method: "POST",
      body,
    });

    return created as User;
  }

  /** Obtiene usuario por id. Requiere auth. */
  async getById(id: string): Promise<User> {
    const url = `${this.baseUrl}/users/${encodeURIComponent(id)}`;
    const user = await fetchWithAuth(url, { method: "GET" });
    return user as User;
  }
}
