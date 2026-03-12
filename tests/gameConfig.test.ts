import { describe, expect, it } from "vitest";
import { GAME_HEIGHT, GAME_WIDTH } from "../src/game/config/dimensions";
import { GOAL, GOAL_AREA, PENALTY_AREA, PITCH_BOUNDS } from "../src/game/config/pitch";
import { MATCH_SCENE_KEY, MAIN_MENU_SCENE_KEY } from "../src/game/config/sceneKeys";
import { createBallState } from "../src/game/entities/ball";
import { createPlayerState } from "../src/game/entities/player";

describe("project scaffold", () => {
  it("exports the base game dimensions", () => {
    expect(GAME_WIDTH).toBe(960);
    expect(GAME_HEIGHT).toBe(540);
  });

  it("exports stable scene keys for menu and match flow", () => {
    expect(MAIN_MENU_SCENE_KEY).toBe("main-menu");
    expect(MATCH_SCENE_KEY).toBe("match");
  });

  it("exports pitch dimensions for field markings", () => {
    expect(PITCH_BOUNDS).toEqual({
      x: 36,
      y: 36,
      width: 888,
      height: 468
    });
    expect(PENALTY_AREA).toEqual({
      depth: 132,
      width: 220
    });
    expect(GOAL_AREA).toEqual({
      depth: 56,
      width: 120
    });
    expect(GOAL).toEqual({
      depth: 18,
      width: 120
    });
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
