import Phaser from "phaser";
import { MatchScene } from "../scenes/MatchScene";
import { GAME_HEIGHT, GAME_WIDTH } from "./dimensions";

export const createGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent,
  backgroundColor: "#0b2c18",
  scene: [MatchScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});
