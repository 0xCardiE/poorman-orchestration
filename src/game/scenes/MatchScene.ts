import Phaser from "phaser";
import { createBallState, createPlayerState } from "../entities/matchEntities";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { drawPitch } from "../systems/drawPitch";

export class MatchScene extends Phaser.Scene {
  constructor() {
    super("match");
  }

  create(): void {
    drawPitch(this, GAME_WIDTH, GAME_HEIGHT);

    const player = createPlayerState();
    const ball = createBallState();

    this.add.circle(player.x, player.y, player.radius, 0xf4f1de);
    this.add.circle(ball.x, ball.y, ball.radius, 0xffffff);
    this.add.text(24, 20, "Browser Football Game", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "24px"
    });
    this.add.text(24, 52, "Scaffold ready for gameplay systems.", {
      color: "#d9e6c3",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    });
  }
}
