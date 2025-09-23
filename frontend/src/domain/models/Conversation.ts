export interface Conversation {
  _id: string;
  name: string;
  roles: string[];
  workspaceSlug: string;
  messages?: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type CreateConversationPayload = {
  name: string;
  roles: string[];
  workspaceSlug: string;
};
