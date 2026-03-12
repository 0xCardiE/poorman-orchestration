import { PLAYER_RADIUS, PLAYER_START_POSITION } from "../config/player";

export type PlayerState = {
  radius: number;
  x: number;
  y: number;
};

export const createPlayerState = (): PlayerState => ({
  x: PLAYER_START_POSITION.x,
  y: PLAYER_START_POSITION.y,
  radius: PLAYER_RADIUS
});
