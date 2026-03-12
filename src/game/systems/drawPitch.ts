import Phaser from "phaser";
import {
  CENTER_CIRCLE_RADIUS,
  GOAL,
  GOAL_AREA,
  PENALTY_AREA,
  PITCH_BACKGROUND_COLOR,
  PITCH_BOUNDS,
  PITCH_GRASS_COLOR,
  PITCH_LINE_COLOR
} from "../config/pitch";

export const drawPitch = (scene: Phaser.Scene): void => {
  const graphics = scene.add.graphics();
  const centerX = PITCH_BOUNDS.x + PITCH_BOUNDS.width / 2;
  const centerY = PITCH_BOUNDS.y + PITCH_BOUNDS.height / 2;
  const penaltyTop = centerY - PENALTY_AREA.width / 2;
  const goalAreaTop = centerY - GOAL_AREA.width / 2;
  const goalTop = centerY - GOAL.width / 2;

  graphics.fillStyle(PITCH_BACKGROUND_COLOR);
  graphics.fillRect(0, 0, scene.scale.width, scene.scale.height);

  graphics.fillStyle(PITCH_GRASS_COLOR);
  graphics.fillRect(PITCH_BOUNDS.x, PITCH_BOUNDS.y, PITCH_BOUNDS.width, PITCH_BOUNDS.height);

  graphics.lineStyle(4, PITCH_LINE_COLOR, 1);
  graphics.strokeRect(PITCH_BOUNDS.x, PITCH_BOUNDS.y, PITCH_BOUNDS.width, PITCH_BOUNDS.height);
  graphics.lineBetween(centerX, PITCH_BOUNDS.y, centerX, PITCH_BOUNDS.y + PITCH_BOUNDS.height);
  graphics.strokeCircle(centerX, centerY, CENTER_CIRCLE_RADIUS);

  graphics.strokeRect(PITCH_BOUNDS.x, penaltyTop, PENALTY_AREA.depth, PENALTY_AREA.width);
  graphics.strokeRect(
    PITCH_BOUNDS.x + PITCH_BOUNDS.width - PENALTY_AREA.depth,
    penaltyTop,
    PENALTY_AREA.depth,
    PENALTY_AREA.width
  );

  graphics.strokeRect(PITCH_BOUNDS.x, goalAreaTop, GOAL_AREA.depth, GOAL_AREA.width);
  graphics.strokeRect(
    PITCH_BOUNDS.x + PITCH_BOUNDS.width - GOAL_AREA.depth,
    goalAreaTop,
    GOAL_AREA.depth,
    GOAL_AREA.width
  );

  graphics.strokeRect(PITCH_BOUNDS.x - GOAL.depth, goalTop, GOAL.depth, GOAL.width);
  graphics.strokeRect(
    PITCH_BOUNDS.x + PITCH_BOUNDS.width,
    goalTop,
    GOAL.depth,
    GOAL.width
  );
}
