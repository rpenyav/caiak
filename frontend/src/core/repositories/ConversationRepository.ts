import type {
  Conversation,
  CreateConversationPayload,
} from "@/domain/models/Conversation";
import type {
  PageRequest,
  PaginatedResponse,
} from "@/domain/models/Pagination";
import { fetchWithAuth } from "../api/api";

export class ConversationRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL as string) {
    this.baseUrl = baseUrl;
  }

  async create(payload: CreateConversationPayload): Promise<Conversation> {
    const url = `${this.baseUrl}/conversations`;
    const body = JSON.stringify(payload);
    const created = await fetchWithAuth(url, { method: "POST", body });
    return created as Conversation;
  }

  /** Lista global (si tu backend la mantiene con paginado por query) */
  async getList(params: PageRequest): Promise<PaginatedResponse<Conversation>> {
    const url = new URL(`${this.baseUrl}/conversations`);

    // Si tu backend ya NO acepta paginado global, puedes eliminar estas 4 líneas
    if (params.pageSize != null)
      url.searchParams.set(
        "pageSize",
        String(Math.max(1, Number(params.pageSize)))
      );
    if (params.pageNumber != null)
      url.searchParams.set(
        "pageNumber",
        String(Math.max(1, Number(params.pageNumber)))
      );
    if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
    if (params.sortDirection)
      url.searchParams.set("sortDirection", params.sortDirection);

    const raw = await fetchWithAuth(url.toString(), { method: "GET" });
    return raw as PaginatedResponse<Conversation>;
  }

  /** Lista por workspace para el usuario autenticado (user sale del token en backend) */
  async getByWorkspace(workspaceSlug: string): Promise<Conversation[]> {
    const url = `${this.baseUrl}/conversations/workspace/${encodeURIComponent(
      workspaceSlug
    )}`;
    const list = await fetchWithAuth(url, { method: "GET" });
    return list as Conversation[];
  }

  async getById(id: string): Promise<Conversation> {
    const url = `${this.baseUrl}/conversations/${encodeURIComponent(id)}`;
    const item = await fetchWithAuth(url, { method: "GET" });
    return item as Conversation;
  }
}
