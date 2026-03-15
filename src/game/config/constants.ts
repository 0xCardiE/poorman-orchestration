/** Pitch dimensions in world units (centered in 800x600) */
export const PITCH_WIDTH = 700;
export const PITCH_HEIGHT = 500;
export const PITCH_MARGIN_X = (800 - PITCH_WIDTH) / 2;
export const PITCH_MARGIN_Y = (600 - PITCH_HEIGHT) / 2;

export const PLAYER_RADIUS = 16;
export const PLAYER_SPEED = 200;
export const PLAYER_ACCELERATION = 800;
export const PLAYER_DECELERATION = 600;
export const PLAYER_TURN_DAMP = 0.92;

export const STAMINA_MAX = 100;
export const STAMINA_DRAIN_PER_SEC = 25;
export const STAMINA_RECOVERY_PER_SEC = 15;
export const SPRINT_SPEED_MULT = 1.5;
export const EXHAUSTED_SPEED_MULT = 0.5;
export const STAMINA_EXHAUSTED_THRESHOLD = 15;

export const DRIBBLE_SPEED_MULT = 0.7;
export const DRIBBLE_BALL_OFFSET = 12;

export const BALL_RADIUS = 10;
export const POSSESSION_DISTANCE = 28;
export const PASS_SPEED = 350;
export const PASS_SPEED_LONG = 480;
export const LOB_SPEED = 280;
export const THROUGH_BALL_LEAD = 80;
export const SHOOT_SPEED = 550;
export const SHOOT_SPEED_MAX_CHARGED = 720;
export const SHOOT_CHARGE_TIME_MS = 600;
export const FINESSE_SPEED_MULT = 0.75;
export const BALL_GROUND_DRAG = 80;
export const BALL_AIR_DRAG = 40;
export const BALL_BOUNCE_DAMP = 0.72;
export const BALL_SPIN_CURVE_STRENGTH = 0.015;
export const FIRST_TOUCH_DIST_MAX = 25;
export const CONTROL_STAT_DEFAULT = 0.8;

export const OPPONENT_SPEED = 120;
export const OPPONENT_PRESS_DIST = 180;
export const OPPONENT_TACKLE_RANGE = 28;
export const TACKLE_RANGE = 26;
export const TACKLE_COOLDOWN_MS = 400;
export const FOUL_PROBABILITY = 0.25;

export const GOAL_WIDTH = 80;
export const GOAL_TOP = PITCH_MARGIN_Y + PITCH_HEIGHT / 2 - GOAL_WIDTH / 2;
export const GOAL_BOTTOM = PITCH_MARGIN_Y + PITCH_HEIGHT / 2 + GOAL_WIDTH / 2;
export const GOAL_LINE_OFFSET = 4;
export const GOAL_DEPTH = 20;
export const GOAL_KICK_DIST = 30;
export const MATCH_DURATION_SEC = 90;
export const HALF_DURATION_SEC = 45;
export const STOPPAGE_TIME_MIN = 0;
export const STOPPAGE_TIME_MAX = 3;
export const SET_PIECE_AIM_SPEED = 2;
export const SET_PIECE_POWER_MAX = 1;

export const KEEPER_SPEED = 200;
export const KEEPER_REACTION_DELAY_MS = 180;
export const KEEPER_SAVE_RADIUS = 45;
export const KEEPER_DIFFICULTY_EASY = 0.6;
export const KEEPER_DIFFICULTY_MEDIUM = 0.85;
export const KEEPER_DIFFICULTY_HARD = 1;

export const TEAM_SIZE = 5;
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

/** Post-goal replay: how long to record (ms) and interval between snapshots */
export const REPLAY_RECORD_SEC = 5;
export const REPLAY_SNAPSHOT_INTERVAL_MS = 80;
/** How long the replay plays back (ms); can be less than recorded for faster replay */
export const REPLAY_PLAYBACK_MS = 4000;
