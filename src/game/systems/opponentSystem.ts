import { PITCH_BOUNDS } from '../config/gameConfig';
import type { MatchState, Vector2 } from '../entities/types';
import { normalize, subtract } from '../../utils/vector';

const goalTarget = {
  x: PITCH_BOUNDS.left - 10,
  y: (PITCH_BOUNDS.top + PITCH_BOUNDS.bottom) / 2,
};

export function getOpponentInput(state: MatchState): Vector2 {
  if (state.opponent.hasBall) {
    return normalize(subtract(goalTarget, state.opponent.position));
  }

  const target = state.ball.owner === 'player'
    ? state.player.position
    : state.ball.position;

  return normalize(subtract(target, state.opponent.position));
}

export function shouldOpponentShoot(state: MatchState): boolean {
  return state.opponent.hasBall && state.opponent.position.x <= PITCH_BOUNDS.left + 150;
}
