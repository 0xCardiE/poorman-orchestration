import Phaser from 'phaser';

export const GAME_SIZE = {
  width: 960,
  height: 540,
} as const;

export const PITCH_BOUNDS = {
  left: 90,
  right: 870,
  top: 60,
  bottom: 480,
} as const;

export const GOAL_BOUNDS = {
  top: 210,
  bottom: 330,
  depth: 28,
} as const;

export const SCENE_KEYS = {
  menu: 'menu',
  match: 'match',
} as const;

export const GAME_COLORS = {
  background: 0x0e2415,
  pitch: 0x2f7d32,
  pitchAlt: 0x3d9441,
  line: 0xf4f2d0,
  home: 0x3e8ef7,
  away: 0xf25c54,
  ball: 0xf6f0e6,
  hud: 0xf5f0ce,
  accent: 0xffce52,
  shadow: 0x08120c,
} as const;

export function createPhaserConfig(
  parent: string,
  scene: Phaser.Types.Scenes.SceneType[],
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_SIZE.width,
    height: GAME_SIZE.height,
    backgroundColor: GAME_COLORS.background,
    scene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
