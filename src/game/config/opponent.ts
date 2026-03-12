import { GAME_HEIGHT, GAME_WIDTH } from "./dimensions";
import { PLAYER_RADIUS } from "./player";

export const OPPONENT_RADIUS = PLAYER_RADIUS;
export const OPPONENT_SPEED = 220;
export const OPPONENT_FILL_COLOR = 0xdc2626;
export const OPPONENT_STROKE_COLOR = 0xfef2f2;
export const OPPONENT_STROKE_WIDTH = 3;

export const OPPONENT_START_POSITION = {
  x: GAME_WIDTH - 220,
  y: GAME_HEIGHT / 2
} as const;

export const OPPONENT_DEFAULT_FACING = {
  x: -1,
  y: 0
} as const;

export const OPPONENT_HOME_POSITION = {
  x: GAME_WIDTH - 240,
  y: GAME_HEIGHT / 2
} as const;

export const OPPONENT_TARGET_TOLERANCE = 12;
