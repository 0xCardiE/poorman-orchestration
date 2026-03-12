import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Browser Football', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Start Match', {
        fontSize: '22px',
        color: '#2ecc71',
        backgroundColor: '#1a1a2e',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on('pointerover', () => startButton.setColor('#27ae60'));
    startButton.on('pointerout', () => startButton.setColor('#2ecc71'));
    startButton.on('pointerdown', () => this.scene.start('MatchScene'));

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'WASD / Arrows to move  |  Space = pass  |  Shift = shoot', {
        fontSize: '13px',
        color: '#888888',
      })
      .setOrigin(0.5);
  }
}
