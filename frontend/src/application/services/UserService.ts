// src/application/services/UserService.ts
import Cookies from "js-cookie";
import type { User } from "@/domain/models/User";
import { getUserIdFromToken } from "@/application/utils/jwt";
import type { RegisterPayload, UserRepository } from "@/core/repositories";

export class UserService {
  private readonly repo: UserRepository;

  constructor(repo: UserRepository) {
    this.repo = repo;
  }

  async register(payload: RegisterPayload): Promise<User> {
    return this.repo.register(payload);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = Cookies.get("accessToken");
    if (!token) return null;

    const userId = getUserIdFromToken(token);
    if (!userId) return null;

    try {
      const user = await this.repo.getById(userId);
      return user;
    } catch {
      return null;
    }
  }

  async refreshCurrentUser(): Promise<User | null> {
    return this.getCurrentUser();
  }

  logout(): void {
    Cookies.remove("accessToken");
    // notifica a rutas/guards para re-render
    try {
      window.dispatchEvent(new Event("auth:token"));
    } catch {}
  }
}
