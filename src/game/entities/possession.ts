export type PossessionOwner = "opponent" | "player" | null;

export type PossessionState = {
  owner: PossessionOwner;
};

export const createInitialPossessionState = (): PossessionState => ({
  owner: "player"
});
