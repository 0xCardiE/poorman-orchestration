import Phaser from "phaser";
import { createGameConfig } from "./config/gameConfig";

export const startGame = (parent: HTMLElement): Phaser.Game => {
  return new Phaser.Game(createGameConfig(parent));
};
