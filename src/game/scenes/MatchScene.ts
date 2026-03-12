import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { MAIN_MENU_SCENE_KEY, MATCH_SCENE_KEY } from "../config/sceneKeys";
import { drawPitch } from "../systems/drawPitch";

export class MatchScene extends Phaser.Scene {
  constructor() {
    super(MATCH_SCENE_KEY);
  }

  create(): void {
    drawPitch(this);

    this.add.text(24, 14, "Match Scene", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      fontStyle: "bold"
    });

    this.add.text(24, 46, "Pitch scaffold ready for player, ball, and match systems.", {
      color: "#d9e6c3",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, "Press Esc to return to the menu", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    }).setOrigin(0.5, 1);

    this.input.keyboard?.on("keydown-ESC", this.returnToMenu, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-ESC", this.returnToMenu, this);
    });
  }

  private returnToMenu(): void {
    this.scene.start(MAIN_MENU_SCENE_KEY);
  }
}
