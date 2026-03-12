import Phaser from 'phaser';
import {
  GAME_COLORS,
  GAME_SIZE,
  GOAL_BOUNDS,
  PITCH_BOUNDS,
  SCENE_KEYS,
} from '../config/gameConfig';
import {
  BALL_PASS_SPEED,
  BALL_SHOT_SPEED,
  OPPONENT_SHOT_SPEED,
} from '../config/matchConfig';
import { createInitialMatchState } from '../entities/createMatchState';
import type { MatchState, Vector2 } from '../entities/types';
import {
  attachBallToOwner,
  kickBall,
  tickPossessionCooldown,
  updateBallMotion,
  updatePossession,
} from '../systems/ballSystem';
import {
  checkGoal,
  formatClock,
  getResultLabel,
  resetAfterGoal,
  resolveBallBounds,
  tickClock,
} from '../systems/matchSystem';
import { getOpponentInput, shouldOpponentShoot } from '../systems/opponentSystem';
import { moveActor } from '../systems/playerSystem';

interface MatchKeys {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  pass: Phaser.Input.Keyboard.Key;
  shoot: Phaser.Input.Keyboard.Key;
  restart: Phaser.Input.Keyboard.Key;
  menu: Phaser.Input.Keyboard.Key;
  enter: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
}

export class MatchScene extends Phaser.Scene {
  private state: MatchState = createInitialMatchState();

  private keys?: MatchKeys;

  private playerSprite?: Phaser.GameObjects.Arc;

  private opponentSprite?: Phaser.GameObjects.Arc;

  private ballSprite?: Phaser.GameObjects.Arc;

  private scoreText?: Phaser.GameObjects.Text;

  private timerText?: Phaser.GameObjects.Text;

  private statusText?: Phaser.GameObjects.Text;

  private endText?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.match);
  }

  create(): void {
    this.state = createInitialMatchState();
    this.drawPitch();
    this.createActors();
    this.createHud();
    this.createControls();
    attachBallToOwner(this.state);
    this.syncView();
  }

  update(_time: number, delta: number): void {
    if (!this.keys) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.menu)) {
      this.scene.start(SCENE_KEYS.menu);
      return;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.restart) ||
      (this.state.status === 'finished' && (
        Phaser.Input.Keyboard.JustDown(this.keys.enter) ||
        Phaser.Input.Keyboard.JustDown(this.keys.space)
      ))
    ) {
      this.scene.restart();
      return;
    }

    if (this.state.status === 'finished') {
      this.syncView();
      return;
    }

    const deltaSeconds = delta / 1000;
    const playerInput = this.getPlayerInput();

    moveActor(this.state.player, playerInput, deltaSeconds, PITCH_BOUNDS);

    if (Phaser.Input.Keyboard.JustDown(this.keys.pass)) {
      kickBall(this.state, this.getActionDirection(playerInput), BALL_PASS_SPEED);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.shoot)) {
      kickBall(this.state, this.getActionDirection(playerInput), BALL_SHOT_SPEED);
    }

    const opponentInput = getOpponentInput(this.state);
    moveActor(this.state.opponent, opponentInput, deltaSeconds, PITCH_BOUNDS);

    if (shouldOpponentShoot(this.state)) {
      kickBall(this.state, { x: -1, y: 0 }, OPPONENT_SHOT_SPEED);
    }

    tickPossessionCooldown(this.state, deltaSeconds);
    updateBallMotion(this.state, deltaSeconds);
    resolveBallBounds(this.state);
    updatePossession(this.state);
    attachBallToOwner(this.state);

    const scoringTeam = checkGoal(this.state);

    if (scoringTeam) {
      resetAfterGoal(this.state, scoringTeam);
      attachBallToOwner(this.state);
    }

    tickClock(this.state, deltaSeconds);
    this.syncView();
  }

  private drawPitch(): void {
    this.cameras.main.setBackgroundColor(GAME_COLORS.background);

    const graphics = this.add.graphics();
    graphics.fillStyle(GAME_COLORS.pitch, 1);
    graphics.fillRect(
      PITCH_BOUNDS.left,
      PITCH_BOUNDS.top,
      PITCH_BOUNDS.right - PITCH_BOUNDS.left,
      PITCH_BOUNDS.bottom - PITCH_BOUNDS.top,
    );

    graphics.fillStyle(GAME_COLORS.pitchAlt, 0.2);
    const stripeWidth = (PITCH_BOUNDS.right - PITCH_BOUNDS.left) / 6;

    for (let index = 0; index < 6; index += 1) {
      if (index % 2 === 0) {
        graphics.fillRect(
          PITCH_BOUNDS.left + (index * stripeWidth),
          PITCH_BOUNDS.top,
          stripeWidth,
          PITCH_BOUNDS.bottom - PITCH_BOUNDS.top,
        );
      }
    }

    graphics.lineStyle(4, GAME_COLORS.line, 1);
    graphics.strokeRect(
      PITCH_BOUNDS.left,
      PITCH_BOUNDS.top,
      PITCH_BOUNDS.right - PITCH_BOUNDS.left,
      PITCH_BOUNDS.bottom - PITCH_BOUNDS.top,
    );

    const midX = GAME_SIZE.width / 2;
    const midY = GAME_SIZE.height / 2;

    graphics.lineBetween(midX, PITCH_BOUNDS.top, midX, PITCH_BOUNDS.bottom);
    graphics.strokeCircle(midX, midY, 70);
    graphics.fillStyle(GAME_COLORS.line, 1);
    graphics.fillCircle(midX, midY, 5);

    graphics.strokeRect(
      PITCH_BOUNDS.left - GOAL_BOUNDS.depth,
      GOAL_BOUNDS.top,
      GOAL_BOUNDS.depth,
      GOAL_BOUNDS.bottom - GOAL_BOUNDS.top,
    );
    graphics.strokeRect(
      PITCH_BOUNDS.right,
      GOAL_BOUNDS.top,
      GOAL_BOUNDS.depth,
      GOAL_BOUNDS.bottom - GOAL_BOUNDS.top,
    );
  }

  private createActors(): void {
    this.playerSprite = this.add.circle(0, 0, this.state.player.radius, GAME_COLORS.home)
      .setStrokeStyle(3, GAME_COLORS.line);
    this.opponentSprite = this.add.circle(0, 0, this.state.opponent.radius, GAME_COLORS.away)
      .setStrokeStyle(3, GAME_COLORS.line);
    this.ballSprite = this.add.circle(0, 0, this.state.ball.radius, GAME_COLORS.ball)
      .setStrokeStyle(2, GAME_COLORS.shadow);
  }

  private createHud(): void {
    this.scoreText = this.add.text(34, 18, '', {
      color: '#f5f0ce',
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      fontStyle: 'bold',
    });

    this.timerText = this.add.text(GAME_SIZE.width - 34, 18, '', {
      color: '#f5f0ce',
      fontFamily: 'Courier New',
      fontSize: '28px',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    this.statusText = this.add.text(GAME_SIZE.width / 2, 18, '', {
      color: '#ffce52',
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      align: 'center',
    }).setOrigin(0.5, 0);

    this.add.text(GAME_SIZE.width / 2, GAME_SIZE.height - 26, 'WASD/Arrows move  |  J pass  |  K shoot  |  R restart  |  Esc menu', {
      color: '#dce7bd',
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
    }).setOrigin(0.5, 1);

    this.endText = this.add.text(GAME_SIZE.width / 2, GAME_SIZE.height / 2, '', {
      color: '#f5f0ce',
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#0c150fcc',
      padding: {
        x: 24,
        y: 14,
      },
    }).setOrigin(0.5).setVisible(false);
  }

  private createControls(): void {
    this.keys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      pass: Phaser.Input.Keyboard.KeyCodes.J,
      shoot: Phaser.Input.Keyboard.KeyCodes.K,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      menu: Phaser.Input.Keyboard.KeyCodes.ESC,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as MatchKeys;
  }

  private getPlayerInput(): Vector2 {
    if (!this.keys) {
      return { x: 0, y: 0 };
    }

    const x = Number(this.keys.right.isDown || this.keys.d.isDown)
      - Number(this.keys.left.isDown || this.keys.a.isDown);
    const y = Number(this.keys.down.isDown || this.keys.s.isDown)
      - Number(this.keys.up.isDown || this.keys.w.isDown);

    return { x, y };
  }

  private getActionDirection(input: Vector2): Vector2 {
    if (input.x !== 0 || input.y !== 0) {
      return input;
    }

    return this.state.player.facing;
  }

  private syncView(): void {
    this.playerSprite?.setPosition(
      this.state.player.position.x,
      this.state.player.position.y,
    );
    this.opponentSprite?.setPosition(
      this.state.opponent.position.x,
      this.state.opponent.position.y,
    );
    this.ballSprite?.setPosition(
      this.state.ball.position.x,
      this.state.ball.position.y,
    );

    this.scoreText?.setText(
      `You ${this.state.score.home} - ${this.state.score.away} Opponent`,
    );
    this.timerText?.setText(formatClock(this.state.timeRemaining));
    this.statusText?.setText(
      this.state.ball.owner === 'player'
        ? 'In possession'
        : this.state.ball.owner === 'opponent'
          ? 'Opponent in possession'
          : 'Loose ball',
    );

    if (this.state.status === 'finished') {
      this.endText?.setText(`${getResultLabel(this.state)}\nPress Space or R to restart`);
      this.endText?.setVisible(true);
      return;
    }

    this.endText?.setVisible(false);
  }
}
