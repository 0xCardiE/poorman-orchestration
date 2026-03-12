import { KICKOFF_DURATION_MS, MATCH_DURATION_SECONDS } from "../config/match";

export type MatchPhase = "finished" | "kickoff" | "playing";
export type ScoringSide = "opponent" | "player";

export type MatchState = {
  kickoffRemainingMs: number;
  opponentScore: number;
  phase: MatchPhase;
  playerScore: number;
  remainingMs: number;
};

export const createMatchState = (
  durationSeconds: number = MATCH_DURATION_SECONDS,
  kickoffDurationMs: number = KICKOFF_DURATION_MS
): MatchState => ({
  kickoffRemainingMs: kickoffDurationMs,
  opponentScore: 0,
  phase: "kickoff",
  playerScore: 0,
  remainingMs: durationSeconds * 1000
});
