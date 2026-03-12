import {
  BALL_RADIUS,
  MATCH_DURATION_SECONDS,
  OPPONENT_RADIUS,
  OPPONENT_SPEED,
  PLAYER_RADIUS,
  PLAYER_SPEED,
} from '../config/matchConfig';
import { PITCH_BOUNDS } from '../config/gameConfig';
import type { BallOwner, MatchState, ScoreState } from './types';

const pitchCenterY = (PITCH_BOUNDS.top + PITCH_BOUNDS.bottom) / 2;

interface MatchStateOptions {
  score?: ScoreState;
  timeRemaining?: number;
  kickoffOwner?: Exclude<BallOwner, null>;
}

export function createInitialMatchState(
  options: MatchStateOptions = {},
): MatchState {
  const kickoffOwner = options.kickoffOwner ?? 'player';
  const playerStartX = kickoffOwner === 'player'
    ? PITCH_BOUNDS.left + 220
    : PITCH_BOUNDS.left + 150;
  const opponentStartX = kickoffOwner === 'opponent'
    ? PITCH_BOUNDS.right - 220
    : PITCH_BOUNDS.right - 150;

  const state: MatchState = {
    player: {
      position: { x: playerStartX, y: pitchCenterY },
      radius: PLAYER_RADIUS,
      speed: PLAYER_SPEED,
      facing: { x: 1, y: 0 },
      hasBall: kickoffOwner === 'player',
    },
    opponent: {
      position: { x: opponentStartX, y: pitchCenterY },
      radius: OPPONENT_RADIUS,
      speed: OPPONENT_SPEED,
      facing: { x: -1, y: 0 },
      hasBall: kickoffOwner === 'opponent',
    },
    ball: {
      position: {
        x: kickoffOwner === 'player' ? playerStartX + 34 : opponentStartX - 34,
        y: pitchCenterY,
      },
      velocity: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      owner: kickoffOwner,
    },
    score: options.score ? { ...options.score } : { home: 0, away: 0 },
    timeRemaining: options.timeRemaining ?? MATCH_DURATION_SECONDS,
    status: 'playing',
    possessionCooldown: 0,
  };

  return state;
}
