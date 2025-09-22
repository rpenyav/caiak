import React from "react";

type MessageHumanProps = {
  text: string;
  time?: string;
  avatarEmoji?: string; // opcional (por defecto 🙂)
};

const MessageHuman: React.FC<MessageHumanProps> = ({
  text,
  time,
  avatarEmoji = "🙂",
}) => {
  return (
    <div className="msg msg--human">
      <div className="msg__bubble">
        <p className="msg__text">{text}</p>
        {time && <span className="msg__time">{time}</span>}
      </div>
      <div className="msg__avatar" aria-hidden>
        {avatarEmoji}
      </div>
    </div>
  );
};

export default MessageHuman;
