import { describe, it, expect } from 'vitest';
import { ScoreManager } from '../src/game/systems/ScoreManager';

describe('ScoreManager', () => {
  it('starts at 0-0', () => {
    const sm = new ScoreManager();
    expect(sm.playerScore).toBe(0);
    expect(sm.opponentScore).toBe(0);
  });

  it('increments player score', () => {
    const sm = new ScoreManager();
    sm.playerGoal();
    expect(sm.playerScore).toBe(1);
    expect(sm.opponentScore).toBe(0);
  });

  it('increments opponent score', () => {
    const sm = new ScoreManager();
    sm.opponentGoal();
    expect(sm.opponentScore).toBe(1);
  });

  it('resets scores', () => {
    const sm = new ScoreManager();
    sm.playerGoal();
    sm.opponentGoal();
    sm.reset();
    expect(sm.playerScore).toBe(0);
    expect(sm.opponentScore).toBe(0);
  });

  it('formats as string', () => {
    const sm = new ScoreManager();
    sm.playerGoal();
    sm.playerGoal();
    sm.opponentGoal();
    expect(sm.toString()).toBe('2 - 1');
  });
});
