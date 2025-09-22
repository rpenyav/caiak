import { ConversationRepository } from "@/core/repositories";
import type {
  Conversation,
  CreateConversationPayload,
} from "@/domain/models/Conversation";
import type {
  PageRequest,
  PaginatedResponse,
} from "@/domain/models/Pagination";
import { normalizePaginatedResponse } from "@/domain/models/Pagination";

function rolesIntersect(
  userRoles?: string[] | null,
  itemRoles?: string[] | null
): boolean {
  if (!userRoles || !itemRoles) return false;
  const set = new Set(userRoles.map((r) => r.trim().toLowerCase()));
  return itemRoles.some((r) => set.has(r.trim().toLowerCase()));
}

function sortClient(
  list: Conversation[],
  sortBy?: string,
  dir: "asc" | "desc" = "asc"
): Conversation[] {
  const copy = [...list];
  const factor = dir === "desc" ? -1 : 1;

  copy.sort((a, b) => {
    switch (sortBy) {
      case "name": {
        const an = (a.name || "").toLocaleLowerCase();
        const bn = (b.name || "").toLocaleLowerCase();
        if (an < bn) return -1 * factor;
        if (an > bn) return 1 * factor;
        return 0;
      }
      case "updatedAt": {
        const ad = new Date((a as any).updatedAt || 0).getTime();
        const bd = new Date((b as any).updatedAt || 0).getTime();
        return (ad - bd) * factor;
      }
      case "createdAt":
      default: {
        const ad = new Date((a as any).createdAt || 0).getTime();
        const bd = new Date((b as any).createdAt || 0).getTime();
        return (ad - bd) * factor;
      }
    }
  });

  return copy;
}

function paginateClient(
  list: Conversation[],
  pageSize?: number,
  pageNumber?: number
): { slice: Conversation[]; total: number } {
  const size = Math.max(1, Number(pageSize || list.length || 1));
  const page = Math.max(1, Number(pageNumber || 1));
  const start = (page - 1) * size;
  return { slice: list.slice(start, start + size), total: list.length };
}

export class ConversationService {
  private readonly repo: ConversationRepository;

  constructor(repo?: ConversationRepository) {
    this.repo = repo ?? new ConversationRepository();
  }

  async create(payload: CreateConversationPayload): Promise<Conversation> {
    return this.repo.create(payload);
  }

  /**
   * Si se pasa workspaceSlug:
   *  - llama a GET /conversations/workspace/:slug (sin paginado en backend)
   *  - filtra por roles del usuario
   *  - ordena y pagina en cliente según params
   *
   * Si NO hay workspaceSlug:
   *  - usa GET /conversations con paginado/orden (si tu backend lo mantiene)
   */
  async getListForUser(
    params: PageRequest,
    userRoles: string[] | null | undefined,
    workspaceSlug?: string
  ): Promise<PaginatedResponse<Conversation>> {
    if (workspaceSlug) {
      const rawList = await this.repo.getByWorkspace(workspaceSlug);

      // filtro por roles
      const filtered =
        userRoles && userRoles.length
          ? rawList.filter((c) => rolesIntersect(userRoles, c.roles))
          : rawList;

      // orden + paginado en cliente
      const sorted = sortClient(
        filtered,
        params.sortBy,
        (params.sortDirection as "asc" | "desc") || "asc"
      );
      const { slice, total } = paginateClient(
        sorted,
        params.pageSize,
        params.pageNumber
      );

      return {
        pageSize: params.pageSize ?? slice.length,
        pageNumber: params.pageNumber ?? 1,
        sortBy: params.sortBy ?? "createdAt",
        sortDirection: (params.sortDirection as "asc" | "desc") ?? "asc",
        numberOfResults: total,
        list: slice,
      };
    }

    // Sin workspaceSlug → endpoint global (si lo mantienes con paginado server-side)
    const raw = await this.repo.getList(params);
    const normalized = normalizePaginatedResponse<Conversation>(raw);

    // filtro por roles igualmente, por si acaso
    const list =
      userRoles && userRoles.length
        ? normalized.list.filter((c) => rolesIntersect(userRoles, c.roles))
        : normalized.list;

    return { ...normalized, list, numberOfResults: list.length };
  }

  async getById(id: string): Promise<Conversation> {
    return this.repo.getById(id);
  }
}
