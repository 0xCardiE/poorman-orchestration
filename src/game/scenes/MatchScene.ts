import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PITCH, GOAL, PLAYER, BALL } from '../config/constants';
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

  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MatchScene' });
  }

  create(): void {
    this.playerHasBall = false;
    this.matchEnded = false;
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

    this.player.update(this.cursors, this.wasd);

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
      this.onGoal();
    } else if (bx >= PITCH.x + PITCH.width - BALL.radius && by >= goalTop && by <= goalBottom) {
      this.scoreManager.playerGoal();
      this.onGoal();
    }
  }

  private onGoal(): void {
    this.scoreText.setText(this.scoreManager.toString());
    this.resetPositions();
  }

  private resetPositions(): void {
    const cx = PITCH.x + PITCH.width / 2;
    const cy = PITCH.y + PITCH.height / 2;
    this.player.sprite.setPosition(cx - 100, cy);
    this.player.sprite.setVelocity(0, 0);
    this.ball.resetToCenter();
    this.opponent.resetToHome();
    this.playerHasBall = false;
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
