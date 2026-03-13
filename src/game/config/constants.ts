/** Pitch dimensions in world units (centered in 800x600) */
export const PITCH_WIDTH = 700;
export const PITCH_HEIGHT = 500;
export const PITCH_MARGIN_X = (800 - PITCH_WIDTH) / 2;
export const PITCH_MARGIN_Y = (600 - PITCH_HEIGHT) / 2;

export const PLAYER_RADIUS = 16;
export const PLAYER_SPEED = 200;

export const BALL_RADIUS = 10;
export const POSSESSION_DISTANCE = 28;
export const PASS_SPEED = 350;
export const SHOOT_SPEED = 550;
export const OPPONENT_SPEED = 120;

export const GOAL_WIDTH = 80;
export const GOAL_TOP = PITCH_MARGIN_Y + PITCH_HEIGHT / 2 - GOAL_WIDTH / 2;
export const GOAL_BOTTOM = PITCH_MARGIN_Y + PITCH_HEIGHT / 2 + GOAL_WIDTH / 2;
export const MATCH_DURATION_SEC = 90;
