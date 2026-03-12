import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import type { MatchState } from "../entities/match";
import { getMatchResultText } from "./matchRules";

type FullTimeOverlayActions = {
  onMenu: () => void;
  onRestart: () => void;
};

export type FullTimeOverlay = {
  background: Phaser.GameObjects.Rectangle;
  menuButton: Phaser.GameObjects.Container;
  restartButton: Phaser.GameObjects.Container;
  resultText: Phaser.GameObjects.Text;
};

export const createFullTimeOverlay = (
  scene: Phaser.Scene,
  actions: FullTimeOverlayActions
): FullTimeOverlay => {
  const background = scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    420,
    220,
    0x10281a,
    0.94
  ).setStrokeStyle(2, 0xf4f1de, 0.35).setDepth(10).setVisible(false);

  const resultText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "", {
    align: "center",
    color: "#f4f1de",
    fontFamily: "Trebuchet MS",
    fontSize: "28px",
    fontStyle: "bold"
  }).setDepth(11).setOrigin(0.5);

  const restartButton = createOverlayButton(
    scene,
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 + 56,
    "Restart Match",
    actions.onRestart
  );
  const menuButton = createOverlayButton(
    scene,
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 + 122,
    "Main Menu",
    actions.onMenu
  );

  return {
    background,
    menuButton,
    restartButton,
    resultText
  };
};

export const hideFullTimeOverlay = (overlay: FullTimeOverlay): void => {
  overlay.resultText.setText("");
  setFullTimeOverlayVisible(overlay, false);
};

export const showFullTimeOverlay = (
  overlay: FullTimeOverlay,
  match: MatchState
): void => {
  overlay.resultText.setText(
    `${getMatchResultText(match)}\nFinal Score ${match.playerScore} - ${match.opponentScore}\nPress Enter or R to restart`
  );
  setFullTimeOverlayVisible(overlay, true);
};

const createOverlayButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onPress: () => void
): Phaser.GameObjects.Container => {
  const background = scene.add.rectangle(0, 0, 220, 48, 0xf4f1de);
  const text = scene.add.text(0, 0, label, {
    color: "#123524",
    fontFamily: "Trebuchet MS",
    fontSize: "22px",
    fontStyle: "bold"
  }).setOrigin(0.5);

  const button = scene.add.container(x, y, [background, text])
    .setDepth(11)
    .setSize(220, 48)
    .setVisible(false);

  button.setInteractive({ useHandCursor: true });
  button.on("pointerup", onPress);

  return button;
};

const setFullTimeOverlayVisible = (
  overlay: FullTimeOverlay,
  visible: boolean
): void => {
  overlay.background.setVisible(visible);
  overlay.resultText.setVisible(visible);
  overlay.restartButton.setVisible(visible);
  overlay.menuButton.setVisible(visible);

  if (overlay.restartButton.input) {
    overlay.restartButton.input.enabled = visible;
  }

  if (overlay.menuButton.input) {
    overlay.menuButton.input.enabled = visible;
  }
};
