import Phaser from "phaser";
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
  releasePossession,
  syncBallWithPossession,
  updatePossession
} from "../systems/ballPossession";
import { createBallSprite, syncBallSprite } from "../systems/ballRenderer";
import { drawPitch } from "../systems/drawPitch";
import {
  createFullTimeOverlay,
  hideFullTimeOverlay,
  showFullTimeOverlay,
  type FullTimeOverlay
} from "../systems/fullTimeOverlay";
import {
  advanceMatchState,
  beginKickoff,
  awardGoal,
  getGoalScorer,
  tickMatchClock
} from "../systems/matchRules";
import { createMatchHud, refreshMatchHud, type MatchHud } from "../systems/matchHud";
import { getOpponentMovementInput } from "../systems/opponentAi";
import {
  decideOpponentPossessionAction,
  getLeftGoalTarget
} from "../systems/opponentDecision";
import { createOpponentSprite, syncOpponentSprite } from "../systems/opponentRenderer";
import {
  createPlayerControls,
  readPlayerActionInput,
  readPlayerMovementInput,
  type PlayerControls
} from "../systems/playerControls";
import {
  mergePlayerActionInput,
  mergePlayerMovementInput
} from "../systems/playerInput";
import { getNextPlayerState } from "../systems/playerMovement";
import { createPlayerSprite, syncPlayerSprite } from "../systems/playerRenderer";
import {
  createTouchControls,
  type TouchControls
} from "../systems/touchControls";

export class MatchScene extends Phaser.Scene {
  private ballSprite?: Phaser.GameObjects.Arc;
  private ballState?: BallState;
  private fullTimeOverlay?: FullTimeOverlay;
  private hud?: MatchHud;
  private matchState?: MatchState;
  private opponentSprite?: Phaser.GameObjects.Arc;
  private opponentState?: OpponentState;
  private playerControls: PlayerControls | null = null;
  private playerSprite?: Phaser.GameObjects.Arc;
  private playerState?: PlayerState;
  private possessionState?: PossessionState;
  private touchControls: TouchControls | null = null;

  constructor() {
    super(MATCH_SCENE_KEY);
  }

  create(): void {
    drawPitch(this);

    this.matchState = createMatchState(MATCH_DURATION_SECONDS);
    this.setupKickoff();
    this.createSprites();
    this.playerControls = createPlayerControls(this);
    this.touchControls = createTouchControls(this.game.canvas.parentElement, {
      onMenu: () => this.returnToMenu()
    });
    this.hud = createMatchHud(this, {
      touchControlsEnabled: this.touchControls !== null
    });
    this.fullTimeOverlay = createFullTimeOverlay(this, {
      onMenu: () => this.returnToMenu(),
      onRestart: () => this.restartMatch()
    });
    this.refreshHud();

    this.input.keyboard?.on("keydown-ESC", this.returnToMenu, this);
    this.input.keyboard?.on("keydown-ENTER", this.restartMatch, this);
    this.input.keyboard?.on("keydown-R", this.restartMatch, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ESC", this.returnToMenu, this);
      this.input.keyboard?.off("keydown-ENTER", this.restartMatch, this);
      this.input.keyboard?.off("keydown-R", this.restartMatch, this);
      this.touchControls?.destroy();
      this.touchControls = null;
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

    const matchAdvance = advanceMatchState(this.matchState, delta);
    this.matchState = matchAdvance.match;
    const playableDelta = matchAdvance.playableDeltaMs;

    if (playableDelta === 0) {
      void mergePlayerActionInput(
        readPlayerActionInput(this.playerControls),
        this.touchControls?.readActionInput()
      );
      this.refreshHud();
      return;
    }

    const actionInput = mergePlayerActionInput(
      readPlayerActionInput(this.playerControls),
      this.touchControls?.readActionInput()
    );
    let scoringSide: "opponent" | "player" | null = null;

    this.playerState = getNextPlayerState(
      this.playerState,
      mergePlayerMovementInput(
        readPlayerMovementInput(this.playerControls),
        this.touchControls?.readMovementInput()
      ),
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
        this.possessionState = releasePossession(this.possessionState);
        this.ballState = createShotBall(attachedBall, this.playerState.facing);
      } else if (actionInput.pass) {
        this.possessionState = releasePossession(this.possessionState);
        this.ballState = createPassedBall(attachedBall, this.playerState.facing);
      } else {
        this.ballState = attachedBall;
      }
    } else if (this.possessionState.owner === "opponent") {
      const attachedBall = syncBallWithPossession(
        this.ballState,
        this.possessionState,
        this.playerState,
        this.opponentState
      );

      if (decideOpponentPossessionAction(this.opponentState) === "shoot") {
        const goalTarget = getLeftGoalTarget();
        const deltaX = goalTarget.x - this.opponentState.x;
        const deltaY = goalTarget.y - this.opponentState.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;

        this.possessionState = releasePossession(this.possessionState);
        this.ballState = createShotBall(attachedBall, {
          x: deltaX / distance,
          y: deltaY / distance
        });
      } else {
        this.ballState = attachedBall;
      }
    } else {
      this.ballState = updateBallMotion(this.ballState, playableDelta);
      scoringSide = getGoalScorer(this.ballState);
    }

    if (scoringSide) {
      const scoredMatch = tickMatchClock(
        awardGoal(this.matchState, scoringSide),
        playableDelta
      );

      if (scoredMatch.phase === "finished") {
        this.matchState = scoredMatch;
      } else {
        this.matchState = beginKickoff(scoredMatch);
        this.setupKickoff();
      }
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

      this.matchState = tickMatchClock(this.matchState, playableDelta);
    }
    this.refreshHud();

    syncPlayerSprite(this.playerSprite, this.playerState);
    syncOpponentSprite(this.opponentSprite, this.opponentState);
    syncBallSprite(this.ballSprite, this.ballState);
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
    if (!this.fullTimeOverlay || !this.hud || !this.matchState) {
      return;
    }

    refreshMatchHud(this.hud, this.matchState, this.possessionState);
    this.touchControls?.setVisible(this.matchState.phase !== "finished");

    if (this.matchState.phase === "finished") {
      showFullTimeOverlay(this.fullTimeOverlay, this.matchState);

      return;
    }

    hideFullTimeOverlay(this.fullTimeOverlay);
  }

  private restartMatch(): void {
    if (!this.matchState || this.matchState.phase !== "finished") {
      return;
    }

    this.matchState = createMatchState(MATCH_DURATION_SECONDS);
    this.setupKickoff();
    this.refreshHud();
  }

  private returnToMenu(): void {
    this.scene.start(MAIN_MENU_SCENE_KEY);
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
}
