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
        x: 95,
        y: 260,
        radius: 18
      },
      TEST_BOUNDS
    );

    expect(clampedState).toEqual({
      x: 118,
      y: 202,
      radius: 18
    });
  });
});
