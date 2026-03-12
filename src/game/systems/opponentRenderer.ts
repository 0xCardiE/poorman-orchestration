import Phaser from "phaser";
import {
  OPPONENT_FILL_COLOR,
  OPPONENT_STROKE_COLOR,
  OPPONENT_STROKE_WIDTH
} from "../config/opponent";
import type { OpponentState } from "../entities/opponent";

export const createOpponentSprite = (
  scene: Phaser.Scene,
  opponent: OpponentState
): Phaser.GameObjects.Arc => scene.add
  .circle(opponent.x, opponent.y, opponent.radius, OPPONENT_FILL_COLOR)
  .setStrokeStyle(OPPONENT_STROKE_WIDTH, OPPONENT_STROKE_COLOR);

export const syncOpponentSprite = (
  sprite: Phaser.GameObjects.Arc,
  opponent: OpponentState
): void => {
  sprite.setPosition(opponent.x, opponent.y);
};
