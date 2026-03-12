import { describe, expect, it } from "vitest";
import type { BallState } from "../src/game/entities/ball";
import type { OpponentState } from "../src/game/entities/opponent";
import type { PlayerState } from "../src/game/entities/player";
import type { PossessionState } from "../src/game/entities/possession";
import {
  getMovementInputTowardsTarget,
  getOpponentTarget
} from "../src/game/systems/opponentAi";

const TEST_PLAYER: PlayerState = {
  facing: {
    x: 1,
    y: 0
  },
  x: 180,
  y: 140,
  radius: 18
};

const TEST_OPPONENT: OpponentState = {
  facing: {
    x: -1,
    y: 0
  },
  x: 380,
  y: 220,
  radius: 18
};

const TEST_BALL: BallState = {
  velocityX: 0,
  velocityY: 0,
  x: 260,
  y: 180,
  radius: 8
};

describe("opponent AI", () => {
  it("chases the ball carrier while the player has possession", () => {
    const possession: PossessionState = {
      owner: "player"
    };

    expect(getOpponentTarget(possession, TEST_OPPONENT, TEST_PLAYER, TEST_BALL)).toEqual({
      x: TEST_PLAYER.x,
      y: TEST_PLAYER.y
    });
  });

  it("chases the loose ball when nobody has possession", () => {
    const possession: PossessionState = {
      owner: null
    };

    expect(getOpponentTarget(possession, TEST_OPPONENT, TEST_PLAYER, TEST_BALL)).toEqual({
      x: TEST_BALL.x,
      y: TEST_BALL.y
    });
  });

  it("switches to its possession route after winning the ball", () => {
    const possession: PossessionState = {
      owner: "opponent"
    };

    expect(
      getOpponentTarget(possession, TEST_OPPONENT, TEST_PLAYER, TEST_BALL, {
        x: 500,
        y: 120
      })
    ).toEqual({
      x: 256,
      y: 270
    });
  });

  it("creates readable movement input toward a target", () => {
    expect(
      getMovementInputTowardsTarget(TEST_OPPONENT, {
        x: 330,
        y: 260
      })
    ).toEqual({
      up: false,
      down: true,
      left: true,
      right: false
    });
  });

  it("stops moving once it is inside the target tolerance", () => {
    expect(
      getMovementInputTowardsTarget(
        TEST_OPPONENT,
        {
          x: 388,
          y: 228
        },
        12
      )
    ).toEqual({
      up: false,
      down: false,
      left: false,
      right: false
    });
  });
});
