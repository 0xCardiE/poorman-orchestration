import { describe, expect, it } from 'vitest';
import { GOAL_BOUNDS, PITCH_BOUNDS } from '../src/game/config/gameConfig';
import { createInitialMatchState } from '../src/game/entities/createMatchState';
import {
  checkGoal,
  formatClock,
  resetAfterGoal,
  tickClock,
} from '../src/game/systems/matchSystem';

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

  it('resets into a playable kickoff state after a home goal', () => {
    const state = createInitialMatchState({
      score: { home: 1, away: 0 },
      timeRemaining: 22,
      kickoffOwner: 'player',
    });

    resetAfterGoal(state, 'home');

    expect(state.score).toEqual({ home: 1, away: 0 });
    expect(state.timeRemaining).toBe(22);
    expect(state.status).toBe('playing');
    expect(state.ball.owner).toBe('opponent');
    expect(state.player.hasBall).toBe(false);
    expect(state.opponent.hasBall).toBe(true);
  });

  it('ends the match cleanly when the clock reaches zero', () => {
    const state = createInitialMatchState();

    state.ball.owner = null;
    state.player.hasBall = false;
    state.ball.velocity = { x: 120, y: -40 };

    tickClock(state, state.timeRemaining);

    expect(state.timeRemaining).toBe(0);
    expect(state.status).toBe('finished');
    expect(state.ball.velocity).toEqual({ x: 0, y: 0 });
  });
});
