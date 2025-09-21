import type { Phase } from "../interfaces/forms";
import type { ValidationResponse } from "../interfaces/validation";

export const computeNextPhase = (
  r: ValidationResponse
): Exclude<Phase, "identify" | "lopd"> =>
  r.isUser ? "login" : r.isCustomer ? "register_existing" : "register_new";

export const applyLopdGate = (
  hasLopd: boolean,
  next: Exclude<Phase, "identify" | "lopd">,
  setTargetPhaseAfterLopd: (p: Exclude<Phase, "identify" | "lopd">) => void,
  setPhase: (p: Phase) => void
) => {
  if (hasLopd === false) {
    setTargetPhaseAfterLopd(next);
    setPhase("lopd");
  } else {
    setPhase(next);
  }
};
