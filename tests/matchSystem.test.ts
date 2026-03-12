import { describe, expect, it } from 'vitest';
import { GOAL_BOUNDS, PITCH_BOUNDS } from '../src/game/config/gameConfig';
import { createInitialMatchState } from '../src/game/entities/createMatchState';
import { checkGoal, formatClock } from '../src/game/systems/matchSystem';

describe('matchSystem', () => {
  it('scores for the player when the ball enters the right goal', () => {
    const state = createInitialMatchState();

    state.ball.owner = null;
    state.player.hasBall = false;
    state.ball.position = {
      x: PITCH_BOUNDS.right + GOAL_BOUNDS.depth + state.ball.radius,
      y: (GOAL_BOUNDS.top + GOAL_BOUNDS.bottom) / 2,
    };

    const scorer = checkGoal(state);

    expect(scorer).toBe('home');
    expect(state.score.home).toBe(1);
  });

  it('formats the match clock in minutes and seconds', () => {
    expect(formatClock(60)).toBe('01:00');
    expect(formatClock(9)).toBe('00:09');
  });
});
