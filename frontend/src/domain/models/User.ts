// src/domain/models/User.ts
export interface User {
  _id: string;
  email: string;
  roles: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;
}
