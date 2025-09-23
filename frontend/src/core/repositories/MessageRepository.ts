// src/infrastructure/repositories/MessageRepository.ts
import { getStoredToken } from "@/application/utils/tokenUtils";
import type { Message } from "@/domain/models/Message";

type SendMessagePayload = {
  conversationId: string;
  content: string;
  type?: "text" | "file";
  fileUrls?: string[];
  workspaceSlug?: string;
};

type StreamHandlers = {
  onHumanSavedId?: (id: string) => void; // si el backend lo emite
  onChunk?: (chunk: string, suggestTicket: boolean) => void; // trozos del bot
  onDone?: () => void;
  onError?: (err: Error) => void;
};

export class MessageRepository {
  private readonly baseUrl: string;
  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL as string) {
    this.baseUrl = baseUrl;
  }

  async getForConversation(
    conversationId: string,
    workspaceSlug?: string
  ): Promise<Message[]> {
    const token = getStoredToken();
    const url = new URL(
      `${this.baseUrl}/messages/${encodeURIComponent(conversationId)}`
    );
    if (workspaceSlug) url.searchParams.set("workspaceSlug", workspaceSlug);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);
    }
    return (await res.json()) as Message[];
  }

  /**
   * POST /messages (SSE)
   * Enviamos el mensaje humano y recibimos el streaming del bot.
   * Soporta:
   *  - event: data: {"humanMessageId":"..."}  (si lo emitís desde backend)
   *  - data: {"content":"trozo","suggestTicket":false}
   *  - data: [DONE]
   */
  async sendWithStream(
    payload: SendMessagePayload,
    handlers: StreamHandlers
  ): Promise<() => void> {
    const token = getStoredToken();
    const url = `${this.baseUrl}/messages`;
    const body = JSON.stringify({
      conversationId: payload.conversationId,
      content: payload.content,
      type: payload.type ?? "text",
      fileUrls: payload.fileUrls ?? [],
      workspaceSlug: payload.workspaceSlug,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ← token en headers
        "Content-Type": "application/json",
        Accept: "text/event-stream", // ← pedimos SSE
      },
      body,
    });

    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Error ${res.status}`);
    }

    const reader = res.body.getReader();
    let buffer = "";

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      try {
        reader.cancel();
      } catch {}
    };

    const decode = new TextDecoder();

    // bucle de lectura del stream
    const pump = async () => {
      try {
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decode.decode(value, { stream: true });

          // procesamos mensajes separados por doble salto de línea
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            // líneas "data: ...."
            const dataLines = raw
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim())
              .join("\n");

            if (!dataLines) continue;

            if (dataLines === "[DONE]") {
              handlers.onDone?.();
              return;
            }

            // puede venir JSON o texto
            try {
              const parsed = JSON.parse(dataLines);
              if (parsed?.humanMessageId && handlers.onHumanSavedId) {
                handlers.onHumanSavedId(parsed.humanMessageId);
              } else if (
                typeof parsed?.content === "string" &&
                typeof parsed?.suggestTicket !== "undefined"
              ) {
                handlers.onChunk?.(parsed.content, !!parsed.suggestTicket);
              } else {
                // silente, por si el backend envía otros metadatos
              }
            } catch {
              // si el server emitiera texto plano como chunk (no JSON)
              handlers.onChunk?.(dataLines, false);
            }
          }
        }
        handlers.onDone?.();
      } catch (err: any) {
        if (!cancelled) handlers.onError?.(err);
      }
    };

    // lanzamos sin await para no bloquear
    pump();

    return cancel;
  }
}
