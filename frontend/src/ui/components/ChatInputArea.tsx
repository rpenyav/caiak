import React, { useEffect, useRef, useState, useMemo } from "react";
import { useMessages } from "@/application/contexts/MessagesContext";
import { useWorkspaces } from "@/application/contexts/WorkspaceContext";
import { useUser } from "@/application/contexts/UserContext";
import { ConversationService } from "@/application/services/ConversationService";
import WorkspaceCreateModal from "./WorkspaceCreateModal";
import { truncateText } from "@/application/utils/text";

type Props = { mode?: "mini" | "desktop" };

const LAST_WS_KEY = "caiak:lastWorkspaceSlug";

const ChatInputArea: React.FC<Props> = ({ mode = "desktop" }) => {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const { state: msgState, openConversation, sendMessage } = useMessages();
  const { workspaces, refresh: refreshWorkspaces } = useWorkspaces();
  const { user } = useUser();

  const ns = mode === "mini" ? "chat-input" : "chat-desktop-input";

  // MODAL
  const [showWsModal, setShowWsModal] = useState(false);
  const [pendingToSend, setPendingToSend] = useState<string | null>(null);

  // autosize básico
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  const getPreferredWorkspaceSlug = useMemo(() => {
    return () => {
      // 1) localStorage
      const stored = (localStorage.getItem(LAST_WS_KEY) || "").trim();
      if (stored && workspaces.some((w) => w.slug === stored)) {
        return stored;
      }
      // 2) último por createdAt (si lo tenemos en el objeto)
      const copy = [...workspaces];
      copy.sort((a: any, b: any) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta; // desc
      });
      if (copy.length > 0) {
        return copy[0].slug;
      }
      // 3) no hay
      return null;
    };
  }, [workspaces]);

  const ensureConversationAndSend = async (text: string) => {
    // Si ya hay conversación → enviar normal
    if (msgState.selectedConversationId) {
      await sendMessage(text);
      setValue("");
      return;
    }

    // No hay conversación: necesitamos workspace
    let slug = getPreferredWorkspaceSlug();
    if (!slug) {
      // no hay workspaces → modal
      setPendingToSend(text);
      setShowWsModal(true);
      return;
    }

    // Crear conversación y luego enviar
    const convSvc = new ConversationService();
    const convName = truncateText(text || "Nueva conversación", 60, {
      byWords: true,
    });
    const roles = user?.roles || [];

    const conv = await convSvc.createConversation({
      name: convName,
      workspaceSlug: slug,
      roles, // opcional
    });

    // persistimos "último workspace usado"
    try {
      localStorage.setItem(LAST_WS_KEY, slug);
    } catch {}

    // abrimos y luego enviamos
    await openConversation(conv._id, slug, conv.name);
    await sendMessage(text);
    setValue("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    try {
      await ensureConversationAndSend(text);
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  // callback cuando el modal crea un workspace
  const handleWorkspaceCreated = async (createdSlug: string) => {
    // guarda y refresca lista
    try {
      localStorage.setItem(LAST_WS_KEY, createdSlug);
    } catch {}
    await refreshWorkspaces();

    // si había texto pendiente, crea conversación nueva y envíalo
    if (pendingToSend) {
      const convSvc = new ConversationService();
      const convName = truncateText(pendingToSend || "Nueva conversación", 60, {
        byWords: true,
      });
      const roles = user?.roles || [];
      const conv = await convSvc.createConversation({
        name: convName,
        workspaceSlug: createdSlug,
        roles,
      });
      await openConversation(conv._id, createdSlug, conv.name);
      await sendMessage(pendingToSend);
      setPendingToSend(null);
      setValue("");
    }
  };

  return (
    <>
      <form className={ns} onSubmit={onSubmit}>
        <div className={`${ns}__inner`}>
          <textarea
            ref={taRef}
            className={`${ns}__textarea`}
            rows={1}
            placeholder="Escribe un mensaje…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className={`${ns}__send`}>
            Enviar
          </button>
        </div>
      </form>

      {/* Modal crear workspace si hace falta */}
      <WorkspaceCreateModal
        open={showWsModal}
        onClose={() => {
          setShowWsModal(false);
          setPendingToSend(null);
        }}
        onCreated={handleWorkspaceCreated}
      />
    </>
  );
};

export default ChatInputArea;
