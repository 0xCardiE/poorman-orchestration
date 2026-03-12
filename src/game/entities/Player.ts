import Phaser from 'phaser';
import { PLAYER } from '../config/constants';

export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  facing: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('player-tex')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(PLAYER.color, 1);
      graphics.fillCircle(PLAYER.radius, PLAYER.radius, PLAYER.radius);
      graphics.generateTexture('player-tex', PLAYER.radius * 2, PLAYER.radius * 2);
      graphics.destroy();
    }

    this.sprite = scene.physics.add.sprite(x, y, 'player-tex');
    this.sprite.setCircle(PLAYER.radius);
    this.sprite.setCollideWorldBounds(true);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: Record<string, Phaser.Input.Keyboard.Key>): void {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd.A.isDown) vx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) vx = 1;

    if (cursors.up.isDown || wasd.W.isDown) vy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) vy = 1;

    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx /= len;
      vy /= len;
      this.facing.set(vx, vy);
    }

    this.sprite.setVelocity(vx * PLAYER.speed, vy * PLAYER.speed);
  }
}
