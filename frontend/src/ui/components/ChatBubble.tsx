import type { ReactNode } from "react";

interface ChatBubbleProps {
  onClick: () => void;
}

const ChatBubble = ({ onClick }: ChatBubbleProps) => {
  return (
    <button
      className="chat-bubble btn btn-primary rounded-circle"
      onClick={onClick}
    >
      💬
    </button>
  );
};

export default ChatBubble;
