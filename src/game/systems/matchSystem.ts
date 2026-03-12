import { GOAL_BOUNDS, PITCH_BOUNDS } from '../config/gameConfig';
import { BALL_BOUNCE } from '../config/matchConfig';
import { createInitialMatchState } from '../entities/createMatchState';
import type { MatchState, Team } from '../entities/types';
import { clamp } from '../../utils/vector';

function isInsideGoalWindow(y: number): boolean {
  return y >= GOAL_BOUNDS.top && y <= GOAL_BOUNDS.bottom;
}

export function resolveBallBounds(state: MatchState): void {
  if (state.ball.owner !== null) {
    return;
  }

  if (state.ball.position.y - state.ball.radius < PITCH_BOUNDS.top) {
    state.ball.position.y = PITCH_BOUNDS.top + state.ball.radius;
    state.ball.velocity.y = Math.abs(state.ball.velocity.y) * BALL_BOUNCE;
  }

  if (state.ball.position.y + state.ball.radius > PITCH_BOUNDS.bottom) {
    state.ball.position.y = PITCH_BOUNDS.bottom - state.ball.radius;
    state.ball.velocity.y = -Math.abs(state.ball.velocity.y) * BALL_BOUNCE;
  }

  if (!isInsideGoalWindow(state.ball.position.y)) {
    if (state.ball.position.x - state.ball.radius < PITCH_BOUNDS.left) {
      state.ball.position.x = PITCH_BOUNDS.left + state.ball.radius;
      state.ball.velocity.x = Math.abs(state.ball.velocity.x) * BALL_BOUNCE;
    }

    if (state.ball.position.x + state.ball.radius > PITCH_BOUNDS.right) {
      state.ball.position.x = PITCH_BOUNDS.right - state.ball.radius;
      state.ball.velocity.x = -Math.abs(state.ball.velocity.x) * BALL_BOUNCE;
    }
  } else {
    state.ball.position.x = clamp(
      state.ball.position.x,
      PITCH_BOUNDS.left - GOAL_BOUNDS.depth - state.ball.radius,
      PITCH_BOUNDS.right + GOAL_BOUNDS.depth + state.ball.radius,
    );
  }
}

export function checkGoal(state: MatchState): Team | null {
  if (state.ball.owner !== null || !isInsideGoalWindow(state.ball.position.y)) {
    return null;
  }

  if (state.ball.position.x - state.ball.radius <= PITCH_BOUNDS.left - GOAL_BOUNDS.depth) {
    state.score.away += 1;
    return 'away';
  }

  if (state.ball.position.x + state.ball.radius >= PITCH_BOUNDS.right + GOAL_BOUNDS.depth) {
    state.score.home += 1;
    return 'home';
  }

  return null;
}

export function resetAfterGoal(
  state: MatchState,
  scoringTeam: Team,
): void {
  const nextState = createInitialMatchState({
    score: state.score,
    timeRemaining: state.timeRemaining,
    kickoffOwner: scoringTeam === 'home' ? 'opponent' : 'player',
  });

  Object.assign(state, nextState);
}

export function tickClock(state: MatchState, deltaSeconds: number): void {
  if (state.status !== 'playing') {
    return;
  }

  state.timeRemaining = Math.max(0, state.timeRemaining - deltaSeconds);

  if (state.timeRemaining === 0) {
    state.status = 'finished';
    state.ball.velocity = { x: 0, y: 0 };
  }
}

export function formatClock(seconds: number): string {
  const clampedSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clampedSeconds / 60);
  const remainder = clampedSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function getResultLabel(state: MatchState): string {
  if (state.score.home > state.score.away) {
    return 'You win';
  }

  if (state.score.home < state.score.away) {
    return 'Opponent wins';
  }

  return 'Draw';
}
