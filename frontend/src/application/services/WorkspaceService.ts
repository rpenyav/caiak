// src/application/services/WorkspaceService.ts
import type { Workspace } from "@/domain/models/Workspace";
import type {
  PageRequest,
  PaginatedResponse,
} from "@/domain/models/Pagination";
import { normalizePaginatedResponse } from "@/domain/models/Pagination";
import { WorkspaceRepository } from "@/core/repositories";

/** Devuelve true si existe intersección entre arrays de roles (al menos 1 coincidencia) */
function rolesIntersect(
  userRoles: string[] | null | undefined,
  workspaceRoles: string[] | null | undefined
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
      numberOfResults: filteredList.length,
    };
  }

  async createWorkspace(input: {
    slug: string;
    name: string;
    roles: string[];
  }): Promise<Workspace> {
    return this.repo.create(input);
  }

  async getLatestWorkspace(): Promise<Workspace | null> {
    return this.repo.getLatest();
  }
}
