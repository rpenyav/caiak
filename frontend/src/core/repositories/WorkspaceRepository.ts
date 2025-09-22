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

  /**
   * GET {{SERVER_CAIAK}}/workspaces?pageSize=&pageNumber=&sortBy=&sortDirection=
   * Requiere Authorization: Bearer ...
   */
  async getList(params: PageRequest): Promise<PaginatedResponse<Workspace>> {
    const url = new URL(`${this.baseUrl}/workspaces`);

    url.searchParams.set("pageSize", String(params.pageSize));
    url.searchParams.set("pageNumber", String(params.pageNumber));
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
    if (params.sortDirection)
      url.searchParams.set("sortDirection", params.sortDirection);

    const raw = await fetchWithAuth(url.toString(), { method: "GET" });
    // No normalizamos aquí para dejarlo al servicio (orquestación)
    return raw as PaginatedResponse<Workspace>;
  }
}
