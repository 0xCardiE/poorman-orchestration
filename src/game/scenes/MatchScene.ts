import Phaser from 'phaser';
import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  PITCH_MARGIN_X,
  PITCH_MARGIN_Y,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  BALL_RADIUS,
  POSSESSION_DISTANCE,
  PASS_SPEED,
  SHOOT_SPEED,
  OPPONENT_SPEED,
  GOAL_TOP,
  GOAL_BOTTOM,
  MATCH_DURATION_SEC,
} from '../config/constants';

export class MatchScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private opponent!: Phaser.Physics.Arcade.Image;
  private ball!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hasPossession = false;
  private facingX = 0;
  private facingY = 1;
  private passKey!: Phaser.Input.Keyboard.Key;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private scorePlayer = 0;
  private scoreOpponent = 0;
  private timeRemaining = MATCH_DURATION_SEC;
  private hudText!: Phaser.GameObjects.Text;
  private matchEnded = false;

  constructor() {
    super({ key: 'Match' });
  }

  create(): void {
    this.scorePlayer = 0;
    this.scoreOpponent = 0;
    this.timeRemaining = MATCH_DURATION_SEC;
    this.matchEnded = false;
    this.drawPitch();
    this.createPlayer();
    this.createOpponent();
    this.createBall();
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.passKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.hudText = this.add
      .text(400, 20, '', { fontSize: '20px', color: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.refreshHud();
  }

  private createPlayerTexture(): void {
    const size = PLAYER_RADIUS * 2 + 4;
    const g = this.make.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(PLAYER_RADIUS + 2, PLAYER_RADIUS + 2, PLAYER_RADIUS);
    g.generateTexture('player', size, size);
    g.destroy();
  }

  private drawPitch(): void {
    const g = this.add.graphics();
    g.fillStyle(0x2d5a27, 1);
    g.fillRect(PITCH_MARGIN_X, PITCH_MARGIN_Y, PITCH_WIDTH, PITCH_HEIGHT);
    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(PITCH_MARGIN_X, PITCH_MARGIN_Y, PITCH_WIDTH, PITCH_HEIGHT);
    // Centre line
    g.lineBetween(400, PITCH_MARGIN_Y, 400, PITCH_MARGIN_Y + PITCH_HEIGHT);
    g.lineBetween(400, 299, 400, 301);
    this.add.circle(400, 300, 50).setStrokeStyle(2, 0xffffff).setFillStyle(0x2d5a27);
    // Goals (left = opponent scores when ball in, right = player scores)
    g.strokeRect(PITCH_MARGIN_X, GOAL_TOP, 4, GOAL_BOTTOM - GOAL_TOP);
    g.strokeRect(PITCH_MARGIN_X + PITCH_WIDTH - 4, GOAL_TOP, 4, GOAL_BOTTOM - GOAL_TOP);
  }

  private createBallTexture(): void {
    const size = BALL_RADIUS * 2 + 4;
    const g = this.make.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(BALL_RADIUS + 2, BALL_RADIUS + 2, BALL_RADIUS);
    g.generateTexture('ball', size, size);
    g.destroy();
  }

  private createBall(): void {
    this.createBallTexture();
    const x = PITCH_MARGIN_X + PITCH_WIDTH / 2;
    const y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.ball = this.physics.add.image(x, y, 'ball');
    this.ball.setCircle(BALL_RADIUS);
    this.ball.setTint(0xf5d742);
    this.ball.setCollideWorldBounds(false);
    this.ball.setBounce(0.6);
    this.ball.setDrag(80);
  }

  private createPlayer(): void {
    this.createPlayerTexture();
    const x = PITCH_MARGIN_X + PITCH_WIDTH / 2 - 80;
    const y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.player = this.physics.add.image(x, y, 'player');
    this.player.setCircle(PLAYER_RADIUS);
    this.player.setTint(0x0066ff);
    this.player.setCollideWorldBounds(false);
    this.player.setMaxVelocity(PLAYER_SPEED);
    this.player.setDrag(400);
  }

  private createOpponent(): void {
    const x = PITCH_MARGIN_X + PITCH_WIDTH / 2 + 80;
    const y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.opponent = this.physics.add.image(x, y, 'player');
    this.opponent.setCircle(PLAYER_RADIUS);
    this.opponent.setTint(0xcc2222);
    this.opponent.setCollideWorldBounds(false);
    this.opponent.setMaxVelocity(OPPONENT_SPEED);
    this.opponent.setDrag(300);
  }

  update(_time: number, delta: number): void {
    if (this.matchEnded) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    this.timeRemaining -= delta / 1000;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.matchEnded = true;
      this.refreshHud();
      return;
    }
    this.checkGoals();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.left.isDown) {
      body.setVelocityX(-PLAYER_SPEED);
      this.facingX = -1;
      this.facingY = 0;
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(PLAYER_SPEED);
      this.facingX = 1;
      this.facingY = 0;
    } else {
      body.setVelocityX(0);
    }
    if (this.cursors.up.isDown) {
      body.setVelocityY(-PLAYER_SPEED);
      this.facingX = 0;
      this.facingY = -1;
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(PLAYER_SPEED);
      this.facingX = 0;
      this.facingY = 1;
    } else {
      body.setVelocityY(0);
    }

    if (this.hasPossession && Phaser.Input.Keyboard.JustDown(this.passKey)) {
      this.kickBall(PASS_SPEED);
    }
    if (this.hasPossession && Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.kickBall(SHOOT_SPEED);
    }

    const minX = PITCH_MARGIN_X + PLAYER_RADIUS;
    const maxX = PITCH_MARGIN_X + PITCH_WIDTH - PLAYER_RADIUS;
    const minY = PITCH_MARGIN_Y + PLAYER_RADIUS;
    const maxY = PITCH_MARGIN_Y + PITCH_HEIGHT - PLAYER_RADIUS;
    this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ball.x, this.ball.y);
    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
    const ballSpeed = Math.hypot(ballBody.velocity.x, ballBody.velocity.y);
    if (dist <= POSSESSION_DISTANCE && ballSpeed < 20) {
      this.hasPossession = true;
    } else {
      this.hasPossession = false;
    }
    if (this.hasPossession) {
      this.ball.setVelocity(0, 0);
      this.ball.x = this.player.x;
      this.ball.y = this.player.y + PLAYER_RADIUS + BALL_RADIUS;
    } else {
      this.clampBallToPitch();
    }
    this.updateOpponent();
    this.refreshHud();
  }

  private refreshHud(): void {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = Math.floor(this.timeRemaining % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const endMsg = this.matchEnded ? ' — R to restart' : '';
    this.hudText.setText(`${this.scorePlayer} - ${this.scoreOpponent}   ${timeStr}${endMsg}`);
  }

  private checkGoals(): void {
    const inLeftGoal =
      this.ball.x <= PITCH_MARGIN_X + 20 &&
      this.ball.y >= GOAL_TOP &&
      this.ball.y <= GOAL_BOTTOM;
    const inRightGoal =
      this.ball.x >= PITCH_MARGIN_X + PITCH_WIDTH - 20 &&
      this.ball.y >= GOAL_TOP &&
      this.ball.y <= GOAL_BOTTOM;
    if (inLeftGoal) {
      this.scoreOpponent += 1;
      this.resetBallAndPositions();
    } else if (inRightGoal) {
      this.scorePlayer += 1;
      this.resetBallAndPositions();
    }
  }

  private resetBallAndPositions(): void {
    this.ball.setVelocity(0, 0);
    this.ball.x = PITCH_MARGIN_X + PITCH_WIDTH / 2;
    this.ball.y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.player.x = PITCH_MARGIN_X + PITCH_WIDTH / 2 - 80;
    this.player.y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.opponent.x = PITCH_MARGIN_X + PITCH_WIDTH / 2 + 80;
    this.opponent.y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    (this.opponent.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.hasPossession = false;
  }

  private updateOpponent(): void {
    const oppBody = this.opponent.body as Phaser.Physics.Arcade.Body;
    const dx = this.ball.x - this.opponent.x;
    const dy = this.ball.y - this.opponent.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 20) {
      const s = OPPONENT_SPEED / Math.max(dist, 1);
      oppBody.setVelocity(dx * s, dy * s);
    } else {
      oppBody.setVelocity(0, 0);
    }
    const minX = PITCH_MARGIN_X + PLAYER_RADIUS;
    const maxX = PITCH_MARGIN_X + PITCH_WIDTH - PLAYER_RADIUS;
    const minY = PITCH_MARGIN_Y + PLAYER_RADIUS;
    const maxY = PITCH_MARGIN_Y + PITCH_HEIGHT - PLAYER_RADIUS;
    this.opponent.x = Phaser.Math.Clamp(this.opponent.x, minX, maxX);
    this.opponent.y = Phaser.Math.Clamp(this.opponent.y, minY, maxY);
  }

  private kickBall(speed: number): void {
    const len = Math.hypot(this.facingX, this.facingY) || 1;
    this.ball.setVelocity((this.facingX / len) * speed, (this.facingY / len) * speed);
    this.hasPossession = false;
  }

  private clampBallToPitch(): void {
    const minX = PITCH_MARGIN_X + BALL_RADIUS;
    const maxX = PITCH_MARGIN_X + PITCH_WIDTH - BALL_RADIUS;
    const minY = PITCH_MARGIN_Y + BALL_RADIUS;
    const maxY = PITCH_MARGIN_Y + PITCH_HEIGHT - BALL_RADIUS;
    this.ball.x = Phaser.Math.Clamp(this.ball.x, minX, maxX);
    this.ball.y = Phaser.Math.Clamp(this.ball.y, minY, maxY);
  }
}
