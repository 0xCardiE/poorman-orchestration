import { describe, expect, it } from 'vitest';
import { BALL_PASS_SPEED } from '../src/game/config/matchConfig';
import { createInitialMatchState } from '../src/game/entities/createMatchState';
import {
  kickBall,
  updatePossession,
} from '../src/game/systems/ballSystem';

describe('ballSystem', () => {
  it('kicks the ball away from the player', () => {
    const state = createInitialMatchState();

    const kicked = kickBall(state, { x: 1, y: 0 }, BALL_PASS_SPEED);

    expect(kicked).toBe(true);
    expect(state.ball.owner).toBeNull();
    expect(state.player.hasBall).toBe(false);
    expect(state.ball.velocity.x).toBe(BALL_PASS_SPEED);
    expect(state.ball.velocity.y).toBe(0);
  });

  it('uses the owner default facing direction when a kick has no input direction', () => {
    const state = createInitialMatchState();

    kickBall(state, { x: 0, y: 0 }, BALL_PASS_SPEED);

    expect(state.ball.velocity.x).toBe(BALL_PASS_SPEED);
    expect(state.ball.velocity.y).toBe(0);
  });

  it('grants possession to the nearest actor when the ball is free', () => {
    const state = createInitialMatchState({ kickoffOwner: 'opponent' });

    state.possessionCooldown = 0;
    state.ball.owner = null;
    state.player.hasBall = false;
    state.opponent.hasBall = false;
    state.ball.position = { ...state.player.position };

    updatePossession(state);

    expect(state.ball.owner).toBe('player');
    expect(state.player.hasBall).toBe(true);
  });

  it('breaks loose-ball distance ties in the player favor', () => {
    const state = createInitialMatchState({ kickoffOwner: 'opponent' });

    state.possessionCooldown = 0;
    state.ball.owner = null;
    state.player.hasBall = false;
    state.opponent.hasBall = false;
    state.player.position = { x: 300, y: 240 };
    state.opponent.position = { x: 420, y: 240 };
    state.ball.position = { x: 360, y: 240 };

    updatePossession(state);

    expect(state.ball.owner).toBe('player');
    expect(state.player.hasBall).toBe(true);
    expect(state.opponent.hasBall).toBe(false);
  });
});
