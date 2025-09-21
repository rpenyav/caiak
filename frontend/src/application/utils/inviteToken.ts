// src/application/utils/inviteToken.ts
export const INVITE_TOKEN_HEADER = "X-Invite-Token"; // ← cámbialo si tu backend espera otro nombre

export function getInviteToken(): string | undefined {
  try {
    return localStorage.getItem("invite_token") || undefined;
  } catch {
    return undefined;
  }
}
