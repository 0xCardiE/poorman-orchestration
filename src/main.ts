import { createGameRoot, updateGameRootStatus } from "./ui/createGameRoot";
import "./styles.css";

const container = createGameRoot("app");

const waitForFirstPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
};

const bootGame = async (): Promise<void> => {
  try {
    await waitForFirstPaint();

    const { startGame } = await import("./game/startGame");

    updateGameRootStatus(container, "Starting match...");
    startGame(container);
    updateGameRootStatus(container, null);
  } catch (error) {
    console.error("Failed to boot the game", error);
    updateGameRootStatus(container, "Game failed to load. Refresh to try again.");
  }
};

void bootGame();
