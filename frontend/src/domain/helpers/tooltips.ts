import type { Phase } from "@/infrastructure/types";

// src/domain/helpers/tooltip.ts (o donde lo tengas)
export const tooltipKeyByPhase = (phase: Phase) => {
  const map: Record<Phase, string> = {
    identify: "login.tooltip.unknown",
    login: "login.tooltip.client_and_user",
    register_existing: "login.tooltip.client_only",
    register_new: "login.tooltip.not_found",
    lopd: "login.tooltip.lopd",
    create_user_prompt: "login.tooltip.create_user_prompt", // 👈 nueva key
  };
  return map[phase] ?? "login.tooltip.unknown";
};
