import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { MAIN_MENU_SCENE_KEY, MATCH_SCENE_KEY } from "../config/sceneKeys";
import type { BallState } from "../entities/ball";
import { createBallState } from "../entities/ball";
import type { PlayerState } from "../entities/player";
import { createPlayerState } from "../entities/player";
import type { PossessionState } from "../entities/possession";
import { createInitialPossessionState } from "../entities/possession";
import { syncBallWithPossession } from "../systems/ballPossession";
import { createBallSprite, syncBallSprite } from "../systems/ballRenderer";
import { drawPitch } from "../systems/drawPitch";
import { createPlayerControls, readPlayerMovementInput, type PlayerControls } from "../systems/playerControls";
import { getNextPlayerState } from "../systems/playerMovement";
import { createPlayerSprite, syncPlayerSprite } from "../systems/playerRenderer";

export class MatchScene extends Phaser.Scene {
  private ballSprite?: Phaser.GameObjects.Arc;
  private ballState?: BallState;
  private playerControls: PlayerControls | null = null;
  private playerSprite?: Phaser.GameObjects.Arc;
  private playerState?: PlayerState;
  private possessionState?: PossessionState;

  constructor() {
    super(MATCH_SCENE_KEY);
  }

  create(): void {
    drawPitch(this);

    this.playerState = createPlayerState();
    this.possessionState = createInitialPossessionState();
    this.ballState = syncBallWithPossession(
      createBallState(this.playerState),
      this.possessionState,
      this.playerState
    );
    this.ballSprite = createBallSprite(this, this.ballState);
    this.playerSprite = createPlayerSprite(this, this.playerState);
    this.playerControls = createPlayerControls(this);

    this.add.text(24, 14, "Match Scene", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      fontStyle: "bold"
    });

    this.add.text(24, 46, "Move with Arrow Keys or WASD.", {
      color: "#d9e6c3",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, "Press Esc to return to the menu", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    }).setOrigin(0.5, 1);

    this.input.keyboard?.on("keydown-ESC", this.returnToMenu, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ESC", this.returnToMenu, this);
    });
  }

  update(_time: number, delta: number): void {
    if (
      !this.ballSprite ||
      !this.ballState ||
      !this.playerState ||
      !this.playerSprite ||
      !this.possessionState
    ) {
      return;
    }

    this.playerState = getNextPlayerState(
      this.playerState,
      readPlayerMovementInput(this.playerControls),
      delta
    );
    this.ballState = syncBallWithPossession(
      this.ballState,
      this.possessionState,
      this.playerState
    );

    syncPlayerSprite(this.playerSprite, this.playerState);
    syncBallSprite(this.ballSprite, this.ballState);
  }

  private returnToMenu(): void {
    this.scene.start(MAIN_MENU_SCENE_KEY);
  }
}
