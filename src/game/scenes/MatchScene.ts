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

interface TouchControls {
  enabled: boolean;
  movePointerId: number | null;
  moveInput: Vector2;
  passQueued: boolean;
  shootQueued: boolean;
  moveBase?: Phaser.GameObjects.Arc;
  moveStick?: Phaser.GameObjects.Arc;
  passButton?: Phaser.GameObjects.Container;
  shootButton?: Phaser.GameObjects.Container;
}

const TOUCH_MOVE_CENTER = {
  x: 122,
  y: GAME_SIZE.height - 104,
};

const TOUCH_MOVE_RADIUS = 56;
const TOUCH_MOVE_MAX_DISTANCE = 44;

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

  private controlsHintText?: Phaser.GameObjects.Text;

  private touchControls: TouchControls = {
    enabled: false,
    movePointerId: null,
    moveInput: { x: 0, y: 0 },
    passQueued: false,
    shootQueued: false,
  };

  constructor() {
    super(SCENE_KEYS.match);
  }

  create(): void {
    this.state = createInitialMatchState();
    this.touchControls = {
      enabled: this.isTouchEnabled(),
      movePointerId: null,
      moveInput: { x: 0, y: 0 },
      passQueued: false,
      shootQueued: false,
    };
    this.drawPitch();
    this.createActors();
    this.createHud();
    this.createControls();
    this.createTouchControls();
    attachBallToOwner(this.state);
    this.syncView();
  }

  update(_time: number, delta: number): void {
    if (this.isJustDown(this.keys?.menu)) {
      this.scene.start(SCENE_KEYS.menu);
      return;
    }

    if (
      this.isJustDown(this.keys?.restart) ||
      (this.state.status === 'finished' && (
        this.isJustDown(this.keys?.enter) ||
        this.isJustDown(this.keys?.space)
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

    if (
      this.isJustDown(this.keys?.pass)
      || this.touchControls.passQueued
    ) {
      kickBall(this.state, this.getActionDirection(playerInput), BALL_PASS_SPEED);
    }

    if (
      this.isJustDown(this.keys?.shoot)
      || this.touchControls.shootQueued
    ) {
      kickBall(this.state, this.getActionDirection(playerInput), BALL_SHOT_SPEED);
    }

    this.touchControls.passQueued = false;
    this.touchControls.shootQueued = false;

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

    this.controlsHintText = this.add.text(GAME_SIZE.width / 2, GAME_SIZE.height - 26, '', {
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

    this.endText.setInteractive({ useHandCursor: true });
    this.endText.on('pointerdown', () => {
      if (this.state.status === 'finished') {
        this.scene.restart();
      }
    });
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

  private createTouchControls(): void {
    if (!this.touchControls.enabled) {
      this.controlsHintText?.setText('WASD/Arrows move  |  J pass  |  K shoot  |  R restart  |  Esc menu');
      return;
    }

    this.input.addPointer(2);

    this.controlsHintText?.setText('Touch pad moves  |  Tap PASS or SHOOT  |  Tap full-time banner to restart');
    this.controlsHintText?.setFontSize('16px');

    const moveBase = this.add.circle(
      TOUCH_MOVE_CENTER.x,
      TOUCH_MOVE_CENTER.y,
      TOUCH_MOVE_RADIUS,
      GAME_COLORS.shadow,
      0.28,
    ).setStrokeStyle(2, GAME_COLORS.hud, 0.45);

    const moveStick = this.add.circle(
      TOUCH_MOVE_CENTER.x,
      TOUCH_MOVE_CENTER.y,
      24,
      GAME_COLORS.hud,
      0.65,
    ).setStrokeStyle(2, GAME_COLORS.line, 0.6);

    const passButton = this.createTouchButton(
      GAME_SIZE.width - 170,
      GAME_SIZE.height - 124,
      'PASS',
    );
    const shootButton = this.createTouchButton(
      GAME_SIZE.width - 92,
      GAME_SIZE.height - 72,
      'SHOOT',
    );

    passButton.on('pointerdown', () => {
      this.touchControls.passQueued = true;
    });
    shootButton.on('pointerdown', () => {
      this.touchControls.shootQueued = true;
    });

    this.touchControls.moveBase = moveBase;
    this.touchControls.moveStick = moveStick;
    this.touchControls.passButton = passButton;
    this.touchControls.shootButton = shootButton;

    this.input.on('pointerdown', this.handleTouchPointerDown, this);
    this.input.on('pointermove', this.handleTouchPointerMove, this);
    this.input.on('pointerup', this.handleTouchPointerUp, this);
    this.input.on('pointerupoutside', this.handleTouchPointerUp, this);
  }

  private getPlayerInput(): Vector2 {
    const keyboardX = Number(this.keys?.right.isDown || this.keys?.d.isDown)
      - Number(this.keys?.left.isDown || this.keys?.a.isDown);
    const keyboardY = Number(this.keys?.down.isDown || this.keys?.s.isDown)
      - Number(this.keys?.up.isDown || this.keys?.w.isDown);

    return {
      x: Phaser.Math.Clamp(keyboardX + this.touchControls.moveInput.x, -1, 1),
      y: Phaser.Math.Clamp(keyboardY + this.touchControls.moveInput.y, -1, 1),
    };
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
      const restartHint = this.touchControls.enabled
        ? 'Tap to restart'
        : 'Press Space or R to restart';
      this.endText?.setText(`${getResultLabel(this.state)}\n${restartHint}`);
      this.endText?.setVisible(true);
      return;
    }

    this.endText?.setVisible(false);
  }

  private createTouchButton(
    x: number,
    y: number,
    label: string,
  ): Phaser.GameObjects.Container {
    const background = this.add.circle(0, 0, 36, GAME_COLORS.shadow, 0.36)
      .setStrokeStyle(2, GAME_COLORS.accent, 0.65);
    const text = this.add.text(0, 0, label, {
      color: '#f5f0ce',
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    return this.add.container(x, y, [background, text])
      .setSize(72, 72)
      .setInteractive(
        new Phaser.Geom.Circle(36, 36, 36),
        Phaser.Geom.Circle.Contains,
      );
  }

  private handleTouchPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.touchControls.enabled || this.touchControls.movePointerId !== null) {
      return;
    }

    if (pointer.x > GAME_SIZE.width / 2 || pointer.y < GAME_SIZE.height - 180) {
      return;
    }

    this.touchControls.movePointerId = pointer.id;
    this.updateTouchMoveInput(pointer);
  }

  private handleTouchPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.touchControls.enabled || pointer.id !== this.touchControls.movePointerId) {
      return;
    }

    this.updateTouchMoveInput(pointer);
  }

  private handleTouchPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.touchControls.enabled || pointer.id !== this.touchControls.movePointerId) {
      return;
    }

    this.touchControls.movePointerId = null;
    this.touchControls.moveInput = { x: 0, y: 0 };
    this.touchControls.moveStick?.setPosition(TOUCH_MOVE_CENTER.x, TOUCH_MOVE_CENTER.y);
  }

  private updateTouchMoveInput(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - TOUCH_MOVE_CENTER.x;
    const dy = pointer.y - TOUCH_MOVE_CENTER.y;
    const distance = Math.min(Math.hypot(dx, dy), TOUCH_MOVE_MAX_DISTANCE);
    const angle = Math.atan2(dy, dx);
    const normalizedDistance = distance / TOUCH_MOVE_MAX_DISTANCE;

    this.touchControls.moveInput = {
      x: Math.cos(angle) * normalizedDistance,
      y: Math.sin(angle) * normalizedDistance,
    };
    this.touchControls.moveStick?.setPosition(
      TOUCH_MOVE_CENTER.x + (Math.cos(angle) * distance),
      TOUCH_MOVE_CENTER.y + (Math.sin(angle) * distance),
    );
  }

  private isTouchEnabled(): boolean {
    const maxTouchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints;
    return this.sys.game.device.input.touch || maxTouchPoints > 0;
  }

  private isJustDown(key?: Phaser.Input.Keyboard.Key): boolean {
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }
}
