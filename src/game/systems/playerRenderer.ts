import Phaser from "phaser";
import {
  PLAYER_FILL_COLOR,
  PLAYER_STROKE_COLOR,
  PLAYER_STROKE_WIDTH
} from "../config/player";
import type { PlayerState } from "../entities/player";

export const createPlayerSprite = (
  scene: Phaser.Scene,
  player: PlayerState
): Phaser.GameObjects.Arc => scene.add
  .circle(player.x, player.y, player.radius, PLAYER_FILL_COLOR)
  .setStrokeStyle(PLAYER_STROKE_WIDTH, PLAYER_STROKE_COLOR);

export const syncPlayerSprite = (
  sprite: Phaser.GameObjects.Arc,
  player: PlayerState
): void => {
  sprite.setPosition(player.x, player.y);
};
