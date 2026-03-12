import Phaser from 'phaser';
import {
  GAME_COLORS,
  GAME_SIZE,
  SCENE_KEYS,
} from '../config/gameConfig';

export class MenuScene extends Phaser.Scene {
  private startKeys?: {
    enter: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super(SCENE_KEYS.menu);
  }

  create(): void {
    const centerX = GAME_SIZE.width / 2;

    this.cameras.main.setBackgroundColor(GAME_COLORS.background);

    this.add.text(centerX, 120, 'Browser Football', {
      color: '#f4f2d0',
      fontFamily: 'Trebuchet MS',
      fontSize: '40px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, 190, 'Short arcade matches. First whistle to full time in 60 seconds.', {
      color: '#dce7bd',
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(centerX, 280, 'Move: WASD / Arrows\nPass: J\nShoot: K\nRestart: R', {
      color: '#f4f2d0',
      fontFamily: 'Courier New',
      fontSize: '26px',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    this.add.text(centerX, 430, 'Press Enter, Space, or click to start', {
      color: '#ffce52',
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
    }).setOrigin(0.5);

    this.startKeys = this.input.keyboard?.addKeys({
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as {
      enter: Phaser.Input.Keyboard.Key;
      space: Phaser.Input.Keyboard.Key;
    };

    this.input.once('pointerdown', () => {
      this.scene.start(SCENE_KEYS.match);
    });
  }

  update(): void {
    if (!this.startKeys) {
      return;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.startKeys.enter) ||
      Phaser.Input.Keyboard.JustDown(this.startKeys.space)
    ) {
      this.scene.start(SCENE_KEYS.match);
    }
  }
}
