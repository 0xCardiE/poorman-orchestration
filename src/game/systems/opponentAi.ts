import { OPPONENT_HOME_POSITION, OPPONENT_TARGET_TOLERANCE } from "../config/opponent";
import type { BallState } from "../entities/ball";
import type { OpponentState } from "../entities/opponent";
import type { PlayerState } from "../entities/player";
import type { PossessionState } from "../entities/possession";
import { hasOpponentPossession, hasPlayerPossession } from "./ballPossession";
import type { PlayerMovementInput } from "./playerMovement";

export type OpponentTarget = {
  x: number;
  y: number;
};

export const getOpponentTarget = (
  possession: PossessionState,
  player: PlayerState,
  ball: BallState,
  homePosition: OpponentTarget = OPPONENT_HOME_POSITION
): OpponentTarget => {
  if (hasOpponentPossession(possession)) {
    return homePosition;
  }

  if (hasPlayerPossession(possession)) {
    return {
      x: player.x,
      y: player.y
    };
  }

  return {
    x: ball.x,
    y: ball.y
  };
};

export const getMovementInputTowardsTarget = (
  opponent: OpponentState,
  target: OpponentTarget,
  tolerance: number = OPPONENT_TARGET_TOLERANCE
): PlayerMovementInput => {
  const deltaX = target.x - opponent.x;
  const deltaY = target.y - opponent.y;

  return {
    up: deltaY < -tolerance,
    down: deltaY > tolerance,
    left: deltaX < -tolerance,
    right: deltaX > tolerance
  };
};

export const getOpponentMovementInput = (
  opponent: OpponentState,
  possession: PossessionState,
  player: PlayerState,
  ball: BallState
): PlayerMovementInput =>
  getMovementInputTowardsTarget(opponent, getOpponentTarget(possession, player, ball));
