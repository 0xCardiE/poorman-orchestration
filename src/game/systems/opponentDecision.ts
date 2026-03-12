import {
  OPPONENT_ATTACK_TARGET,
  OPPONENT_HOME_POSITION,
  OPPONENT_RETREAT_LINE_X,
  OPPONENT_SHOOT_ALIGNMENT_TOLERANCE,
  OPPONENT_SHOOT_RANGE_X
} from "../config/opponent";
import { GOAL, PITCH_BOUNDS } from "../config/pitch";
import type { OpponentState } from "../entities/opponent";
import { getGoalVerticalBounds } from "./matchRules";
import type { MovementBounds } from "./playerMovement";

export type OpponentTarget = {
  x: number;
  y: number;
};

export type OpponentPossessionAction = "carry" | "retreat" | "shoot";

export const getLeftGoalTarget = (
  pitchBounds: MovementBounds = PITCH_BOUNDS,
  goalWidth: number = GOAL.width
): OpponentTarget => {
  const goalBounds = getGoalVerticalBounds(pitchBounds, {
    depth: GOAL.depth,
    width: goalWidth
  });

  return {
    x: pitchBounds.x,
    y: goalBounds.top + goalWidth / 2
  };
};

export const getOpponentCarryTarget = (
  opponent: OpponentState,
  attackTarget: OpponentTarget = OPPONENT_ATTACK_TARGET,
  goalTarget: OpponentTarget = getLeftGoalTarget()
): OpponentTarget => ({
  x: Math.min(opponent.x, attackTarget.x),
  y: goalTarget.y
});

export const decideOpponentPossessionAction = (
  opponent: OpponentState,
  retreatLineX: number = OPPONENT_RETREAT_LINE_X,
  shootRangeX: number = OPPONENT_SHOOT_RANGE_X,
  shootAlignmentTolerance: number = OPPONENT_SHOOT_ALIGNMENT_TOLERANCE,
  goalTarget: OpponentTarget = getLeftGoalTarget()
): OpponentPossessionAction => {
  if (opponent.x > retreatLineX) {
    return "retreat";
  }

  if (
    opponent.x <= shootRangeX &&
    Math.abs(opponent.y - goalTarget.y) <= shootAlignmentTolerance
  ) {
    return "shoot";
  }

  return "carry";
};

export const getOpponentPossessionTarget = (
  opponent: OpponentState,
  homePosition: OpponentTarget = OPPONENT_HOME_POSITION,
  attackTarget: OpponentTarget = OPPONENT_ATTACK_TARGET
): OpponentTarget => {
  const action = decideOpponentPossessionAction(opponent);

  if (action === "retreat") {
    return homePosition;
  }

  if (action === "carry") {
    return getOpponentCarryTarget(opponent, attackTarget);
  }

  return {
    x: opponent.x,
    y: opponent.y
  };
};
