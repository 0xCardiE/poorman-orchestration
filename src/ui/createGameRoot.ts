import { getRequiredElement } from "../utils/dom";

export const createGameRoot = (elementId: string): HTMLElement => {
  const root = getRequiredElement(elementId);
  root.innerHTML = "";

  const gameShell = document.createElement("div");
  gameShell.className = "game-shell";
  root.append(gameShell);

  return gameShell;
};
