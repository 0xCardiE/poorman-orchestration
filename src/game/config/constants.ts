export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;

export const PITCH = {
  x: 50,
  y: 50,
  width: 700,
  height: 400,
  lineColor: 0xffffff,
  fillColor: 0x2d8a4e,
  lineWidth: 2,
};

export const GOAL = {
  width: 10,
  height: 100,
  color: 0xffffff,
};

export const PLAYER = {
  radius: 14,
  color: 0x3498db,
  speed: 200,
  possessionRange: 20,
};

export const OPPONENT = {
  radius: 14,
  color: 0xe74c3c,
  speed: 150,
  chaseRange: 250,
  possessionRange: 20,
};

export const BALL = {
  radius: 8,
  color: 0xffffff,
  friction: 0.98,
  passSpeed: 350,
  shootSpeed: 550,
  stopThreshold: 5,
};

export const MATCH = {
  durationSeconds: 90,
  kickoffDelaySec: 1.5,
  timerWarnSec: 10,
};
