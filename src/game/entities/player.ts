import {
  PLAYER_DEFAULT_FACING,
  PLAYER_RADIUS,
  PLAYER_START_POSITION
} from "../config/player";

export type FacingDirection = {
  x: number;
  y: number;
};

export type PlayerState = {
  facing: FacingDirection;
  radius: number;
  x: number;
  y: number;
};

export const createPlayerState = (): PlayerState => ({
  facing: { ...PLAYER_DEFAULT_FACING },
  x: PLAYER_START_POSITION.x,
  y: PLAYER_START_POSITION.y,
  radius: PLAYER_RADIUS
});
