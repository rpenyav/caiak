import type { ReactNode } from "react";
import Header from "./Header";
import HeaderMini from "./HeaderMini";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";
const chatMiniWidth = Number(import.meta.env.VITE_CHAT_MINI_WIDTH);
const chatMiniHeight = Number(import.meta.env.VITE_CHAT_MINI_HEIGHT);

interface CCProps {
  children: ReactNode;
  onMinimize?: () => void;
  onClose?: () => void;
}

const ChatMiniContainer = ({ children, onMinimize, onClose }: CCProps) => {
  const miniStyle =
    chatMode === "mini"
      ? { width: `${chatMiniWidth}px`, height: `${chatMiniHeight}px` }
      : {};

  return (
    <div
      className={`chat-container ${
        chatMode === "mini" ? "chat-mini" : "chat-desktop"
      }`}
      style={miniStyle}
    >
      <HeaderMini mode={chatMode} onMinimize={onMinimize} onClose={onClose} />

      <div className="chat-content p-3 flex-grow-1">{children}</div>
    </div>
  );
};

export default ChatMiniContainer;
