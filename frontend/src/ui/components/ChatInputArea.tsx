// src/ui/components/chat/ChatInputArea.tsx
import React, { useEffect, useRef, useState } from "react";

type Props = { mode?: "mini" | "desktop" };

const ChatInputArea: React.FC<Props> = ({ mode = "desktop" }) => {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    // TODO: enviar
    setValue("");
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
        />
        <button type="submit" className={`${ns}__send`}>
          Enviar
        </button>
      </div>
    </form>
  );
};

export default ChatInputArea;
