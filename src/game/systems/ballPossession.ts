import { BALL_FOLLOW_DISTANCE, BALL_RECOVERY_DISTANCE } from "../config/ball";
import type { BallState } from "../entities/ball";
import type { OpponentState } from "../entities/opponent";
import type { PlayerState } from "../entities/player";
import type { PossessionOwner, PossessionState } from "../entities/possession";

export type Position = {
  x: number;
  y: number;
};

export const hasOpponentPossession = (possession: PossessionState): boolean =>
  possession.owner === "opponent";

export const hasPlayerPossession = (possession: PossessionState): boolean =>
  possession.owner === "player";

export const hasAnyPossession = (possession: PossessionState): boolean =>
  possession.owner !== null;

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
  player: PlayerState,
  opponent: OpponentState
): BallState => {
  if (!hasAnyPossession(possession)) {
    return ball;
  }

  const carrier = hasPlayerPossession(possession) ? player : opponent;

  return {
    ...ball,
    ...getBallFollowPosition(carrier),
    velocityX: 0,
    velocityY: 0
  };
};

export const releasePossession = (possession: PossessionState): PossessionState => ({
  ...possession,
  owner: null
});

export const releasePlayerPossession = releasePossession;

export const canRecoverBall = (
  player: Position,
  ball: BallState,
  recoveryDistance: number = BALL_RECOVERY_DISTANCE
): boolean => {
  const distance = Math.hypot(player.x - ball.x, player.y - ball.y);

  return distance <= recoveryDistance;
};

export const canPlayerRecoverBall = (
  player: PlayerState,
  ball: BallState,
  recoveryDistance: number = BALL_RECOVERY_DISTANCE
): boolean => canRecoverBall(player, ball, recoveryDistance);

export const canOpponentRecoverBall = (
  opponent: OpponentState,
  ball: BallState,
  recoveryDistance: number = BALL_RECOVERY_DISTANCE
): boolean => canRecoverBall(opponent, ball, recoveryDistance);

const getDistanceToBall = (position: Position, ball: BallState): number =>
  Math.hypot(position.x - ball.x, position.y - ball.y);

export const getLooseBallRecoveryOwner = (
  player: PlayerState,
  opponent: OpponentState,
  ball: BallState,
  recoveryDistance: number = BALL_RECOVERY_DISTANCE
): PossessionOwner => {
  const playerCanRecover = canPlayerRecoverBall(player, ball, recoveryDistance);
  const opponentCanRecover = canOpponentRecoverBall(opponent, ball, recoveryDistance);

  if (playerCanRecover && opponentCanRecover) {
    return getDistanceToBall(player, ball) <= getDistanceToBall(opponent, ball)
      ? "player"
      : "opponent";
  }

  if (playerCanRecover) {
    return "player";
  }

  if (opponentCanRecover) {
    return "opponent";
  }

  return null;
};

export const updatePossession = (
  possession: PossessionState,
  player: PlayerState,
  opponent: OpponentState,
  ball: BallState
): PossessionState => {
  if (hasPlayerPossession(possession) && canOpponentRecoverBall(opponent, ball)) {
    return {
      owner: "opponent"
    };
  }

  if (hasOpponentPossession(possession) && canPlayerRecoverBall(player, ball)) {
    return {
      owner: "player"
    };
  }

  if (hasAnyPossession(possession)) {
    return possession;
  }

  const owner = getLooseBallRecoveryOwner(player, opponent, ball);

  return owner === null
    ? possession
    : {
      owner
    };
};
