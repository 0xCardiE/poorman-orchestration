import { describe, it, expect } from 'vitest';
import { MatchTimer } from '../src/game/systems/MatchTimer';

describe('MatchTimer', () => {
  it('starts with full time', () => {
    const timer = new MatchTimer();
    expect(timer.remaining).toBe(90);
    expect(timer.isFinished()).toBe(false);
  });

  it('does not count down when stopped', () => {
    const timer = new MatchTimer();
    timer.update(5);
    expect(timer.remaining).toBe(90);
  });

  it('counts down when running', () => {
    const timer = new MatchTimer();
    timer.start();
    timer.update(10);
    expect(timer.remaining).toBe(80);
  });

  it('clamps to zero', () => {
    const timer = new MatchTimer();
    timer.start();
    timer.update(100);
    expect(timer.remaining).toBe(0);
    expect(timer.isFinished()).toBe(true);
  });

  it('formats time correctly', () => {
    const timer = new MatchTimer();
    expect(timer.formatTime()).toBe('1:30');

    timer.start();
    timer.update(25);
    expect(timer.formatTime()).toBe('1:05');

    timer.update(60);
    expect(timer.formatTime()).toBe('0:05');
  });

  it('resets correctly', () => {
    const timer = new MatchTimer();
    timer.start();
    timer.update(50);
    timer.reset();
    expect(timer.remaining).toBe(90);
    expect(timer.isFinished()).toBe(false);
  });
});
