// src/ui/components/chat/Chatbot.tsx
import React, { useEffect, useRef } from "react";
import MessageBot from "./MessageBot";
import MessageHuman from "./MessageHuman";
import ChatInputArea from "./ChatInputArea";
import { useMessages } from "@/application/contexts/MessagesContext";
import { truncateText } from "@/application/utils/text";

type ChatbotProps = { mode?: "mini" | "desktop" };

const Chatbot: React.FC<ChatbotProps> = ({ mode = "desktop" }) => {
  const { state } = useMessages();
  const {
    items,
    loading,
    error,
    selectedConversationId,
    selectedConversationTitle, // 👈 lo tomamos DIRECTO del context
    streamingBotText,
  } = state;

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items.length, streamingBotText]);

  const isMini = mode === "mini";
  const rootCls = isMini ? "chatbot" : "chat-desktop";
  const headCls = isMini ? "chatbot__header" : "chat-desktop__header";
  const listCls = isMini ? "chatbot__messages" : "chat-desktop__messages";
  const footerCls = isMini ? "chatbot__footer" : "chat-desktop__footer";

  return (
    <div className={rootCls}>
      <div ref={listRef} className={listCls}>
        {!selectedConversationId && !loading && !error && (
          <div className="mini-text">
            Selecciona una conversación para empezar
          </div>
        )}
        {loading && <div className="mini-text">Cargando mensajes…</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {selectedConversationTitle && (
          <div className={headCls} title={selectedConversationTitle}>
            {truncateText(selectedConversationTitle, 60, { byWords: true })}
          </div>
        )}

        {!loading &&
          !error &&
          items.map((m) =>
            m.sender === "bot" ? (
              <MessageBot
                key={m._id}
                text={m.content}
                time={new Date(m.createdAt).toLocaleTimeString()}
              />
            ) : (
              <MessageHuman
                key={m._id}
                text={m.content}
                time={new Date(m.createdAt).toLocaleTimeString()}
              />
            )
          )}

        {streamingBotText && (
          <MessageBot text={streamingBotText} avatarEmoji="⌛" />
        )}
      </div>

      <div className={footerCls}>
        <ChatInputArea mode={mode} />
      </div>
    </div>
  );
};

export default Chatbot;
