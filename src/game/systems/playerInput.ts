import type { PlayerMovementInput } from "./playerMovement";

export type PlayerActionInput = {
  pass: boolean;
  shoot: boolean;
};

const EMPTY_MOVEMENT_INPUT: PlayerMovementInput = {
  down: false,
  left: false,
  right: false,
  up: false
};

const EMPTY_ACTION_INPUT: PlayerActionInput = {
  pass: false,
  shoot: false
};

export const getEmptyMovementInput = (): PlayerMovementInput => ({
  ...EMPTY_MOVEMENT_INPUT
});

export const getEmptyActionInput = (): PlayerActionInput => ({
  ...EMPTY_ACTION_INPUT
});

export const mergePlayerMovementInput = (
  primary: PlayerMovementInput,
  secondary: PlayerMovementInput = EMPTY_MOVEMENT_INPUT
): PlayerMovementInput => ({
  up: primary.up || secondary.up,
  down: primary.down || secondary.down,
  left: primary.left || secondary.left,
  right: primary.right || secondary.right
});

export const mergePlayerActionInput = (
  primary: PlayerActionInput,
  secondary: PlayerActionInput = EMPTY_ACTION_INPUT
): PlayerActionInput => ({
  pass: primary.pass || secondary.pass,
  shoot: primary.shoot || secondary.shoot
});
