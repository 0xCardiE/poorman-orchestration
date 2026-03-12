import Phaser from "phaser";
import { GAME_WIDTH } from "../config/dimensions";
import { MATCH_SCENE_KEY, MAIN_MENU_SCENE_KEY } from "../config/sceneKeys";

const MENU_BACKGROUND_COLOR = 0x123524;
const BUTTON_COLOR = 0xf4f1de;
const BUTTON_TEXT_COLOR = "#123524";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(MAIN_MENU_SCENE_KEY);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(MENU_BACKGROUND_COLOR);

    this.add.text(GAME_WIDTH / 2, 150, "Browser Football Game", {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "42px"
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 220, "Quick local match prototype", {
      color: "#d8ecd2",
      fontFamily: "Trebuchet MS",
      fontSize: "20px"
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(GAME_WIDTH / 2, 320, 260, 72, BUTTON_COLOR);
    startButton.setInteractive({ useHandCursor: true });
    startButton.on("pointerup", this.startMatch, this);

    this.add.text(GAME_WIDTH / 2, 320, "Start Match", {
      color: BUTTON_TEXT_COLOR,
      fontFamily: "Trebuchet MS",
      fontSize: "28px",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 390, "Click the button or press Enter / Space", {
      color: "#d8ecd2",
      fontFamily: "Trebuchet MS",
      fontSize: "18px"
    }).setOrigin(0.5);

    this.input.keyboard?.once("keydown-ENTER", this.startMatch, this);
    this.input.keyboard?.once("keydown-SPACE", this.startMatch, this);
  }

  private startMatch(): void {
    this.scene.start(MATCH_SCENE_KEY);
  }
}
