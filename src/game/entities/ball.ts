import { BALL_RADIUS } from "../config/ball";

export type BallState = {
  radius: number;
  velocityX: number;
  velocityY: number;
  x: number;
  y: number;
};

export const createBallState = (position: { x: number; y: number }): BallState => ({
  velocityX: 0,
  velocityY: 0,
  x: position.x,
  y: position.y,
  radius: BALL_RADIUS
});
