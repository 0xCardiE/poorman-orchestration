import { BALL_RADIUS } from "../config/ball";

export type BallState = {
  radius: number;
  x: number;
  y: number;
};

export const createBallState = (position: { x: number; y: number }): BallState => ({
  x: position.x,
  y: position.y,
  radius: BALL_RADIUS
});
