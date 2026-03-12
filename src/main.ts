import { createGameRoot } from "./ui/createGameRoot";
import { startGame } from "./game/startGame";
import "./styles.css";

const container = createGameRoot("app");

startGame(container);
