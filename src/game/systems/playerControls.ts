import Phaser from "phaser";
import type { PlayerMovementInput } from "./playerMovement";

export type PlayerControls = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
};

export const createPlayerControls = (scene: Phaser.Scene): PlayerControls | null => {
  const keyboard = scene.input.keyboard;

  if (!keyboard) {
    return null;
  }

  return {
    cursors: keyboard.createCursorKeys(),
    up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
};

export const readPlayerMovementInput = (controls: PlayerControls | null): PlayerMovementInput => {
  if (!controls) {
    return {
      down: false,
      left: false,
      right: false,
      up: false
    };
  }

  return {
    up: controls.cursors.up.isDown || controls.up.isDown,
    down: controls.cursors.down.isDown || controls.down.isDown,
    left: controls.cursors.left.isDown || controls.left.isDown,
    right: controls.cursors.right.isDown || controls.right.isDown
  };
};
