import Phaser from 'phaser';
import { BALL, PITCH, GOAL } from '../config/constants';

export class Ball {
  sprite: Phaser.Physics.Arcade.Sprite;
  isFree = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('ball-tex')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(BALL.color, 1);
      graphics.fillCircle(BALL.radius, BALL.radius, BALL.radius);
      graphics.generateTexture('ball-tex', BALL.radius * 2, BALL.radius * 2);
      graphics.destroy();
    }

    this.sprite = scene.physics.add.sprite(x, y, 'ball-tex');
    this.sprite.setCircle(BALL.radius);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.5);
    this.sprite.setDepth(1);
  }

  followOwner(ownerX: number, ownerY: number, facingX: number, facingY: number): void {
    const offsetDist = 18;
    this.sprite.setPosition(ownerX + facingX * offsetDist, ownerY + facingY * offsetDist);
    this.sprite.setVelocity(0, 0);
    this.isFree = false;
  }

  kick(dirX: number, dirY: number, speed: number): void {
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    this.sprite.setVelocity((dirX / len) * speed, (dirY / len) * speed);
    this.isFree = true;
  }

  update(): void {
    if (!this.isFree) return;

    const vx = this.sprite.body!.velocity.x * BALL.friction;
    const vy = this.sprite.body!.velocity.y * BALL.friction;

    if (Math.abs(vx) < BALL.stopThreshold && Math.abs(vy) < BALL.stopThreshold) {
      this.sprite.setVelocity(0, 0);
    } else {
      this.sprite.setVelocity(vx, vy);
    }

    this.clampToPitch();
  }

  resetToCenter(): void {
    const cx = PITCH.x + PITCH.width / 2;
    const cy = PITCH.y + PITCH.height / 2;
    this.sprite.setPosition(cx, cy);
    this.sprite.setVelocity(0, 0);
    this.isFree = true;
  }

  private clampToPitch(): void {
    const r = BALL.radius;
    const minX = PITCH.x + r;
    const maxX = PITCH.x + PITCH.width - r;
    const minY = PITCH.y + r;
    const maxY = PITCH.y + PITCH.height - r;

    const goalTop = PITCH.y + PITCH.height / 2 - GOAL.height / 2;
    const goalBottom = PITCH.y + PITCH.height / 2 + GOAL.height / 2;
    const inGoalRange = this.sprite.y >= goalTop && this.sprite.y <= goalBottom;

    const body = this.sprite.body!;

    if (this.sprite.y < minY) {
      this.sprite.y = minY;
      if (body.velocity.y < 0) body.velocity.y *= -0.7;
    } else if (this.sprite.y > maxY) {
      this.sprite.y = maxY;
      if (body.velocity.y > 0) body.velocity.y *= -0.7;
    }

    if (this.sprite.x < minX) {
      this.sprite.x = minX;
      if (!inGoalRange && body.velocity.x < 0) body.velocity.x *= -0.7;
    } else if (this.sprite.x > maxX) {
      this.sprite.x = maxX;
      if (!inGoalRange && body.velocity.x > 0) body.velocity.x *= -0.7;
    }
  }
}
