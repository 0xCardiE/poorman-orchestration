import Phaser from "phaser";
import {
  BALL_FILL_COLOR,
  BALL_STROKE_COLOR,
  BALL_STROKE_WIDTH
} from "../config/ball";
import type { BallState } from "../entities/ball";

export const createBallSprite = (
  scene: Phaser.Scene,
  ball: BallState
): Phaser.GameObjects.Arc => scene.add
  .circle(ball.x, ball.y, ball.radius, BALL_FILL_COLOR)
  .setStrokeStyle(BALL_STROKE_WIDTH, BALL_STROKE_COLOR);

export const syncBallSprite = (
  sprite: Phaser.GameObjects.Arc,
  ball: BallState
): void => {
  sprite.setPosition(ball.x, ball.y);
};
