import Phaser from 'phaser';
import { OPPONENT, PITCH, BALL } from '../config/constants';
import { Ball } from './Ball';

export class Opponent {
  sprite: Phaser.Physics.Arcade.Sprite;
  private homeX: number;
  private homeY: number;
  hasBall = false;
  facing: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-1, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('opponent-tex')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(OPPONENT.color, 1);
      graphics.fillCircle(OPPONENT.radius, OPPONENT.radius, OPPONENT.radius);
      graphics.generateTexture('opponent-tex', OPPONENT.radius * 2, OPPONENT.radius * 2);
      graphics.destroy();
    }

    this.sprite = scene.physics.add.sprite(x, y, 'opponent-tex');
    this.sprite.setCircle(OPPONENT.radius);
    this.sprite.setCollideWorldBounds(true);
    this.homeX = x;
    this.homeY = y;
  }

  update(ball: Ball, playerX: number, playerY: number): void {
    if (this.hasBall) {
      this.actWithBall(ball, playerX, playerY);
      return;
    }

    if (!ball.isFree) {
      this.moveToward(this.homeX, this.homeY, OPPONENT.speed * 0.5);
      return;
    }

    const distToBall = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      ball.sprite.x, ball.sprite.y,
    );

    if (distToBall < OPPONENT.chaseRange) {
      this.moveToward(ball.sprite.x, ball.sprite.y, OPPONENT.speed);
    } else {
      this.moveToward(this.homeX, this.homeY, OPPONENT.speed * 0.5);
    }

    if (distToBall < OPPONENT.possessionRange && ball.isFree) {
      this.hasBall = true;
      ball.isFree = false;
    }
  }

  actWithBall(ball: Ball, playerX: number, playerY: number): void {
    ball.followOwner(this.sprite.x, this.sprite.y, this.facing.x, this.facing.y);

    const goalX = PITCH.x;
    const goalY = PITCH.y + PITCH.height / 2;
    const distToGoal = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, goalX, goalY);

    if (distToGoal < 200) {
      const dirX = goalX - this.sprite.x;
      const dirY = goalY - this.sprite.y;
      ball.kick(dirX, dirY, BALL.shootSpeed);
      this.hasBall = false;
    } else {
      this.moveToward(goalX, goalY, OPPONENT.speed);
      const dx = goalX - this.sprite.x;
      const dy = goalY - this.sprite.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      this.facing.set(dx / len, dy / len);
    }

    const distToPlayer = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y, playerX, playerY,
    );
    if (distToPlayer < 25 && this.hasBall) {
      this.hasBall = false;
      ball.isFree = true;
    }
  }

  private moveToward(tx: number, ty: number, speed: number): void {
    const dx = tx - this.sprite.x;
    const dy = ty - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    this.facing.set(dx / dist, dy / dist);
  }

  resetToHome(): void {
    this.sprite.setPosition(this.homeX, this.homeY);
    this.sprite.setVelocity(0, 0);
    this.hasBall = false;
  }
}
