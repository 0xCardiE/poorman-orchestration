import { GAME_HEIGHT, GAME_WIDTH } from "./dimensions";

export const PITCH_BACKGROUND_COLOR = 0x2b8a3e;
export const PITCH_LINE_COLOR = 0xf7f7e8;
export const PITCH_GRASS_COLOR = 0x349d4e;

export const PITCH_BOUNDS = {
  x: 36,
  y: 36,
  width: GAME_WIDTH - 72,
  height: GAME_HEIGHT - 72
} as const;

export const CENTER_CIRCLE_RADIUS = 64;

export const PENALTY_AREA = {
  depth: 132,
  width: 220
} as const;

export const GOAL_AREA = {
  depth: 56,
  width: 120
} as const;

export const GOAL = {
  depth: 18,
  width: 120
} as const;
