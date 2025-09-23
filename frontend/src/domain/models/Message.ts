// src/domain/models/Message.ts
export type MessageSender = "human" | "bot";

export interface Message {
  _id: string;
  conversationId: string;
  content: string;
  userId: string;
  workspaceSlug: string;
  type: "text" | "file";
  sender: MessageSender;
  createdAt: string; // ISO
  fileUrls?: string[];
  suggestTicket?: boolean;
}
