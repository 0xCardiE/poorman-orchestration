import Phaser from 'phaser';
import './style.css';
import { createPhaserConfig } from './game/config/gameConfig';
import { MatchScene } from './game/scenes/MatchScene';
import { MenuScene } from './game/scenes/MenuScene';
import { createAppShell } from './ui/app';

const gameContainerId = createAppShell();

new Phaser.Game(
  createPhaserConfig(gameContainerId, [MenuScene, MatchScene]),
);
