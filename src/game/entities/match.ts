import { MATCH_DURATION_SECONDS } from "../config/match";

export type MatchPhase = "finished" | "playing";
export type ScoringSide = "opponent" | "player";

export type MatchState = {
  opponentScore: number;
  phase: MatchPhase;
  playerScore: number;
  remainingMs: number;
};

export const createMatchState = (
  durationSeconds: number = MATCH_DURATION_SECONDS
): MatchState => ({
  opponentScore: 0,
  phase: "playing",
  playerScore: 0,
  remainingMs: durationSeconds * 1000
});
