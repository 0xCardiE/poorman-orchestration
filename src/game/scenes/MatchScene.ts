import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PITCH, GOAL, PLAYER, BALL, OPPONENT, MATCH } from '../config/constants';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { Opponent } from '../entities/Opponent';
import { ScoreManager } from '../systems/ScoreManager';
import { MatchTimer } from '../systems/MatchTimer';

export class MatchScene extends Phaser.Scene {
  private player!: Player;
  private ball!: Ball;
  private opponent!: Opponent;
  private scoreManager!: ScoreManager;
  private matchTimer!: MatchTimer;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private passKey!: Phaser.Input.Keyboard.Key;
  private shootKey!: Phaser.Input.Keyboard.Key;

  private playerHasBall = false;
  private matchEnded = false;
  private kickoffTimer = 0;

  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private overlayGraphics!: Phaser.GameObjects.Graphics;
  private touchMovePointer: Phaser.Input.Pointer | null = null;

  constructor() {
    super({ key: 'MatchScene' });
  }

  create(): void {
    this.playerHasBall = false;
    this.matchEnded = false;
    this.kickoffTimer = 0;
    this.touchMovePointer = null;
    this.scoreManager = new ScoreManager();
    this.matchTimer = new MatchTimer();

    this.drawPitch();
    this.drawGoals();

    const cx = PITCH.x + PITCH.width / 2;
    const cy = PITCH.y + PITCH.height / 2;

    this.player = new Player(this, cx - 100, cy);
    this.ball = new Ball(this, cx, cy);
    this.opponent = new Opponent(this, cx + 150, cy);

    this.setupInput();
    this.createHUD();

    this.matchTimer.start();

    this.overlayGraphics = this.add.graphics().setDepth(2);
    this.setupMobileControls();
  }

  update(_time: number, delta: number): void {
    const deltaSec = delta / 1000;

    if (this.matchEnded) return;

    if (this.matchTimer.isFinished()) {
      this.matchEnded = true;
      this.showMatchEnd();
      return;
    }

    this.matchTimer.update(deltaSec);
    this.timerText.setText(this.matchTimer.formatTime());
    this.timerText.setColor(
      this.matchTimer.remaining <= MATCH.timerWarnSec ? '#ff4444' : '#aaaaaa',
    );

    if (this.kickoffTimer > 0) {
      this.kickoffTimer -= deltaSec;
      this.drawOverlays();
      return;
    }

    if (this.touchMovePointer?.isDown) {
      this.handleMobileMovement();
    } else {
      this.touchMovePointer = null;
      this.player.update(this.cursors, this.wasd);
    }

    this.handlePlayerPossession();
    this.handlePassAndShoot();

    if (this.playerHasBall) {
      this.ball.followOwner(
        this.player.sprite.x,
        this.player.sprite.y,
        this.player.facing.x,
        this.player.facing.y,
      );
    }

    this.opponent.update(this.ball, this.player.sprite.x, this.player.sprite.y);

    if (this.opponent.hasBall) {
      this.playerHasBall = false;
    }

    this.ball.update();
    this.checkGoals();
    this.drawOverlays();

    this.clampToPitch(this.player.sprite, PLAYER.radius);
    this.clampToPitch(this.opponent.sprite, PLAYER.radius);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.passKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  private handlePlayerPossession(): void {
    if (this.playerHasBall || this.opponent.hasBall) return;
    if (!this.ball.isFree) return;

    const dist = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.ball.sprite.x,
      this.ball.sprite.y,
    );

    if (dist < PLAYER.possessionRange) {
      this.playerHasBall = true;
      this.ball.isFree = false;
    }
  }

  private handlePassAndShoot(): void {
    if (!this.playerHasBall) return;

    if (Phaser.Input.Keyboard.JustDown(this.passKey)) {
      this.ball.kick(this.player.facing.x, this.player.facing.y, BALL.passSpeed);
      this.playerHasBall = false;
    } else if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.ball.kick(this.player.facing.x, this.player.facing.y, BALL.shootSpeed);
      this.playerHasBall = false;
    }
  }

  private checkGoals(): void {
    const bx = this.ball.sprite.x;
    const by = this.ball.sprite.y;
    const goalTop = PITCH.y + PITCH.height / 2 - GOAL.height / 2;
    const goalBottom = PITCH.y + PITCH.height / 2 + GOAL.height / 2;

    if (bx <= PITCH.x + BALL.radius && by >= goalTop && by <= goalBottom) {
      this.scoreManager.opponentGoal();
      this.onGoal('player');
    } else if (bx >= PITCH.x + PITCH.width - BALL.radius && by >= goalTop && by <= goalBottom) {
      this.scoreManager.playerGoal();
      this.onGoal('opponent');
    }
  }

  private onGoal(concededBy: 'player' | 'opponent'): void {
    this.scoreText.setText(this.scoreManager.toString());
    this.showGoalFlash();
    this.resetPositions(concededBy);
    this.kickoffTimer = MATCH.kickoffDelaySec;
  }

  private resetPositions(kickoffTo: 'player' | 'opponent'): void {
    const cx = PITCH.x + PITCH.width / 2;
    const cy = PITCH.y + PITCH.height / 2;
    this.player.sprite.setPosition(cx - 100, cy);
    this.player.sprite.setVelocity(0, 0);
    this.ball.resetToCenter();
    this.opponent.resetToHome();
    this.opponent.hasBall = false;

    if (kickoffTo === 'player') {
      this.playerHasBall = true;
      this.ball.isFree = false;
      this.ball.followOwner(cx - 100, cy, this.player.facing.x, this.player.facing.y);
    } else {
      this.playerHasBall = false;
      this.opponent.hasBall = true;
      this.ball.isFree = false;
      this.ball.followOwner(
        this.opponent.sprite.x, this.opponent.sprite.y,
        this.opponent.facing.x, this.opponent.facing.y,
      );
    }
  }

  private showMatchEnd(): void {
    this.matchTimer.stop();
    this.timerText.setText('FT');

    this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.6,
    ).setDepth(10);

    const resultLabel = this.scoreManager.playerScore > this.scoreManager.opponentScore
      ? 'You Win!'
      : this.scoreManager.playerScore < this.scoreManager.opponentScore
        ? 'You Lose!'
        : 'Draw!';

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, resultLabel, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, this.scoreManager.toString(), {
        fontSize: '24px',
        color: '#cccccc',
      })
      .setOrigin(0.5)
      .setDepth(11);

    const restartBtn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Play Again', {
        fontSize: '20px',
        color: '#2ecc71',
        backgroundColor: '#1a1a2e',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    const menuBtn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 'Main Menu', {
        fontSize: '16px',
        color: '#999999',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    restartBtn.on('pointerdown', () => this.scene.restart());
    menuBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private drawPitch(): void {
    const g = this.add.graphics();

    g.fillStyle(PITCH.fillColor, 1);
    g.fillRect(PITCH.x, PITCH.y, PITCH.width, PITCH.height);

    g.lineStyle(PITCH.lineWidth, PITCH.lineColor, 1);
    g.strokeRect(PITCH.x, PITCH.y, PITCH.width, PITCH.height);

    const cx = PITCH.x + PITCH.width / 2;
    const cy = PITCH.y + PITCH.height / 2;
    g.strokeCircle(cx, cy, 50);
    g.fillStyle(PITCH.lineColor, 1);
    g.fillCircle(cx, cy, 3);

    g.beginPath();
    g.moveTo(cx, PITCH.y);
    g.lineTo(cx, PITCH.y + PITCH.height);
    g.strokePath();

    const penWidth = 80;
    const penHeight = 180;
    const penTop = cy - penHeight / 2;
    g.strokeRect(PITCH.x, penTop, penWidth, penHeight);
    g.strokeRect(PITCH.x + PITCH.width - penWidth, penTop, penWidth, penHeight);

    g.fillCircle(PITCH.x + 65, cy, 3);
    g.fillCircle(PITCH.x + PITCH.width - 65, cy, 3);
  }

  private drawGoals(): void {
    const g = this.add.graphics();
    const goalTop = PITCH.y + PITCH.height / 2 - GOAL.height / 2;

    g.lineStyle(3, GOAL.color, 1);
    g.strokeRect(PITCH.x - GOAL.width, goalTop, GOAL.width, GOAL.height);
    g.strokeRect(PITCH.x + PITCH.width, goalTop, GOAL.width, GOAL.height);
  }

  private createHUD(): void {
    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 18, this.scoreManager.toString(), {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(GAME_WIDTH / 2 - 50, 18, 'YOU', {
        fontSize: '12px',
        color: '#3498db',
      })
      .setOrigin(1, 0.5)
      .setDepth(5);

    this.add
      .text(GAME_WIDTH / 2 + 50, 18, 'OPP', {
        fontSize: '12px',
        color: '#e74c3c',
      })
      .setOrigin(0, 0.5)
      .setDepth(5);

    this.timerText = this.add
      .text(GAME_WIDTH / 2, 38, this.matchTimer.formatTime(), {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private drawOverlays(): void {
    this.overlayGraphics.clear();

    if (this.playerHasBall) {
      this.overlayGraphics.lineStyle(2, 0xffff00, 0.8);
      this.overlayGraphics.strokeCircle(this.player.sprite.x, this.player.sprite.y, PLAYER.radius + 4);
    } else if (this.opponent.hasBall) {
      this.overlayGraphics.lineStyle(2, 0xffff00, 0.8);
      this.overlayGraphics.strokeCircle(this.opponent.sprite.x, this.opponent.sprite.y, OPPONENT.radius + 4);
    }

    const fx = this.player.facing.x;
    const fy = this.player.facing.y;
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const tipDist = PLAYER.radius + 8;
    const tipX = px + fx * tipDist;
    const tipY = py + fy * tipDist;
    const perpX = -fy;
    const perpY = fx;
    const baseSize = 4;

    this.overlayGraphics.fillStyle(0xffff00, 0.9);
    this.overlayGraphics.fillTriangle(
      tipX, tipY,
      tipX - fx * 6 + perpX * baseSize, tipY - fy * 6 + perpY * baseSize,
      tipX - fx * 6 - perpX * baseSize, tipY - fy * 6 - perpY * baseSize,
    );
  }

  private showGoalFlash(): void {
    const goalText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'GOAL!', {
        fontSize: '48px',
        color: '#ffff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.tweens.add({
      targets: goalText,
      alpha: 0,
      y: GAME_HEIGHT / 2 - 40,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => goalText.destroy(),
    });
  }

  private setupMobileControls(): void {
    if (!this.sys.game.device.input.touch) return;

    if (this.input.manager.pointers.length < 3) {
      this.input.addPointer(1);
    }

    const passBtn = this.add
      .text(GAME_WIDTH - 70, GAME_HEIGHT - 75, 'PASS', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#2980b9',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(20)
      .setAlpha(0.7);

    passBtn.on('pointerdown', () => {
      if (this.playerHasBall && !this.matchEnded) {
        this.ball.kick(this.player.facing.x, this.player.facing.y, BALL.passSpeed);
        this.playerHasBall = false;
      }
    });

    const shootBtn = this.add
      .text(GAME_WIDTH - 70, GAME_HEIGHT - 30, 'SHOOT', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#c0392b',
        padding: { x: 10, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(20)
      .setAlpha(0.7);

    shootBtn.on('pointerdown', () => {
      if (this.playerHasBall && !this.matchEnded) {
        this.ball.kick(this.player.facing.x, this.player.facing.y, BALL.shootSpeed);
        this.playerHasBall = false;
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < GAME_WIDTH - 120) {
        this.touchMovePointer = pointer;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.touchMovePointer === pointer) {
        this.touchMovePointer = null;
        this.player.sprite.setVelocity(0, 0);
      }
    });
  }

  private handleMobileMovement(): void {
    if (!this.touchMovePointer) return;

    const dx = this.touchMovePointer.x - this.player.sprite.x;
    const dy = this.touchMovePointer.y - this.player.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      const nx = dx / dist;
      const ny = dy / dist;
      this.player.sprite.setVelocity(nx * PLAYER.speed, ny * PLAYER.speed);
      this.player.facing.set(nx, ny);
    } else {
      this.player.sprite.setVelocity(0, 0);
    }
  }

  private clampToPitch(sprite: Phaser.Physics.Arcade.Sprite, radius: number): void {
    const minX = PITCH.x + radius;
    const maxX = PITCH.x + PITCH.width - radius;
    const minY = PITCH.y + radius;
    const maxY = PITCH.y + PITCH.height - radius;

    if (sprite.x < minX) sprite.x = minX;
    if (sprite.x > maxX) sprite.x = maxX;
    if (sprite.y < minY) sprite.y = minY;
    if (sprite.y > maxY) sprite.y = maxY;
  }
}
