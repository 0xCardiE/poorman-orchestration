export type CircularEntityState = {
  radius: number;
  x: number;
  y: number;
};

export const createPlayerState = (): CircularEntityState => ({
  x: 320,
  y: 270,
  radius: 18
});

export const createBallState = (): CircularEntityState => ({
  x: 420,
  y: 270,
  radius: 8
});
