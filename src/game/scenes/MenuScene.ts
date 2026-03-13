import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    this.add.text(400, 260, 'Browser Football', {
      fontSize: '32px',
      color: '#fff',
    }).setOrigin(0.5);
    this.add.text(400, 320, 'Press SPACE to start', {
      fontSize: '18px',
      color: '#aaa',
    }).setOrigin(0.5);
    this.add.text(400, 380, 'Match: Arrows move · X pass · C shoot · R restart', {
      fontSize: '14px',
      color: '#888',
    }).setOrigin(0.5);
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('Match');
    });
  }
}
