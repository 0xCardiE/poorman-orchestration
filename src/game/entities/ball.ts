export type CircularEntityState = {
  radius: number;
  x: number;
  y: number;
};

export const createBallState = (): CircularEntityState => ({
  x: 420,
  y: 270,
  radius: 8
});
