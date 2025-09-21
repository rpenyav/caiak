import type { ReactNode } from "react";

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
      <div className="chat-header bg-primary text-white text-center py-2 d-flex justify-content-between align-items-center">
        <span>Chat {chatMode === "mini" ? "Mini" : "Desktop"}</span>
        {chatMode === "mini" && (
          <div>
            <button
              className="btn btn-sm btn-light me-2 chat-minimize"
              onClick={onMinimize}
            >
              —
            </button>
            <button
              className="btn btn-sm btn-danger chat-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <div className="chat-content p-3 flex-grow-1">{children}</div>
    </div>
  );
};

export default ChatMiniContainer;
