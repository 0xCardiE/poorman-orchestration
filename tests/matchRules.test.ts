import { describe, expect, it } from "vitest";
import { createMatchState } from "../src/game/entities/match";
import { awardGoal, formatMatchClock, getGoalScorer, tickMatchClock } from "../src/game/systems/matchRules";

describe("match rules", () => {
  it("awards the player a goal when the loose ball reaches the right goal", () => {
    expect(
      getGoalScorer({
        radius: 8,
        velocityX: 0,
        velocityY: 0,
        x: 924,
        y: 270
      })
    ).toBe("player");
  });

  it("awards the opponent a goal when the loose ball reaches the left goal", () => {
    expect(
      getGoalScorer({
        radius: 8,
        velocityX: 0,
        velocityY: 0,
        x: 36,
        y: 270
      })
    ).toBe("opponent");
  });

  it("does not count the ball as a goal outside the goal mouth", () => {
    expect(
      getGoalScorer({
        radius: 8,
        velocityX: 0,
        velocityY: 0,
        x: 924,
        y: 120
      })
    ).toBeNull();
  });

  it("increments the chosen side's score", () => {
    expect(awardGoal(createMatchState(), "player")).toMatchObject({
      opponentScore: 0,
      playerScore: 1
    });
  });

  it("counts the clock down and finishes the match at zero", () => {
    const finishedMatch = tickMatchClock(
      {
        ...createMatchState(),
        remainingMs: 400
      },
      500
    );

    expect(finishedMatch.remainingMs).toBe(0);
    expect(finishedMatch.phase).toBe("finished");
  });

  it("formats the remaining clock time for the HUD", () => {
    expect(formatMatchClock(60_000)).toBe("1:00");
    expect(formatMatchClock(59_001)).toBe("1:00");
    expect(formatMatchClock(12_000)).toBe("0:12");
  });
});
