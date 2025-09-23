// src/application/contexts/MessagesContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Message } from "@/domain/models/Message";
import { MessageService } from "@/application/services/MessageService";
import { WorkspaceService } from "@/application/services/WorkspaceService";
import { ConversationService } from "@/application/services/ConversationService";
import { useUser } from "./UserContext";

type MessagesState = {
  selectedConversationId: string | null;
  selectedConversationTitle: string | null;
  selectedWorkspaceSlug: string | null;

  loading: boolean;
  error: string | null;
  items: Message[];

  // streaming del bot (respuesta parcial)
  streamingBotText: string | null;
  streamingSuggestTicket: boolean;
};

type MessagesContextValue = {
  state: MessagesState;
  openConversation: (
    conversationId: string,
    workspaceSlug?: string,
    conversationTitle?: string
  ) => Promise<void>;
  clear: () => void;
  appendLocal: (msg: Message) => void;

  sendMessage: (content: string, fileUrls?: string[]) => Promise<void>;
  cancelStream: () => void;
};

const MessagesContext = createContext<MessagesContextValue | undefined>(
  undefined
);

const LS = {
  lastConvId: "caiak:lastConversationId",
  lastConvTitle: "caiak:lastConversationTitle",
  lastWs: "caiak:lastWorkspaceSlug",
};

export const MessagesProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useUser();

  const [state, setState] = useState<MessagesState>({
    selectedConversationId: null,
    selectedConversationTitle: null,
    selectedWorkspaceSlug: null,

    loading: false,
    error: null,
    items: [],

    streamingBotText: null,
    streamingSuggestTicket: false,
  });

  const messageService = useMemo(() => new MessageService(), []);
  const workspaceService = useMemo(() => new WorkspaceService(), []);
  const conversationService = useMemo(() => new ConversationService(), []);
  const cancelRef = useRef<null | (() => void)>(null);

  // ---- helpers de persistencia ----
  const persistSelection = useCallback(
    (
      conversationId: string | null,
      conversationTitle: string | null,
      ws?: string | null
    ) => {
      if (conversationId) localStorage.setItem(LS.lastConvId, conversationId);
      else localStorage.removeItem(LS.lastConvId);

      if (conversationTitle)
        localStorage.setItem(LS.lastConvTitle, conversationTitle);
      else localStorage.removeItem(LS.lastConvTitle);

      if (ws) localStorage.setItem(LS.lastWs, ws);
    },
    []
  );

  // ---- abrir conversación existente ----
  const openConversation = useCallback(
    async (
      conversationId: string,
      workspaceSlug?: string,
      conversationTitle?: string
    ) => {
      setState((s) => ({
        ...s,
        selectedConversationId: conversationId,
        selectedConversationTitle:
          conversationTitle ?? s.selectedConversationTitle,
        selectedWorkspaceSlug: workspaceSlug ?? s.selectedWorkspaceSlug,
        loading: true,
        error: null,
        streamingBotText: null,
        streamingSuggestTicket: false,
      }));

      try {
        const list = await messageService.getForConversation(
          conversationId,
          workspaceSlug
        );
        list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setState((s) => ({
          ...s,
          items: list,
          loading: false,
          error: null,
          selectedConversationId: conversationId,
          selectedConversationTitle:
            conversationTitle ?? s.selectedConversationTitle,
          selectedWorkspaceSlug: workspaceSlug ?? s.selectedWorkspaceSlug,
        }));

        // persistimos selección
        persistSelection(
          conversationId,
          conversationTitle ?? null,
          workspaceSlug ?? null
        );
      } catch (e: any) {
        setState((s) => ({
          ...s,
          items: [],
          loading: false,
          error: e?.message ?? "Error al cargar mensajes",
        }));
      }
    },
    [messageService, persistSelection]
  );

  const clear = useCallback(() => {
    setState({
      selectedConversationId: null,
      selectedConversationTitle: null,
      selectedWorkspaceSlug: null,

      loading: false,
      error: null,
      items: [],

      streamingBotText: null,
      streamingSuggestTicket: false,
    });
    persistSelection(null, null, null);
  }, [persistSelection]);

  const appendLocal = useCallback((msg: Message) => {
    setState((s) => ({ ...s, items: [...s.items, msg] }));
  }, []);

  const cancelStream = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setState((s) => ({
      ...s,
      streamingBotText: null,
      streamingSuggestTicket: false,
    }));
  }, []);

  // ---- crea conversación si hace falta (al enviar sin selección) ----
  const ensureConversationForInput = useCallback(async (): Promise<{
    conversationId: string;
    workspaceSlug: string;
    conversationTitle: string;
  }> => {
    // si ya hay selección → ok
    if (state.selectedConversationId && state.selectedWorkspaceSlug) {
      return {
        conversationId: state.selectedConversationId,
        workspaceSlug: state.selectedWorkspaceSlug,
        conversationTitle: state.selectedConversationTitle ?? "Conversación",
      };
    }

    // 1) workspace preferido
    let wsSlug =
      state.selectedWorkspaceSlug || localStorage.getItem(LS.lastWs) || null;

    if (!wsSlug) {
      // 2) último workspace creado
      const latest = await workspaceService.getLatestWorkspace();
      wsSlug = latest?.slug ?? null;
    }

    if (!wsSlug) {
      // No hay workspaces → que la UI abra modal de creación
      const err: any = new Error("No hay workspaces disponibles");
      err.code = "NO_WORKSPACE";
      throw err;
    }

    // 3) crear conversación con nombre base
    const roles = user?.roles ?? []; // para payload, si el backend los requiere
    const created = await conversationService.create({
      name: "Nueva conversación",
      roles,
      workspaceSlug: wsSlug,
    });

    // título con id para la UI (si luego quieres persistir el rename, añadimos PATCH)
    const title = `Nueva conversación ${created._id}`;

    // marcamos selección y guardamos en LS
    setState((s) => ({
      ...s,
      selectedConversationId: created._id,
      selectedConversationTitle: title,
      selectedWorkspaceSlug: wsSlug,
    }));
    persistSelection(created._id, title, wsSlug);

    return {
      conversationId: created._id,
      workspaceSlug: wsSlug,
      conversationTitle: title,
    };
  }, [
    state.selectedConversationId,
    state.selectedWorkspaceSlug,
    user?.roles,
    workspaceService,
    conversationService,
    persistSelection,
  ]);

  // ---- enviar mensaje (crea conversación si no la hay) + streaming ----
  const sendMessage = useCallback(
    async (content: string, fileUrls?: string[]) => {
      // crea conversacion si hace falta
      const { conversationId: cid, workspaceSlug: wslug } =
        await ensureConversationForInput();

      // mensaje humano optimista
      const tempId = `local-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const optimistic: Message = {
        _id: tempId,
        conversationId: cid,
        content,
        userId: "me",
        workspaceSlug: wslug,
        type: "text",
        sender: "human",
        createdAt,
      };
      setState((s) => ({ ...s, items: [...s.items, optimistic] }));

      // streaming
      cancelRef.current = await messageService.sendWithStream(
        { conversationId: cid, content, workspaceSlug: wslug, fileUrls },
        {
          onHumanSavedId: (id) => {
            setState((s) => ({
              ...s,
              items: s.items.map((m) =>
                m._id === tempId ? { ...m, _id: id } : m
              ),
            }));
          },
          onChunk: (chunk, suggestTicket) => {
            setState((s) => ({
              ...s,
              streamingBotText: (s.streamingBotText ?? "") + chunk,
              streamingSuggestTicket: suggestTicket,
            }));
          },
          onDone: () => {
            setState((s) => {
              const final = s.streamingBotText ?? "";
              if (!final)
                return {
                  ...s,
                  streamingBotText: null,
                  streamingSuggestTicket: false,
                };
              const botMsg: Message = {
                _id: `bot-${Date.now()}`,
                conversationId: cid,
                content: final,
                userId: "bot",
                workspaceSlug: wslug,
                type: "text",
                sender: "bot",
                createdAt: new Date().toISOString(),
                suggestTicket: s.streamingSuggestTicket,
              };
              return {
                ...s,
                items: [...s.items, botMsg],
                streamingBotText: null,
                streamingSuggestTicket: false,
              };
            });
            cancelRef.current = null;
          },
          onError: (err) => {
            console.error("SSE error:", err);
            setState((s) => ({
              ...s,
              streamingBotText: null,
              streamingSuggestTicket: false,
              error: err.message || "Error recibiendo la respuesta del bot",
            }));
            cancelRef.current = null;
          },
        }
      );
    },
    [ensureConversationForInput, messageService]
  );

  const value: MessagesContextValue = {
    state,
    openConversation,
    clear,
    appendLocal,
    sendMessage,
    cancelStream,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};

export function useMessages(): MessagesContextValue {
  const ctx = useContext(MessagesContext);
  if (!ctx)
    throw new Error("useMessages debe usarse dentro de <MessagesProvider>");
  return ctx;
}
