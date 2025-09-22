// src/domain/models/Conversation.ts
export interface Conversation {
  _id: string;
  name: string;
  roles: string[];
  workspaceSlug: string;
  messages: any[]; // placeholder por ahora
  createdAt: string; // ISO
  updatedAt: string; // ISO
  __v: number;
}

export type CreateConversationPayload = {
  name: string;
  roles: string[]; // p.ej. ["user"]
  workspaceSlug: string; // slug del workspace
};
