import Phaser from "phaser";
import {
  getEmptyActionInput,
  getEmptyMovementInput,
  type PlayerActionInput
} from "./playerInput";
import type { PlayerMovementInput } from "./playerMovement";

export type PlayerControls = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  pass: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  shoot: Phaser.Input.Keyboard.Key;
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
    right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    pass: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    shoot: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  };
};

export const readPlayerMovementInput = (controls: PlayerControls | null): PlayerMovementInput => {
  if (!controls) {
    return getEmptyMovementInput();
  }

  return {
    up: controls.cursors.up.isDown || controls.up.isDown,
    down: controls.cursors.down.isDown || controls.down.isDown,
    left: controls.cursors.left.isDown || controls.left.isDown,
    right: controls.cursors.right.isDown || controls.right.isDown
  };
};

export const readPlayerActionInput = (controls: PlayerControls | null): PlayerActionInput => {
  if (!controls) {
    return getEmptyActionInput();
  }

  return {
    pass: Phaser.Input.Keyboard.JustDown(controls.pass),
    shoot: Phaser.Input.Keyboard.JustDown(controls.shoot)
  };
};
