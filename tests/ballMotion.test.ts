import { describe, expect, it } from "vitest";
import {
  BALL_PASS_SPEED,
  BALL_SHOT_SPEED
} from "../src/game/config/ball";
import type { BallState } from "../src/game/entities/ball";
import {
  createPassedBall,
  createShotBall,
  getBallSpeed,
  updateBallMotion
} from "../src/game/systems/ballMotion";

const TEST_BALL: BallState = {
  radius: 8,
  velocityX: 0,
  velocityY: 0,
  x: 160,
  y: 140
};

describe("ball motion", () => {
  it("creates a pass using the current facing direction", () => {
    const passedBall = createPassedBall(TEST_BALL, {
      x: 0,
      y: -1
    });

    expect(passedBall.velocityX).toBe(0);
    expect(passedBall.velocityY).toBe(-BALL_PASS_SPEED);
  });

  it("creates a stronger shot than a pass", () => {
    const shotBall = createShotBall(TEST_BALL, {
      x: 1,
      y: 0
    });

    expect(shotBall.velocityX).toBe(BALL_SHOT_SPEED);
    expect(getBallSpeed(shotBall)).toBeGreaterThan(BALL_PASS_SPEED);
  });

  it("moves a loose ball forward and slows it with drag", () => {
    const movingBall = {
      ...TEST_BALL,
      velocityX: 300
    };

    const updatedBall = updateBallMotion(
      movingBall,
      500,
      {
        x: 0,
        y: 0,
        width: 500,
        height: 300
      },
      200,
      10
    );

    expect(updatedBall.x).toBe(310);
    expect(updatedBall.velocityX).toBe(200);
    expect(updatedBall.velocityY).toBe(0);
  });

  it("stops the ball once it drops below the stop speed", () => {
    const updatedBall = updateBallMotion(
      {
        ...TEST_BALL,
        velocityX: 18
      },
      16,
      {
        x: 0,
        y: 0,
        width: 500,
        height: 300
      },
      200,
      24
    );

    expect(updatedBall.velocityX).toBe(0);
    expect(updatedBall.velocityY).toBe(0);
  });
});
