// src/ui/components/chat/ChatInputArea.tsx
import React, { useEffect, useRef, useState } from "react";
import { useMessages } from "@/application/contexts/MessagesContext";

type Props = { mode?: "mini" | "desktop" };

const ChatInputArea: React.FC<Props> = ({ mode = "desktop" }) => {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const { state, sendMessage } = useMessages();

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || !state.selectedConversationId) return;
    await sendMessage(text);
    setValue("");
  };

  const ns = mode === "mini" ? "chat-input" : "chat-desktop-input";
  const disabled = !state.selectedConversationId;

  return (
    <form className={ns} onSubmit={onSubmit}>
      <div className={`${ns}__inner`}>
        <textarea
          ref={taRef}
          className={`${ns}__textarea`}
          rows={1}
          placeholder={
            disabled ? "Selecciona una conversación…" : "Escribe un mensaje…"
          }
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="submit"
          className={`${ns}__send`}
          disabled={disabled || !value.trim()}
        >
          Enviar
        </button>
      </div>
    </form>
  );
};

export default ChatInputArea;
