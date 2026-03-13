import Phaser from 'phaser';
import type { Types } from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { MatchScene } from '../scenes/MatchScene';

export * from './constants';

export const GameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: [BootScene, MenuScene, MatchScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
};
