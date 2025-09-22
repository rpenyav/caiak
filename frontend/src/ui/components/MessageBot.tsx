import React from "react";

type MessageBotProps = {
  text: string;
  time?: string;
  avatarEmoji?: string; // opcional (por defecto 🤖)
};

const MessageBot: React.FC<MessageBotProps> = ({
  text,
  time,
  avatarEmoji = "🤖",
}) => {
  return (
    <div className="msg msg--bot">
      <div className="msg__avatar" aria-hidden>
        {avatarEmoji}
      </div>
      <div className="msg__bubble">
        <p className="msg__text">{text}</p>
        {time && <span className="msg__time">{time}</span>}
      </div>
    </div>
  );
};

export default MessageBot;
