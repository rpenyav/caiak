// src/application/context/WorkspaceContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Workspace } from "@/domain/models/Workspace";
import type { PageRequest, SortDirection } from "@/domain/models/Pagination";
import { WorkspaceService } from "@/application/services/WorkspaceService";
import { useUser } from "./UserContext";

type WorkspaceContextValue = {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;

  // Paginación / orden
  pageSize: number;
  pageNumber: number;
  sortBy: string;
  sortDirection: SortDirection;

  // Para UI
  totalVisible: number;

  // Acciones
  setPage: (pageNumber: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: string, sortDirection: SortDirection) => void;
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useUser();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginado/ordenación
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [pageNumber, setPageNumberState] = useState<number>(1);
  const [sortBy, setSortByState] = useState<string>("name");
  const [sortDirection, setSortDirectionState] = useState<SortDirection>("asc");

  const [totalVisible, setTotalVisible] = useState<number>(0);

  // 🔒 locks y rate-limit con refs (no causan re-render)
  const isFetchingRef = useRef(false);
  const lastFetchedAtRef = useRef<number | null>(null);
  const MIN_MS_BETWEEN_REFRESH = 60_000; // 60s

  const service = useMemo(() => new WorkspaceService(), []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setTotalVisible(0);
      setLoading(false);
      return;
    }
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params: PageRequest = {
        pageSize,
        pageNumber,
        sortBy,
        sortDirection,
      };
      const res = await service.getWorkspacesForUser(params, user.roles);
      setWorkspaces(res.list);
      setTotalVisible(res.numberOfResults);
      lastFetchedAtRef.current = Date.now();
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar workspaces");
      setWorkspaces([]);
      setTotalVisible(0);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [service, user, pageSize, pageNumber, sortBy, sortDirection]);

  // 🚀 Carga inicial y cuando cambian user/paginación/orden
  useEffect(() => {
    void fetchData();
  }, [user, pageSize, pageNumber, sortBy, sortDirection, fetchData]);

  // 🔁 Refresh al volver el foco/visibilidad con debounce + rate-limit
  useEffect(() => {
    let t: number | undefined;

    const shouldRefetchNow = () => {
      if (isFetchingRef.current) return false;
      const last = lastFetchedAtRef.current ?? 0;
      return Date.now() - last > MIN_MS_BETWEEN_REFRESH;
    };

    const debounced = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (
          document.visibilityState === "visible" &&
          user &&
          shouldRefetchNow()
        ) {
          void fetchData();
        }
      }, 150);
    };

    const onFocus = debounced;
    const onVisibility = () => {
      if (document.visibilityState === "visible") debounced();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (t) window.clearTimeout(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchData, user]);

  const setPage = useCallback((nextPage: number) => {
    setPageNumberState(nextPage);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    setPageSizeState(nextSize);
    setPageNumberState(1); // reset a la primera página si cambia el tamaño
  }, []);

  const setSort = useCallback(
    (nextSortBy: string, nextDirection: SortDirection) => {
      setSortByState(nextSortBy);
      setSortDirectionState(nextDirection);
      setPageNumberState(1);
    },
    []
  );

  const refresh = useCallback(async () => {
    // fuerza ignorar rate-limit
    lastFetchedAtRef.current = 0;
    await fetchData();
  }, [fetchData]);

  const value: WorkspaceContextValue = {
    workspaces,
    loading,
    error,
    pageSize,
    pageNumber,
    sortBy,
    sortDirection,
    totalVisible,
    setPage,
    setPageSize,
    setSort,
    refresh,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspaces(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaces debe usarse dentro de <WorkspaceProvider>");
  }
  return ctx;
}
