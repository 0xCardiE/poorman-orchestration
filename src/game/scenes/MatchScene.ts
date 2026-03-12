import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { OPPONENT_SPEED } from "../config/opponent";
import { MAIN_MENU_SCENE_KEY, MATCH_SCENE_KEY } from "../config/sceneKeys";
import type { BallState } from "../entities/ball";
import { createBallState } from "../entities/ball";
import type { OpponentState } from "../entities/opponent";
import { createOpponentState } from "../entities/opponent";
import type { PlayerState } from "../entities/player";
import { createPlayerState } from "../entities/player";
import type { PossessionState } from "../entities/possession";
import { createInitialPossessionState } from "../entities/possession";
import { createPassedBall, createShotBall, updateBallMotion } from "../systems/ballMotion";
import {
  hasPlayerPossession,
  releasePlayerPossession,
  syncBallWithPossession,
  updatePossession
} from "../systems/ballPossession";
import { createBallSprite, syncBallSprite } from "../systems/ballRenderer";
import { drawPitch } from "../systems/drawPitch";
import { getOpponentMovementInput } from "../systems/opponentAi";
import { createOpponentSprite, syncOpponentSprite } from "../systems/opponentRenderer";
import {
  createPlayerControls,
  readPlayerActionInput,
  readPlayerMovementInput,
  type PlayerControls
} from "../systems/playerControls";
import { getNextPlayerState } from "../systems/playerMovement";
import { createPlayerSprite, syncPlayerSprite } from "../systems/playerRenderer";

export class MatchScene extends Phaser.Scene {
  private ballSprite?: Phaser.GameObjects.Arc;
  private ballState?: BallState;
  private opponentSprite?: Phaser.GameObjects.Arc;
  private opponentState?: OpponentState;
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
    this.opponentState = createOpponentState();
    this.possessionState = createInitialPossessionState();
    this.ballState = syncBallWithPossession(
      createBallState(this.playerState),
      this.possessionState,
      this.playerState,
      this.opponentState
    );
    this.ballSprite = createBallSprite(this, this.ballState);
    this.playerSprite = createPlayerSprite(this, this.playerState);
    this.opponentSprite = createOpponentSprite(this, this.opponentState);
    this.playerControls = createPlayerControls(this);

    this.add.text(24, 14, "Match Scene", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      fontStyle: "bold"
    });

    this.add.text(24, 46, "Move with Arrow Keys or WASD. Pass: Space. Shoot: Shift.", {
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
      !this.opponentSprite ||
      !this.opponentState ||
      !this.playerState ||
      !this.playerSprite ||
      !this.possessionState
    ) {
      return;
    }

    const actionInput = readPlayerActionInput(this.playerControls);

    this.playerState = getNextPlayerState(
      this.playerState,
      readPlayerMovementInput(this.playerControls),
      delta
    );

    this.opponentState = getNextPlayerState(
      this.opponentState,
      getOpponentMovementInput(
        this.opponentState,
        this.possessionState,
        this.playerState,
        this.ballState
      ),
      delta,
      undefined,
      OPPONENT_SPEED
    );

    if (hasPlayerPossession(this.possessionState)) {
      const attachedBall = syncBallWithPossession(
        this.ballState,
        this.possessionState,
        this.playerState,
        this.opponentState
      );

      if (actionInput.shoot) {
        this.possessionState = releasePlayerPossession(this.possessionState);
        this.ballState = createShotBall(attachedBall, this.playerState.facing);
      } else if (actionInput.pass) {
        this.possessionState = releasePlayerPossession(this.possessionState);
        this.ballState = createPassedBall(attachedBall, this.playerState.facing);
      } else {
        this.ballState = attachedBall;
      }
    } else if (this.possessionState.owner === "opponent") {
      this.ballState = syncBallWithPossession(
        this.ballState,
        this.possessionState,
        this.playerState,
        this.opponentState
      );
    } else {
      this.ballState = updateBallMotion(this.ballState, delta);
    }

    this.possessionState = updatePossession(
      this.possessionState,
      this.playerState,
      this.opponentState,
      this.ballState
    );
    this.ballState = syncBallWithPossession(
      this.ballState,
      this.possessionState,
      this.playerState,
      this.opponentState
    );

    syncPlayerSprite(this.playerSprite, this.playerState);
    syncOpponentSprite(this.opponentSprite, this.opponentState);
    syncBallSprite(this.ballSprite, this.ballState);
  }

  private returnToMenu(): void {
    this.scene.start(MAIN_MENU_SCENE_KEY);
  }
}
