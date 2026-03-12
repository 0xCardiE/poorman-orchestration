import { describe, expect, it } from "vitest";
import type { BallState } from "../src/game/entities/ball";
import type { OpponentState } from "../src/game/entities/opponent";
import type { PlayerState } from "../src/game/entities/player";
import { createInitialPossessionState } from "../src/game/entities/possession";
import {
  canOpponentRecoverBall,
  canPlayerRecoverBall,
  getBallFollowPosition,
  getLooseBallRecoveryOwner,
  hasOpponentPossession,
  hasPlayerPossession,
  releasePlayerPossession,
  syncBallWithPossession,
  updatePossession
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

const TEST_OPPONENT: OpponentState = {
  facing: {
    x: -1,
    y: 0
  },
  x: 260,
  y: 160,
  radius: 18
};

describe("ball possession", () => {
  it("starts with player possession", () => {
    expect(hasPlayerPossession(createInitialPossessionState())).toBe(true);
    expect(hasOpponentPossession(createInitialPossessionState())).toBe(false);
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
      TEST_PLAYER,
      TEST_OPPONENT
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
        TEST_PLAYER,
        TEST_OPPONENT
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

  it("allows the opponent to recover a nearby loose ball", () => {
    expect(
      canOpponentRecoverBall(TEST_OPPONENT, {
        ...TEST_BALL,
        x: 250,
        y: 166
      })
    ).toBe(true);
  });

  it("restores player possession when the loose ball is close enough", () => {
    expect(
      updatePossession(
        {
          owner: null
        },
        TEST_PLAYER,
        TEST_OPPONENT,
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

  it("awards a loose ball to the nearest recoverer", () => {
    expect(
      getLooseBallRecoveryOwner(
        TEST_PLAYER,
        {
          ...TEST_OPPONENT,
          x: 206,
          y: 180
        },
        {
          ...TEST_BALL,
          x: 205,
          y: 178
        }
      )
    ).toBe("opponent");
  });

  it("lets the opponent steal possession when it gets close to the carried ball", () => {
    expect(
      updatePossession(
        createInitialPossessionState(),
        TEST_PLAYER,
        {
          ...TEST_OPPONENT,
          x: 198,
          y: 176
        },
        {
          ...TEST_BALL,
          x: 200,
          y: 180
        }
      )
    ).toEqual({
      owner: "opponent"
    });
  });
});
