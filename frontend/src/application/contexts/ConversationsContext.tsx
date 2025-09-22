// src/application/context/ConversationsContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type {
  Conversation,
  CreateConversationPayload,
} from "@/domain/models/Conversation";
import type { PageRequest, SortDirection } from "@/domain/models/Pagination";
import { ConversationService } from "@/application/services/ConversationService";
import { useUser } from "./UserContext";

type WorkspaceConvState = {
  items: Conversation[];
  loading: boolean;
  error: string | null;
  expanded: boolean;

  // paginación/orden
  pageSize: number;
  pageNumber: number;
  sortBy: string;
  sortDirection: SortDirection;

  // visibles tras filtro
  totalVisible: number;
};

type ConversationsContextValue = {
  stateByWorkspace: Record<string, WorkspaceConvState>;
  toggleWorkspace: (workspaceSlug: string) => Promise<void>;
  refreshWorkspace: (workspaceSlug: string) => Promise<void>;
  createConversation: (
    payload: CreateConversationPayload
  ) => Promise<Conversation>;
  setWorkspacePage: (workspaceSlug: string, page: number) => Promise<void>;
  setWorkspacePageSize: (
    workspaceSlug: string,
    pageSize: number
  ) => Promise<void>;
  setWorkspaceSort: (
    workspaceSlug: string,
    sortBy: string,
    dir: SortDirection
  ) => Promise<void>;
};

const ConversationsContext = createContext<
  ConversationsContextValue | undefined
>(undefined);

export const ConversationsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useUser();
  const [stateByWorkspace, setStateByWorkspace] = useState<
    Record<string, WorkspaceConvState>
  >({});

  // staleness por workspace
  const [lastFetchedAtByWs, setLastFetchedAtByWs] = useState<
    Record<string, number>
  >({});
  const MIN_MS_BETWEEN_REFRESH = 60_000; // 60s

  const service = useMemo(() => new ConversationService(), []);

  const ensureWorkspace = useCallback((slug: string) => {
    setStateByWorkspace((prev) => {
      if (prev[slug]) return prev;
      return {
        ...prev,
        [slug]: {
          items: [],
          loading: false,
          error: null,
          expanded: false,
          pageSize: 10,
          pageNumber: 1,
          sortBy: "name",
          sortDirection: "asc",
          totalVisible: 0,
        },
      };
    });
  }, []);

  const loadWorkspace = useCallback(
    async (slug: string) => {
      if (!user) return;

      setStateByWorkspace((prev) => ({
        ...prev,
        [slug]: {
          ...(prev[slug] ?? {
            items: [],
            loading: false,
            error: null,
            expanded: false,
            pageSize: 10,
            pageNumber: 1,
            sortBy: "name",
            sortDirection: "asc",
            totalVisible: 0,
          }),
          loading: true,
          error: null,
        },
      }));

      // snapshot de estado para params
      const current = stateByWorkspace[slug] ?? {
        items: [],
        loading: false,
        error: null,
        expanded: false,
        pageSize: 10,
        pageNumber: 1,
        sortBy: "name",
        sortDirection: "asc",
        totalVisible: 0,
      };

      try {
        const params: PageRequest = {
          pageSize: current.pageSize,
          pageNumber: current.pageNumber,
          sortBy: current.sortBy,
          sortDirection: current.sortDirection,
        };

        const res = await service.getListForUser(params, user.roles, slug);

        setStateByWorkspace((prev) => ({
          ...prev,
          [slug]: {
            ...(prev[slug] ?? current),
            items: res.list,
            totalVisible: res.numberOfResults,
            loading: false,
            error: null,
          },
        }));
        setLastFetchedAtByWs((prev) => ({ ...prev, [slug]: Date.now() }));
      } catch (e: any) {
        setStateByWorkspace((prev) => ({
          ...prev,
          [slug]: {
            ...(prev[slug] ?? current),
            items: [],
            totalVisible: 0,
            loading: false,
            error: e?.message ?? "Error al cargar conversaciones",
          },
        }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [service, user, stateByWorkspace]
  );

  const toggleWorkspace = useCallback(
    async (slug: string) => {
      ensureWorkspace(slug);
      setStateByWorkspace((prev) => {
        const ws = prev[slug];
        if (!ws) return prev;
        return { ...prev, [slug]: { ...ws, expanded: !ws.expanded } };
      });

      const after = stateByWorkspace[slug];
      const willExpand = !(after?.expanded ?? false);
      if (willExpand) {
        await loadWorkspace(slug);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [ensureWorkspace, loadWorkspace, stateByWorkspace]
  );

  const refreshWorkspace = useCallback(
    async (slug: string) => {
      ensureWorkspace(slug);
      await loadWorkspace(slug);
    },
    [ensureWorkspace, loadWorkspace]
  );

  const createConversation = useCallback(
    async (payload: CreateConversationPayload) => {
      const created = await service.create(payload);
      const slug = created.workspaceSlug;
      ensureWorkspace(slug);
      setStateByWorkspace((prev) => {
        const ws = prev[slug];
        if (!ws) return prev;
        return {
          ...prev,
          [slug]: {
            ...ws,
            items: [created, ...ws.items],
            totalVisible: ws.totalVisible + 1,
          },
        };
      });
      setLastFetchedAtByWs((prev) => ({ ...prev, [slug]: Date.now() }));
      return created;
    },
    [service, ensureWorkspace]
  );

  const setWorkspacePage = useCallback(
    async (slug: string, page: number) => {
      ensureWorkspace(slug);
      setStateByWorkspace((prev) => {
        const ws = prev[slug];
        if (!ws) return prev;
        return { ...prev, [slug]: { ...ws, pageNumber: page } };
      });
      await loadWorkspace(slug);
    },
    [ensureWorkspace, loadWorkspace]
  );

  const setWorkspacePageSize = useCallback(
    async (slug: string, pageSize: number) => {
      ensureWorkspace(slug);
      setStateByWorkspace((prev) => {
        const ws = prev[slug];
        if (!ws) return prev;
        return { ...prev, [slug]: { ...ws, pageSize, pageNumber: 1 } };
      });
      await loadWorkspace(slug);
    },
    [ensureWorkspace, loadWorkspace]
  );

  const setWorkspaceSort = useCallback(
    async (slug: string, sortBy: string, dir: SortDirection) => {
      ensureWorkspace(slug);
      setStateByWorkspace((prev) => {
        const ws = prev[slug];
        if (!ws) return prev;
        return {
          ...prev,
          [slug]: { ...ws, sortBy, sortDirection: dir, pageNumber: 1 },
        };
      });
      await loadWorkspace(slug);
    },
    [ensureWorkspace, loadWorkspace]
  );

  // 🔁 Al volver el foco/visibilidad: refresca SOLO los workspaces expandidos, con debounce + rate-limit por workspace
  useEffect(() => {
    let t: number | undefined;

    const shouldRefetchWs = (slug: string) => {
      const last = lastFetchedAtByWs[slug] ?? 0;
      return Date.now() - last > MIN_MS_BETWEEN_REFRESH;
    };

    const debounced = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(async () => {
        if (document.visibilityState !== "visible" || !user) return;

        const expandedSlugs = Object.entries(stateByWorkspace)
          .filter(([, s]) => s.expanded)
          .map(([slug]) => slug);

        const toRefresh = expandedSlugs.filter((slug) => {
          const ws = stateByWorkspace[slug];
          if (!ws) return false;
          if (ws.loading) return false; // evita solapamiento
          return shouldRefetchWs(slug);
        });

        if (toRefresh.length > 0) {
          await Promise.all(toRefresh.map((slug) => loadWorkspace(slug)));
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
  }, [stateByWorkspace, lastFetchedAtByWs, user, loadWorkspace]);

  const value: ConversationsContextValue = {
    stateByWorkspace,
    toggleWorkspace,
    refreshWorkspace,
    createConversation,
    setWorkspacePage,
    setWorkspacePageSize,
    setWorkspaceSort,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error(
      "useConversations debe usarse dentro de <ConversationsProvider>"
    );
  }
  return ctx;
}
