import { BALL_FOLLOW_DISTANCE, BALL_RECOVERY_DISTANCE } from "../config/ball";
import type { BallState } from "../entities/ball";
import type { PlayerState } from "../entities/player";
import type { PossessionState } from "../entities/possession";

export type Position = {
  x: number;
  y: number;
};

export const hasPlayerPossession = (possession: PossessionState): boolean =>
  possession.owner === "player";

export const getBallFollowPosition = (
  player: PlayerState,
  followDistance: number = BALL_FOLLOW_DISTANCE
): Position => ({
  x: player.x + player.facing.x * followDistance,
  y: player.y + player.facing.y * followDistance
});

export const syncBallWithPossession = (
  ball: BallState,
  possession: PossessionState,
  player: PlayerState
): BallState => {
  if (!hasPlayerPossession(possession)) {
    return ball;
  }

  return {
    ...ball,
    ...getBallFollowPosition(player),
    velocityX: 0,
    velocityY: 0
  };
};

export const releasePlayerPossession = (possession: PossessionState): PossessionState => ({
  ...possession,
  owner: null
});

export const canPlayerRecoverBall = (
  player: PlayerState,
  ball: BallState,
  recoveryDistance: number = BALL_RECOVERY_DISTANCE
): boolean => {
  const distance = Math.hypot(player.x - ball.x, player.y - ball.y);

  return distance <= recoveryDistance;
};

export const updatePlayerPossession = (
  possession: PossessionState,
  player: PlayerState,
  ball: BallState
): PossessionState => {
  if (hasPlayerPossession(possession)) {
    return possession;
  }

  return canPlayerRecoverBall(player, ball)
    ? {
      owner: "player"
    }
    : possession;
};
