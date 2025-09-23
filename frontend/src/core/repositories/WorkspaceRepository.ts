// src/infrastructure/repositories/WorkspaceRepository.ts
import type { Workspace } from "@/domain/models/Workspace";
import type {
  PageRequest,
  PaginatedResponse,
} from "@/domain/models/Pagination";
import { fetchWithAuth } from "../api/api";

export class WorkspaceRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL as string) {
    this.baseUrl = baseUrl;
  }

  async getList(params: PageRequest): Promise<PaginatedResponse<Workspace>> {
    const url = new URL(`${this.baseUrl}/workspaces`);
    url.searchParams.set("pageSize", String(params.pageSize));
    url.searchParams.set("pageNumber", String(params.pageNumber));
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
    if (params.sortDirection)
      url.searchParams.set("sortDirection", params.sortDirection);

    const raw = await fetchWithAuth(url.toString(), { method: "GET" });
    return raw as PaginatedResponse<Workspace>;
  }

  async create(input: {
    slug: string;
    name: string;
    roles: string[];
  }): Promise<Workspace> {
    const url = `${this.baseUrl}/workspaces`;
    const res = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    return res as Workspace;
  }

  /** Último workspace creado (asumiendo que el backend soporta order por createdAt) */
  async getLatest(): Promise<Workspace | null> {
    const url = new URL(`${this.baseUrl}/workspaces`);
    url.searchParams.set("pageSize", "1");
    url.searchParams.set("pageNumber", "1");
    url.searchParams.set("sortBy", "createdAt");
    url.searchParams.set("sortDirection", "desc");
    const raw = await fetchWithAuth(url.toString(), { method: "GET" });
    const pr = raw as PaginatedResponse<Workspace>;
    return pr.list?.[0] ?? null;
  }
}
