import { describe, expect, it } from "vitest";
import { GAME_HEIGHT, GAME_WIDTH } from "../src/game/config/dimensions";
import { createBallState, createPlayerState } from "../src/game/entities/matchEntities";

describe("project scaffold", () => {
  it("exports the base game dimensions", () => {
    expect(GAME_WIDTH).toBe(960);
    expect(GAME_HEIGHT).toBe(540);
  });

  it("creates the starter match entities", () => {
    expect(createPlayerState()).toEqual({
      x: 320,
      y: 270,
      radius: 18
    });
    expect(createBallState()).toEqual({
      x: 420,
      y: 270,
      radius: 8
    });
  });
});
