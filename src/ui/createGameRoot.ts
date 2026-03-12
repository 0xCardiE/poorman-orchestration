import { getRequiredElement } from "../utils/dom";

export const createGameRoot = (elementId: string): HTMLElement => {
  const root = getRequiredElement(elementId);
  root.innerHTML = "";

  const gameShell = document.createElement("div");
  gameShell.className = "game-shell";

  const status = document.createElement("div");
  status.className = "game-shell__status";
  status.textContent = "Loading match engine...";
  gameShell.append(status);

  root.append(gameShell);

  return gameShell;
};

export const updateGameRootStatus = (
  root: HTMLElement,
  message: string | null
): void => {
  const status = root.querySelector(".game-shell__status");

  if (!(status instanceof HTMLElement)) {
    return;
  }

  if (message === null) {
    status.remove();

    return;
  }

  status.textContent = message;
};
