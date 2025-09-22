// src/ui/components/chat/Chatbot.tsx
import React, { useEffect, useRef } from "react";
import MessageBot from "./MessageBot";
import MessageHuman from "./MessageHuman";
import ChatInputArea from "./ChatInputArea";

type ChatbotProps = { mode?: "mini" | "desktop" };

const Chatbot: React.FC<ChatbotProps> = ({ mode = "desktop" }) => {
  const messages = [
    {
      id: "1",
      type: "bot",
      text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?",
      time: "09:41",
    },
    {
      id: "2",
      type: "bot",
      text: "Claro. Déjame comprobar el estado…",
      time: "09:42",
    },
    {
      id: "3",
      type: "human",
      text: "Necesito información sobre el pedido #1234.",
      time: "09:42",
    },
    { id: "4", type: "human", text: "¡Gracias!", time: "09:43" },
  ];

  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className={mode === "mini" ? "chatbot" : "chat-desktop"}>
      <div
        ref={listRef}
        className={
          mode === "mini" ? "chatbot__messages" : "chat-desktop__messages"
        }
      >
        {messages.map((m) =>
          m.type === "bot" ? (
            <MessageBot key={m.id} text={m.text} time={m.time} />
          ) : (
            <MessageHuman key={m.id} text={m.text} time={m.time} />
          )
        )}
      </div>

      <div
        className={mode === "mini" ? "chatbot__footer" : "chat-desktop__footer"}
      >
        <ChatInputArea mode={mode} />
      </div>
    </div>
  );
};

export default Chatbot;
