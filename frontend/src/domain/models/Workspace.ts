// src/domain/models/Workspace.ts
export interface Workspace {
  _id: string;
  slug: string;
  name: string;
  roles: string[]; // roles requeridos para ver/usar el workspace
  conversations: any[]; // placeholder (se definirá más adelante)
  createdAt: string; // ISO
  updatedAt: string; // ISO
  __v: number;
}
