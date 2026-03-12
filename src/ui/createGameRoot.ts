import { getRequiredElement } from "../utils/dom";

export const createGameRoot = (elementId: string): HTMLElement => {
  const root = getRequiredElement(elementId);
  root.innerHTML = "";
  return root;
};
