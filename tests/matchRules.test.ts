import { KICKOFF_DURATION_MS } from "../src/game/config/match";
import { describe, expect, it } from "vitest";
import { createMatchState } from "../src/game/entities/match";
import {
  advanceMatchState,
  awardGoal,
  beginKickoff,
  formatKickoffCountdown,
  formatMatchClock,
  getGoalScorer,
  getPlayableDeltaMs,
  tickMatchClock
} from "../src/game/systems/matchRules";

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

  it("starts new matches in kickoff state", () => {
    expect(createMatchState()).toMatchObject({
      kickoffRemainingMs: KICKOFF_DURATION_MS,
      phase: "kickoff"
    });
  });

  it("keeps play disabled while kickoff time remains", () => {
    const result = advanceMatchState(createMatchState(), 500);

    expect(result.playableDeltaMs).toBe(0);
    expect(result.match).toMatchObject({
      kickoffRemainingMs: 1000,
      phase: "kickoff"
    });
    expect(getPlayableDeltaMs(result.match, 16)).toBe(0);
  });

  it("returns leftover frame time once kickoff finishes", () => {
    const result = advanceMatchState(createMatchState(), 1750);

    expect(result.playableDeltaMs).toBe(250);
    expect(result.match).toMatchObject({
      kickoffRemainingMs: 0,
      phase: "playing"
    });
  });

  it("can re-enter kickoff after a goal reset", () => {
    const restartedMatch = beginKickoff({
      ...createMatchState(),
      kickoffRemainingMs: 0,
      phase: "playing",
      playerScore: 2
    });

    expect(restartedMatch).toMatchObject({
      kickoffRemainingMs: KICKOFF_DURATION_MS,
      phase: "kickoff",
      playerScore: 2
    });
  });

  it("counts the clock down and finishes the match at zero", () => {
    const finishedMatch = tickMatchClock(
      {
        ...createMatchState(),
        kickoffRemainingMs: 0,
        phase: "playing",
        remainingMs: 400
      },
      500
    );

    expect(finishedMatch.remainingMs).toBe(0);
    expect(finishedMatch.phase).toBe("finished");
  });

  it("limits simulation time to the time left in the match", () => {
    expect(
      getPlayableDeltaMs(
        {
          ...createMatchState(),
          kickoffRemainingMs: 0,
          phase: "playing",
          remainingMs: 120
        },
        250
      )
    ).toBe(120);
  });

  it("formats the remaining clock time for the HUD", () => {
    expect(formatMatchClock(60_000)).toBe("1:00");
    expect(formatMatchClock(59_001)).toBe("1:00");
    expect(formatMatchClock(12_000)).toBe("0:12");
  });

  it("formats kickoff countdown text for the HUD", () => {
    expect(formatKickoffCountdown(1500)).toBe("Kickoff in 2");
    expect(formatKickoffCountdown(1000)).toBe("Kickoff in 1");
  });
});
