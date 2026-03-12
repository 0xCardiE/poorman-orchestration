export type BallOwner = 'player' | 'opponent' | null;
export type Team = 'home' | 'away';
export type MatchStatus = 'playing' | 'finished';

export interface Vector2 {
  x: number;
  y: number;
}

export interface ActorState {
  position: Vector2;
  radius: number;
  speed: number;
  facing: Vector2;
  hasBall: boolean;
}

export interface BallState {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  owner: BallOwner;
}

export interface ScoreState {
  home: number;
  away: number;
}

export interface MatchState {
  player: ActorState;
  opponent: ActorState;
  ball: BallState;
  score: ScoreState;
  timeRemaining: number;
  status: MatchStatus;
  possessionCooldown: number;
}
