// src/ui/components/chat/ChatInputArea.tsx
import React, { useEffect, useRef, useState } from "react";
import { useMessages } from "@/application/contexts/MessagesContext";

type Props = { mode?: "mini" | "desktop" };

const ChatInputArea: React.FC<Props> = ({ mode = "desktop" }) => {
  const { sendMessage } = useMessages();
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const isComposingRef = useRef(false); // evita enviar mientras se usa IME

  const MAX_HEIGHT = 200;

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const over = el.scrollHeight > MAX_HEIGHT;
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
    el.style.overflowY = over ? "auto" : "hidden";
  }, [value]);

  const doSend = async () => {
    const text = value.trim();
    if (!text) return;
    await sendMessage(text);
    setValue("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSend();
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
      // Enter = enviar, Shift+Enter = salto de línea
      e.preventDefault();
      await doSend();
    }
  };

  const ns = mode === "mini" ? "chat-input" : "chat-desktop-input";

  return (
    <form className={ns} onSubmit={onSubmit}>
      <div className={`${ns}__inner`}>
        <textarea
          ref={taRef}
          className={`${ns}__textarea`}
          rows={1}
          placeholder="Escribe un mensaje…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => (isComposingRef.current = true)}
          onCompositionEnd={() => (isComposingRef.current = false)}
          enterKeyHint="send" // teclados móviles muestran “Enviar”
        />
        <button type="submit" className={`${ns}__send`}>
          Enviar
        </button>
      </div>
    </form>
  );
};

export default ChatInputArea;
