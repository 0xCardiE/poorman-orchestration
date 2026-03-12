import { KICKOFF_DURATION_MS } from "../config/match";
import { GOAL, PITCH_BOUNDS } from "../config/pitch";
import type { BallState } from "../entities/ball";
import type { MatchState, ScoringSide } from "../entities/match";
import type { MovementBounds } from "./playerMovement";

type GoalDimensions = {
  depth: number;
  width: number;
};

export const getGoalVerticalBounds = (
  pitchBounds: MovementBounds = PITCH_BOUNDS,
  goal: GoalDimensions = GOAL
): { bottom: number; top: number } => {
  const top = pitchBounds.y + (pitchBounds.height - goal.width) / 2;

  return {
    bottom: top + goal.width,
    top
  };
};

export const getGoalScorer = (
  ball: BallState,
  pitchBounds: MovementBounds = PITCH_BOUNDS,
  goal: GoalDimensions = GOAL
): ScoringSide | null => {
  const goalBounds = getGoalVerticalBounds(pitchBounds, goal);
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  if (ballBottom < goalBounds.top || ballTop > goalBounds.bottom) {
    return null;
  }

  if (ball.x - ball.radius <= pitchBounds.x) {
    return "opponent";
  }

  if (ball.x + ball.radius >= pitchBounds.x + pitchBounds.width) {
    return "player";
  }

  return null;
};

export const awardGoal = (match: MatchState, side: ScoringSide): MatchState =>
  side === "player"
    ? {
      ...match,
      playerScore: match.playerScore + 1
    }
    : {
      ...match,
      opponentScore: match.opponentScore + 1
    };

export const beginKickoff = (
  match: MatchState,
  kickoffDurationMs: number = KICKOFF_DURATION_MS
): MatchState => ({
  ...match,
  kickoffRemainingMs: kickoffDurationMs,
  phase: "kickoff"
});

export type MatchAdvanceResult = {
  match: MatchState;
  playableDeltaMs: number;
};

export const advanceMatchState = (
  match: MatchState,
  deltaMs: number
): MatchAdvanceResult => {
  if (match.phase === "finished") {
    return {
      match,
      playableDeltaMs: 0
    };
  }

  if (match.phase === "playing") {
    return {
      match,
      playableDeltaMs: Math.min(deltaMs, match.remainingMs)
    };
  }

  const kickoffDeltaMs = Math.min(deltaMs, match.kickoffRemainingMs);
  const kickoffRemainingMs = match.kickoffRemainingMs - kickoffDeltaMs;

  if (kickoffRemainingMs > 0) {
    return {
      match: {
        ...match,
        kickoffRemainingMs
      },
      playableDeltaMs: 0
    };
  }

  const playingMatch: MatchState = {
    ...match,
    kickoffRemainingMs: 0,
    phase: "playing"
  };

  return {
    match: playingMatch,
    playableDeltaMs: Math.min(deltaMs - kickoffDeltaMs, playingMatch.remainingMs)
  };
};

export const getPlayableDeltaMs = (match: MatchState, deltaMs: number): number => {
  if (match.phase !== "playing") {
    return 0;
  }

  return Math.min(deltaMs, match.remainingMs);
};

export const tickMatchClock = (match: MatchState, deltaMs: number): MatchState => {
  if (match.phase !== "playing") {
    return match;
  }

  const remainingMs = Math.max(match.remainingMs - deltaMs, 0);

  return {
    ...match,
    phase: remainingMs === 0 ? "finished" : "playing",
    remainingMs
  };
};

export const formatKickoffCountdown = (remainingMs: number): string =>
  `Kickoff in ${Math.max(1, Math.ceil(remainingMs / 1000))}`;

export const formatMatchClock = (remainingMs: number): string => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getMatchResultText = (match: MatchState): string => {
  if (match.playerScore > match.opponentScore) {
    return "Full Time - You Win";
  }

  if (match.playerScore < match.opponentScore) {
    return "Full Time - Opponent Wins";
  }

  return "Full Time - Draw";
};
