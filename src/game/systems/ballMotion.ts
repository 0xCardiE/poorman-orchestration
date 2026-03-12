import {
  BALL_DRAG,
  BALL_PASS_SPEED,
  BALL_SHOT_SPEED,
  BALL_STOP_SPEED
} from "../config/ball";
import { PITCH_BOUNDS } from "../config/pitch";
import type { BallState } from "../entities/ball";
import type { FacingDirection } from "../entities/player";
import type { MovementBounds } from "./playerMovement";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getBallSpeed = (ball: BallState): number =>
  Math.hypot(ball.velocityX, ball.velocityY);

export const kickBall = (
  ball: BallState,
  direction: FacingDirection,
  speed: number
): BallState => ({
  ...ball,
  velocityX: direction.x * speed,
  velocityY: direction.y * speed
});

export const createPassedBall = (
  ball: BallState,
  direction: FacingDirection
): BallState => kickBall(ball, direction, BALL_PASS_SPEED);

export const createShotBall = (
  ball: BallState,
  direction: FacingDirection
): BallState => kickBall(ball, direction, BALL_SHOT_SPEED);

export const updateBallMotion = (
  ball: BallState,
  deltaMs: number,
  bounds: MovementBounds = PITCH_BOUNDS,
  drag: number = BALL_DRAG,
  stopSpeed: number = BALL_STOP_SPEED
): BallState => {
  const deltaSeconds = deltaMs / 1000;
  const nextX = ball.x + ball.velocityX * deltaSeconds;
  const nextY = ball.y + ball.velocityY * deltaSeconds;
  const minX = bounds.x + ball.radius;
  const maxX = bounds.x + bounds.width - ball.radius;
  const minY = bounds.y + ball.radius;
  const maxY = bounds.y + bounds.height - ball.radius;
  const clampedX = clamp(nextX, minX, maxX);
  const clampedY = clamp(nextY, minY, maxY);
  const hitHorizontalBoundary = clampedX !== nextX;
  const hitVerticalBoundary = clampedY !== nextY;
  const speed = getBallSpeed(ball);

  if (speed <= stopSpeed) {
    return {
      ...ball,
      x: clampedX,
      y: clampedY,
      velocityX: 0,
      velocityY: 0
    };
  }

  const reducedSpeed = Math.max(speed - drag * deltaSeconds, 0);
  const velocityScale = reducedSpeed === 0 ? 0 : reducedSpeed / speed;

  return {
    ...ball,
    x: clampedX,
    y: clampedY,
    velocityX: hitHorizontalBoundary ? 0 : ball.velocityX * velocityScale,
    velocityY: hitVerticalBoundary ? 0 : ball.velocityY * velocityScale
  };
};
