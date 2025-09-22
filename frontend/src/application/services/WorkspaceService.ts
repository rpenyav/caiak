// src/application/services/WorkspaceService.ts
import type { Workspace } from "@/domain/models/Workspace";
import type {
  PageRequest,
  PaginatedResponse,
} from "@/domain/models/Pagination";
import { normalizePaginatedResponse } from "@/domain/models/Pagination";
import { WorkspaceRepository } from "@/core/repositories";

/**
 * Devuelve true si existe intersección entre arrays de roles (al menos 1 coincidencia).
 */
function rolesIntersect(
  userRoles: string[] | undefined | null,
  workspaceRoles: string[] | undefined | null
): boolean {
  if (!userRoles || !workspaceRoles) return false;
  const set = new Set(userRoles.map((r) => r.trim().toLowerCase()));
  return workspaceRoles.some((r) => set.has(r.trim().toLowerCase()));
}

export class WorkspaceService {
  private readonly repo: WorkspaceRepository;

  constructor(repo?: WorkspaceRepository) {
    this.repo = repo ?? new WorkspaceRepository();
  }

  /**
   * Obtiene lista paginada de workspaces y filtra por roles del usuario.
   * - Normaliza los números de paginado (por si vienen como string).
   * - Aplica filtro: workspace.roles ∩ userRoles ≠ ∅
   */
  async getWorkspacesForUser(
    params: PageRequest,
    userRoles: string[] | null | undefined
  ): Promise<PaginatedResponse<Workspace>> {
    const raw = await this.repo.getList(params);
    const normalized = normalizePaginatedResponse<Workspace>(raw);

    const filteredList = normalized.list.filter((ws) =>
      rolesIntersect(userRoles, ws.roles)
    );

    return {
      ...normalized,
      list: filteredList,
      numberOfResults: filteredList.length, // OJO: si quieres mantener el total original del backend, cambia esta línea
    };
  }
}
