import {
  BALL_CARRY_OFFSET,
  BALL_DRAG,
  BALL_STOP_SPEED,
  POSSESSION_COOLDOWN_SECONDS,
  POSSESSION_DISTANCE,
  STEAL_DISTANCE,
} from '../config/matchConfig';
import type { ActorState, BallOwner, MatchState, Vector2 } from '../entities/types';
import { add, distance, length, normalize, scale } from '../../utils/vector';

function defaultFacing(owner: Exclude<BallOwner, null>): Vector2 {
  return owner === 'player' ? { x: 1, y: 0 } : { x: -1, y: 0 };
}

function getOwnerActor(state: MatchState): ActorState | null {
  if (state.ball.owner === 'player') {
    return state.player;
  }

  if (state.ball.owner === 'opponent') {
    return state.opponent;
  }

  return null;
}

export function setBallOwner(state: MatchState, owner: BallOwner): void {
  state.ball.owner = owner;
  state.player.hasBall = owner === 'player';
  state.opponent.hasBall = owner === 'opponent';
  state.possessionCooldown = POSSESSION_COOLDOWN_SECONDS;

  if (owner !== null) {
    state.ball.velocity = { x: 0, y: 0 };
  }
}

export function attachBallToOwner(state: MatchState): void {
  const owner = state.ball.owner;
  const actor = getOwnerActor(state);

  if (!owner || !actor) {
    return;
  }

  const facing = normalize(actor.facing);
  const carryDirection = facing.x === 0 && facing.y === 0
    ? defaultFacing(owner)
    : facing;

  state.ball.position = add(
    actor.position,
    scale(carryDirection, actor.radius + state.ball.radius + BALL_CARRY_OFFSET),
  );
  state.ball.velocity = { x: 0, y: 0 };
}

export function kickBall(
  state: MatchState,
  direction: Vector2,
  speed: number,
): boolean {
  const owner = state.ball.owner;

  if (!owner) {
    return false;
  }

  const actor = getOwnerActor(state);

  if (!actor) {
    return false;
  }

  const normalizedDirection = normalize(direction);
  const kickDirection = normalizedDirection.x === 0 && normalizedDirection.y === 0
    ? defaultFacing(owner)
    : normalizedDirection;

  state.ball.position = add(
    actor.position,
    scale(kickDirection, actor.radius + state.ball.radius + BALL_CARRY_OFFSET),
  );

  setBallOwner(state, null);
  state.ball.velocity = scale(kickDirection, speed);

  return true;
}

export function updateBallMotion(
  state: MatchState,
  deltaSeconds: number,
): void {
  if (state.ball.owner !== null) {
    attachBallToOwner(state);
    return;
  }

  state.ball.position.x += state.ball.velocity.x * deltaSeconds;
  state.ball.position.y += state.ball.velocity.y * deltaSeconds;

  const damping = Math.max(0, 1 - BALL_DRAG * deltaSeconds);
  state.ball.velocity.x *= damping;
  state.ball.velocity.y *= damping;

  if (length(state.ball.velocity) < BALL_STOP_SPEED) {
    state.ball.velocity = { x: 0, y: 0 };
  }
}

export function updatePossession(state: MatchState): void {
  if (state.possessionCooldown > 0) {
    return;
  }

  if (state.ball.owner === null) {
    const playerDistance = distance(state.player.position, state.ball.position);
    const opponentDistance = distance(
      state.opponent.position,
      state.ball.position,
    );
    const controlDistance = state.ball.radius + POSSESSION_DISTANCE;

    if (
      playerDistance <= state.player.radius + controlDistance &&
      playerDistance <= opponentDistance
    ) {
      setBallOwner(state, 'player');
      return;
    }

    if (opponentDistance <= state.opponent.radius + controlDistance) {
      setBallOwner(state, 'opponent');
    }

    return;
  }

  const actorsOverlap = distance(state.player.position, state.opponent.position)
    <= state.player.radius + STEAL_DISTANCE;

  if (!actorsOverlap) {
    return;
  }

  if (state.ball.owner === 'player') {
    setBallOwner(state, 'opponent');
    return;
  }

  setBallOwner(state, 'player');
}

export function tickPossessionCooldown(
  state: MatchState,
  deltaSeconds: number,
): void {
  state.possessionCooldown = Math.max(0, state.possessionCooldown - deltaSeconds);
}
