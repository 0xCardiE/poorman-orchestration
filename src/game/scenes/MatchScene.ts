import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { MATCH_DURATION_SECONDS } from "../config/match";
import { OPPONENT_SPEED } from "../config/opponent";
import { MAIN_MENU_SCENE_KEY, MATCH_SCENE_KEY } from "../config/sceneKeys";
import type { BallState } from "../entities/ball";
import { createBallState } from "../entities/ball";
import type { MatchState } from "../entities/match";
import { createMatchState } from "../entities/match";
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
import {
  awardGoal,
  formatMatchClock,
  getGoalScorer,
  getMatchResultText,
  getPlayableDeltaMs,
  tickMatchClock
} from "../systems/matchRules";
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
  private endOverlay?: Phaser.GameObjects.Rectangle;
  private matchState?: MatchState;
  private menuButton?: Phaser.GameObjects.Container;
  private opponentSprite?: Phaser.GameObjects.Arc;
  private opponentState?: OpponentState;
  private playerControls: PlayerControls | null = null;
  private playerSprite?: Phaser.GameObjects.Arc;
  private playerState?: PlayerState;
  private possessionState?: PossessionState;
  private restartButton?: Phaser.GameObjects.Container;
  private restartPromptText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;

  constructor() {
    super(MATCH_SCENE_KEY);
  }

  create(): void {
    drawPitch(this);

    this.matchState = createMatchState(MATCH_DURATION_SECONDS);
    this.setupKickoff();
    this.createSprites();
    this.playerControls = createPlayerControls(this);
    this.createHud();
    this.refreshHud();

    this.input.keyboard?.on("keydown-ESC", this.returnToMenu, this);
    this.input.keyboard?.on("keydown-ENTER", this.restartMatch, this);
    this.input.keyboard?.on("keydown-R", this.restartMatch, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ESC", this.returnToMenu, this);
      this.input.keyboard?.off("keydown-ENTER", this.restartMatch, this);
      this.input.keyboard?.off("keydown-R", this.restartMatch, this);
    });
  }

  update(_time: number, delta: number): void {
    if (
      !this.ballSprite ||
      !this.ballState ||
      !this.matchState ||
      !this.opponentSprite ||
      !this.opponentState ||
      !this.playerState ||
      !this.playerSprite ||
      !this.possessionState
    ) {
      return;
    }

    const playableDelta = getPlayableDeltaMs(this.matchState, delta);

    if (playableDelta === 0) {
      this.refreshHud();
      return;
    }

    const actionInput = readPlayerActionInput(this.playerControls);
    let scoringSide: "opponent" | "player" | null = null;

    this.playerState = getNextPlayerState(
      this.playerState,
      readPlayerMovementInput(this.playerControls),
      playableDelta
    );

    this.opponentState = getNextPlayerState(
      this.opponentState,
      getOpponentMovementInput(
        this.opponentState,
        this.possessionState,
        this.playerState,
        this.ballState
      ),
      playableDelta,
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
      this.ballState = updateBallMotion(this.ballState, playableDelta);
      scoringSide = getGoalScorer(this.ballState);
    }

    if (scoringSide) {
      this.matchState = awardGoal(this.matchState, scoringSide);
      this.setupKickoff();
    } else {
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
    }

    this.matchState = tickMatchClock(this.matchState, playableDelta);
    this.refreshHud();

    syncPlayerSprite(this.playerSprite, this.playerState);
    syncOpponentSprite(this.opponentSprite, this.opponentState);
    syncBallSprite(this.ballSprite, this.ballState);
  }

  private createHud(): void {
    this.scoreText = this.add.text(24, 18, "", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "28px",
      fontStyle: "bold"
    });

    this.timerText = this.add.text(GAME_WIDTH / 2, 22, "", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "26px",
      fontStyle: "bold"
    }).setOrigin(0.5, 0);

    this.statusText = this.add.text(24, 54, "", {
      color: "#d9e6c3",
      fontFamily: "Trebuchet MS",
      fontSize: "18px"
    });

    this.add.text(
      GAME_WIDTH - 24,
      18,
      "Move: WASD / Arrows\nPass: Space\nShoot: Shift\nMenu: Esc",
      {
        align: "right",
        color: "#d9e6c3",
        fontFamily: "Trebuchet MS",
        fontSize: "16px"
      }
    ).setOrigin(1, 0);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 18,
      "Score in the right goal. Press Esc for the menu.",
      {
        color: "#f4f1de",
        fontFamily: "Trebuchet MS",
        fontSize: "16px"
      }
    ).setOrigin(0.5, 1);

    this.endOverlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      420,
      220,
      0x10281a,
      0.94
    ).setStrokeStyle(2, 0xf4f1de, 0.35).setDepth(10).setVisible(false);

    this.restartPromptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "", {
      align: "center",
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "28px",
      fontStyle: "bold"
    }).setDepth(11).setOrigin(0.5);

    this.restartButton = this.createOverlayButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 56,
      "Restart Match",
      this.restartMatch
    );
    this.menuButton = this.createOverlayButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 122,
      "Main Menu",
      this.returnToMenu
    );
  }

  private createSprites(): void {
    if (!this.ballState || !this.opponentState || !this.playerState) {
      return;
    }

    this.ballSprite = createBallSprite(this, this.ballState);
    this.playerSprite = createPlayerSprite(this, this.playerState);
    this.opponentSprite = createOpponentSprite(this, this.opponentState);
  }

  private refreshHud(): void {
    if (!this.matchState) {
      return;
    }

    this.scoreText?.setText(`You ${this.matchState.playerScore} - ${this.matchState.opponentScore} Opponent`);
    this.timerText?.setText(formatMatchClock(this.matchState.remainingMs));
    this.statusText?.setText(this.getStatusText());

    if (this.matchState.phase === "finished") {
      this.restartPromptText?.setText(
        `${getMatchResultText(this.matchState)}\nFinal Score ${this.matchState.playerScore} - ${this.matchState.opponentScore}\nPress Enter or R to restart`
      );
      this.setEndOverlayVisible(true);

      return;
    }

    this.restartPromptText?.setText("");
    this.setEndOverlayVisible(false);
  }

  private restartMatch(): void {
    if (!this.matchState || this.matchState.phase !== "finished") {
      return;
    }

    this.matchState = createMatchState(MATCH_DURATION_SECONDS);
    this.setupKickoff();
    this.refreshHud();
  }

  private setupKickoff(): void {
    this.playerState = createPlayerState();
    this.opponentState = createOpponentState();
    this.possessionState = createInitialPossessionState();
    this.ballState = syncBallWithPossession(
      createBallState(this.playerState),
      this.possessionState,
      this.playerState,
      this.opponentState
    );

    if (this.ballSprite && this.opponentSprite && this.playerSprite) {
      syncPlayerSprite(this.playerSprite, this.playerState);
      syncOpponentSprite(this.opponentSprite, this.opponentState);
      syncBallSprite(this.ballSprite, this.ballState);
    }
  }

  private returnToMenu(): void {
    this.scene.start(MAIN_MENU_SCENE_KEY);
  }

  private createOverlayButton(
    x: number,
    y: number,
    label: string,
    onPress: () => void
  ): Phaser.GameObjects.Container {
    const background = this.add.rectangle(0, 0, 220, 48, 0xf4f1de);
    const text = this.add.text(0, 0, label, {
      color: "#123524",
      fontFamily: "Trebuchet MS",
      fontSize: "22px",
      fontStyle: "bold"
    }).setOrigin(0.5);

    const button = this.add.container(x, y, [background, text])
      .setDepth(11)
      .setSize(220, 48)
      .setVisible(false);

    button.setInteractive({ useHandCursor: true });
    button.on("pointerup", onPress, this);

    return button;
  }

  private getStatusText(): string {
    if (!this.matchState) {
      return "";
    }

    if (this.matchState.phase === "finished") {
      return "Status: Full time";
    }

    if (!this.possessionState || this.possessionState.owner === null) {
      return "Status: Loose ball";
    }

    return this.possessionState.owner === "player"
      ? "Status: You have possession"
      : "Status: Opponent has possession";
  }

  private setEndOverlayVisible(visible: boolean): void {
    this.endOverlay?.setVisible(visible);
    this.restartButton?.setVisible(visible);
    this.menuButton?.setVisible(visible);

    if (this.restartButton?.input) {
      this.restartButton.input.enabled = visible;
    }

    if (this.menuButton?.input) {
      this.menuButton.input.enabled = visible;
    }
  }
}
