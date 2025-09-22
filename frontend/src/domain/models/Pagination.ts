// src/domain/models/Pagination.ts
export type SortDirection = "asc" | "desc";

export interface PageRequest {
  pageSize: number;
  pageNumber: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  sortBy: string;
  sortDirection: SortDirection;
  numberOfResults: number;
  list: T[];
}

/**
 * Normaliza la respuesta de paginado cuando el backend devuelve ciertos
 * campos como string (p.ej. "2", "1").
 */
export function normalizePaginatedResponse<T>(raw: any): PaginatedResponse<T> {
  return {
    pageSize:
      typeof raw?.pageSize === "string"
        ? parseInt(raw.pageSize, 10)
        : Number(raw?.pageSize ?? 0),
    pageNumber:
      typeof raw?.pageNumber === "string"
        ? parseInt(raw.pageNumber, 10)
        : Number(raw?.pageNumber ?? 0),
    sortBy: String(raw?.sortBy ?? ""),
    sortDirection: (raw?.sortDirection === "desc"
      ? "desc"
      : "asc") as SortDirection,
    numberOfResults: Number(raw?.numberOfResults ?? 0),
    list: Array.isArray(raw?.list) ? (raw.list as T[]) : [],
  };
}
