import { PLAYER_SPEED } from "../config/player";
import { PITCH_BOUNDS } from "../config/pitch";
import type { PlayerState } from "../entities/player";

export type MovementBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type PlayerMovementInput = {
  down: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
};

export type MovementVector = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getPlayerMovementVector = (input: PlayerMovementInput): MovementVector => {
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);

  if (horizontal === 0 && vertical === 0) {
    return { x: 0, y: 0 };
  }

  const magnitude = Math.hypot(horizontal, vertical);

  return {
    x: horizontal / magnitude,
    y: vertical / magnitude
  };
};

export const clampPlayerToBounds = (
  player: PlayerState,
  bounds: MovementBounds = PITCH_BOUNDS
): PlayerState => ({
  ...player,
  x: clamp(player.x, bounds.x + player.radius, bounds.x + bounds.width - player.radius),
  y: clamp(player.y, bounds.y + player.radius, bounds.y + bounds.height - player.radius)
});

export const getNextPlayerState = (
  player: PlayerState,
  input: PlayerMovementInput,
  deltaMs: number,
  bounds: MovementBounds = PITCH_BOUNDS,
  speed: number = PLAYER_SPEED
): PlayerState => {
  const direction = getPlayerMovementVector(input);
  const distance = speed * (deltaMs / 1000);

  return clampPlayerToBounds(
    {
      ...player,
      x: player.x + direction.x * distance,
      y: player.y + direction.y * distance
    },
    bounds
  );
};
