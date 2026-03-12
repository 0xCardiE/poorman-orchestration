import { describe, expect, it } from "vitest";
import {
  getTouchMovementInput,
  shouldEnableTouchControls
} from "../src/game/systems/touchControls";
import {
  mergePlayerActionInput,
  mergePlayerMovementInput
} from "../src/game/systems/playerInput";

describe("touch controls", () => {
  it("maps touch stick offsets to eight-direction movement input", () => {
    expect(getTouchMovementInput(0.8, -0.7)).toEqual({
      up: true,
      down: false,
      left: false,
      right: true
    });
  });

  it("stays neutral inside the dead zone", () => {
    expect(getTouchMovementInput(0.1, -0.1)).toEqual({
      up: false,
      down: false,
      left: false,
      right: false
    });
  });

  it("enables touch controls for coarse pointers or touch points", () => {
    expect(
      shouldEnableTouchControls(
        {
          matchMedia: () => ({ matches: true } as MediaQueryList)
        },
        {
          maxTouchPoints: 0
        }
      )
    ).toBe(true);

    expect(
      shouldEnableTouchControls(
        {
          matchMedia: () => ({ matches: false } as MediaQueryList)
        },
        {
          maxTouchPoints: 2
        }
      )
    ).toBe(true);
  });

  it("merges touch and keyboard input without dropping either source", () => {
    expect(
      mergePlayerMovementInput(
        {
          up: false,
          down: false,
          left: true,
          right: false
        },
        {
          up: true,
          down: false,
          left: false,
          right: false
        }
      )
    ).toEqual({
      up: true,
      down: false,
      left: true,
      right: false
    });

    expect(
      mergePlayerActionInput(
        {
          pass: false,
          shoot: true
        },
        {
          pass: true,
          shoot: false
        }
      )
    ).toEqual({
      pass: true,
      shoot: true
    });
  });
});
