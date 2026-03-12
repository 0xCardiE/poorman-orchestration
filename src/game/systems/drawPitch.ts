import Phaser from "phaser";

export const drawPitch = (
  scene: Phaser.Scene,
  width: number,
  height: number
): void => {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0x1f6f3d);
  graphics.fillRect(0, 0, width, height);

  graphics.lineStyle(4, 0xf4f1de, 1);
  graphics.strokeRect(18, 18, width - 36, height - 36);
  graphics.lineBetween(width / 2, 18, width / 2, height - 18);
  graphics.strokeCircle(width / 2, height / 2, 68);
}
