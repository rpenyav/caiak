// src/application/contexts/MessagesContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import type { Message } from "@/domain/models/Message";
import { MessageService } from "@/application/services/MessageService";

const PERSIST_KEY = "caiak:lastConversation";

type MessagesState = {
  selectedConversationId: string | null;
  selectedWorkspaceSlug: string | null;
  selectedConversationTitle: string | null;

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

export const MessagesProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<MessagesState>({
    selectedConversationId: null,
    selectedWorkspaceSlug: null,
    selectedConversationTitle: null,

    loading: false,
    error: null,
    items: [],

    streamingBotText: null,
    streamingSuggestTicket: false,
  });

  const service = useMemo(() => new MessageService(), []);
  const cancelRef = useRef<null | (() => void)>(null);
  const hydratedRef = useRef(false);

  const openConversation = useCallback(
    async (
      conversationId: string,
      workspaceSlug?: string,
      conversationTitle?: string
    ) => {
      // Persistimos inmediatamente la selección
      try {
        localStorage.setItem(
          PERSIST_KEY,
          JSON.stringify({
            id: conversationId,
            slug: workspaceSlug ?? null,
            title: conversationTitle ?? null,
          })
        );
      } catch {}

      setState((s) => ({
        ...s,
        selectedConversationId: conversationId,
        selectedWorkspaceSlug: workspaceSlug ?? null,
        selectedConversationTitle: conversationTitle ?? null,
        loading: true,
        error: null,
        streamingBotText: null,
        streamingSuggestTicket: false,
      }));

      try {
        const list = await service.getForConversation(
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
        }));
      } catch (e: any) {
        // si falla, limpiamos la persistencia para no quedar en bucle
        try {
          localStorage.removeItem(PERSIST_KEY);
        } catch {}
        setState((s) => ({
          ...s,
          items: [],
          loading: false,
          error: e?.message ?? "Error al cargar mensajes",
        }));
      }
    },
    [service]
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(PERSIST_KEY);
    } catch {}
    setState({
      selectedConversationId: null,
      selectedWorkspaceSlug: null,
      selectedConversationTitle: null,

      loading: false,
      error: null,
      items: [],

      streamingBotText: null,
      streamingSuggestTicket: false,
    });
  }, []);

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

  const sendMessage = useCallback(
    async (content: string, fileUrls?: string[]) => {
      const cid = state.selectedConversationId;
      const wslug = state.selectedWorkspaceSlug ?? undefined;
      if (!cid) return;

      // 1) mensaje humano optimista
      const tempId = `local-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const optimistic: Message = {
        _id: tempId,
        conversationId: cid,
        content,
        userId: "me",
        workspaceSlug: wslug ?? "",
        type: "text",
        sender: "human",
        createdAt,
      };
      setState((s) => ({ ...s, items: [...s.items, optimistic] }));

      // 2) dispara SSE
      cancelRef.current = await service.sendWithStream(
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
              if (!final) {
                return {
                  ...s,
                  streamingBotText: null,
                  streamingSuggestTicket: false,
                };
              }
              const botMsg: Message = {
                _id: `bot-${Date.now()}`,
                conversationId: cid,
                content: final,
                userId: "bot",
                workspaceSlug: wslug ?? "",
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
              error: err?.message || "Error recibiendo la respuesta del bot",
            }));
            cancelRef.current = null;
          },
        }
      );
    },
    [service, state.selectedConversationId, state.selectedWorkspaceSlug]
  );

  // 🔄 Re-hidratar al montar: abrir la última conversación persistida
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        id?: string;
        slug?: string | null;
        title?: string | null;
      };
      if (parsed?.id) {
        void openConversation(
          parsed.id,
          parsed.slug ?? undefined,
          parsed.title ?? undefined
        );
      }
    } catch (e) {
      // si hay JSON corrupto, limpiamos y seguimos
      try {
        localStorage.removeItem(PERSIST_KEY);
      } catch {}
    }
  }, [openConversation]);

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
