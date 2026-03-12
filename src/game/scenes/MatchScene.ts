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
  private matchState?: MatchState;
  private opponentSprite?: Phaser.GameObjects.Arc;
  private opponentState?: OpponentState;
  private playerControls: PlayerControls | null = null;
  private playerSprite?: Phaser.GameObjects.Arc;
  private playerState?: PlayerState;
  private possessionState?: PossessionState;
  private restartPromptText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
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

    this.add.text(24, 78, "Match Scene", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      fontStyle: "bold"
    });

    this.add.text(24, 110, "Move with Arrow Keys or WASD. Pass: Space. Shoot: Shift.", {
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

    if (this.matchState.phase === "finished") {
      this.refreshHud();
      return;
    }

    const actionInput = readPlayerActionInput(this.playerControls);
    let scoringSide: "opponent" | "player" | null = null;

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

    this.matchState = tickMatchClock(this.matchState, delta);
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

    this.restartPromptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "", {
      align: "center",
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "28px",
      fontStyle: "bold"
    }).setOrigin(0.5);
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

    if (this.matchState.phase === "finished") {
      this.restartPromptText?.setText(
        `${getMatchResultText(this.matchState)}\nPress Enter or R to restart`
      );

      return;
    }

    this.restartPromptText?.setText("");
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
}
