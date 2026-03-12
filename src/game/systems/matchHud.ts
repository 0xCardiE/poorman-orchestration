import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import type { MatchState } from "../entities/match";
import type { PossessionState } from "../entities/possession";
import { formatKickoffCountdown, formatMatchClock } from "./matchRules";

export type MatchHud = {
  controlsText: Phaser.GameObjects.Text;
  kickoffText: Phaser.GameObjects.Text;
  footerText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  statusText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
};

type MatchHudOptions = {
  touchControlsEnabled?: boolean;
};

export const createMatchHud = (
  scene: Phaser.Scene,
  options: MatchHudOptions = {}
): MatchHud => {
  const touchControlsEnabled = options.touchControlsEnabled ?? false;
  const scoreText = scene.add.text(24, 18, "", {
    color: "#f4f1de",
    fontFamily: "Trebuchet MS",
    fontSize: "28px",
    fontStyle: "bold"
  });

  const timerText = scene.add.text(GAME_WIDTH / 2, 22, "", {
    color: "#f4f1de",
    fontFamily: "Trebuchet MS",
    fontSize: "26px",
    fontStyle: "bold"
  }).setOrigin(0.5, 0);

  const statusText = scene.add.text(24, 54, "", {
    color: "#d9e6c3",
    fontFamily: "Trebuchet MS",
    fontSize: "18px"
  });

  const kickoffText = scene.add.text(GAME_WIDTH / 2, 78, "", {
    color: "#f4f1de",
    fontFamily: "Trebuchet MS",
    fontSize: "34px",
    fontStyle: "bold"
  }).setOrigin(0.5, 0).setVisible(false);

  const controlsText = scene.add.text(
    GAME_WIDTH - 24,
    18,
    touchControlsEnabled
      ? "Move: touch pad\nPass: Pass button\nShoot: Shoot button\nMenu: Menu button"
      : "Move: WASD / Arrows\nPass: Space\nShoot: Shift\nMenu: Esc",
    {
      align: "right",
      color: "#d9e6c3",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    }
  ).setOrigin(1, 0);

  const footerText = scene.add.text(
    GAME_WIDTH / 2,
    GAME_HEIGHT - 18,
    touchControlsEnabled
      ? "Score in the right goal. Touch Menu to leave the match."
      : "Score in the right goal. Press Esc for the menu.",
    {
      color: "#f4f1de",
      fontFamily: "Trebuchet MS",
      fontSize: "16px"
    }
  ).setOrigin(0.5, 1);

  return {
    controlsText,
    footerText,
    kickoffText,
    scoreText,
    statusText,
    timerText
  };
};

export const refreshMatchHud = (
  hud: MatchHud,
  match: MatchState,
  possession: PossessionState | undefined
): void => {
  hud.scoreText.setText(`You ${match.playerScore} - ${match.opponentScore} Opponent`);
  hud.timerText.setText(formatMatchClock(match.remainingMs));
  hud.statusText.setText(getStatusText(match, possession));
  hud.kickoffText.setVisible(match.phase === "kickoff");
  hud.kickoffText.setText(match.phase === "kickoff" ? formatKickoffCountdown(match.kickoffRemainingMs) : "");
};

const getStatusText = (
  match: MatchState,
  possession: PossessionState | undefined
): string => {
  if (match.phase === "finished") {
    return "Status: Full time";
  }

  if (match.phase === "kickoff") {
    return `Status: ${formatKickoffCountdown(match.kickoffRemainingMs)}`;
  }

  if (!possession || possession.owner === null) {
    return "Status: Loose ball";
  }

  return possession.owner === "player"
    ? "Status: You have possession"
    : "Status: Opponent has possession";
};
