import type { PlayerState } from "./player";
import {
  OPPONENT_DEFAULT_FACING,
  OPPONENT_RADIUS,
  OPPONENT_START_POSITION
} from "../config/opponent";

export type OpponentState = PlayerState;

export const createOpponentState = (): OpponentState => ({
  facing: { ...OPPONENT_DEFAULT_FACING },
  x: OPPONENT_START_POSITION.x,
  y: OPPONENT_START_POSITION.y,
  radius: OPPONENT_RADIUS
});
