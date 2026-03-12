import { describe, expect, it } from "vitest";
import type { BallState } from "../src/game/entities/ball";
import type { PlayerState } from "../src/game/entities/player";
import { createInitialPossessionState } from "../src/game/entities/possession";
import {
  canPlayerRecoverBall,
  getBallFollowPosition,
  hasPlayerPossession,
  releasePlayerPossession,
  syncBallWithPossession,
  updatePlayerPossession
} from "../src/game/systems/ballPossession";

const TEST_PLAYER: PlayerState = {
  facing: {
    x: 0,
    y: 1
  },
  x: 200,
  y: 160,
  radius: 18
};

const TEST_BALL: BallState = {
  velocityX: 0,
  velocityY: 0,
  x: 120,
  y: 90,
  radius: 8
};

describe("ball possession", () => {
  it("starts with player possession", () => {
    expect(hasPlayerPossession(createInitialPossessionState())).toBe(true);
  });

  it("places the ball in front of the player's facing direction", () => {
    expect(getBallFollowPosition(TEST_PLAYER, 24)).toEqual({
      x: 200,
      y: 184
    });
  });

  it("syncs the ball to the carrier while possession is held", () => {
    const ballState = syncBallWithPossession(
      TEST_BALL,
      createInitialPossessionState(),
      TEST_PLAYER
    );

    expect(ballState).toEqual({
      velocityX: 0,
      velocityY: 0,
      x: 200,
      y: 180,
      radius: 8
    });
  });

  it("leaves the ball alone when nobody has possession", () => {
    expect(
      syncBallWithPossession(
        TEST_BALL,
        {
          owner: null
        },
        TEST_PLAYER
      )
    ).toEqual(TEST_BALL);
  });

  it("releases possession after a kick", () => {
    expect(releasePlayerPossession(createInitialPossessionState())).toEqual({
      owner: null
    });
  });

  it("allows the player to recover a nearby loose ball", () => {
    expect(
      canPlayerRecoverBall(TEST_PLAYER, {
        ...TEST_BALL,
        x: 210,
        y: 170
      })
    ).toBe(true);
  });

  it("restores player possession when the loose ball is close enough", () => {
    expect(
      updatePlayerPossession(
        {
          owner: null
        },
        TEST_PLAYER,
        {
          ...TEST_BALL,
          x: 202,
          y: 176
        }
      )
    ).toEqual({
      owner: "player"
    });
  });
});
