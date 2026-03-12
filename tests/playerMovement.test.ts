import { describe, expect, it } from "vitest";
import { PLAYER_SPEED } from "../src/game/config/player";
import type { PlayerState } from "../src/game/entities/player";
import {
  clampPlayerToBounds,
  getNextPlayerState,
  getPlayerMovementVector
} from "../src/game/systems/playerMovement";

const TEST_BOUNDS = {
  x: 100,
  y: 80,
  width: 200,
  height: 140
} as const;

const TEST_PLAYER: PlayerState = {
  facing: {
    x: 1,
    y: 0
  },
  x: 150,
  y: 120,
  radius: 18
};

describe("player movement", () => {
  it("normalizes diagonal input so it does not move faster", () => {
    const vector = getPlayerMovementVector({
      up: false,
      down: true,
      left: false,
      right: true
    });

    expect(vector.x).toBeCloseTo(Math.SQRT1_2);
    expect(vector.y).toBeCloseTo(Math.SQRT1_2);
  });

  it("moves by the configured speed over time", () => {
    const deltaMs = 250;
    const nextState = getNextPlayerState(
      TEST_PLAYER,
      {
        up: false,
        down: false,
        left: false,
        right: true
      },
      deltaMs,
      TEST_BOUNDS
    );

    expect(nextState.x).toBe(TEST_PLAYER.x + (PLAYER_SPEED * deltaMs) / 1000);
    expect(nextState.y).toBe(TEST_PLAYER.y);
  });

  it("clamps the player inside the pitch bounds", () => {
    const clampedState = clampPlayerToBounds(
      {
        facing: {
          x: 1,
          y: 0
        },
        x: 95,
        y: 260,
        radius: 18
      },
      TEST_BOUNDS
    );

    expect(clampedState).toEqual({
      facing: {
        x: 1,
        y: 0
      },
      x: 118,
      y: 202,
      radius: 18
    });
  });

  it("updates facing while moving and keeps it while idle", () => {
    const movedState = getNextPlayerState(
      TEST_PLAYER,
      {
        up: true,
        down: false,
        left: false,
        right: false
      },
      100,
      TEST_BOUNDS
    );

    expect(movedState.facing).toEqual({
      x: 0,
      y: -1
    });

    const idleState = getNextPlayerState(
      movedState,
      {
        up: false,
        down: false,
        left: false,
        right: false
      },
      100,
      TEST_BOUNDS
    );

    expect(idleState.facing).toEqual(movedState.facing);
  });
});
