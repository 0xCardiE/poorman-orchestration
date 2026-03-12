# Browser Football Game

A lightweight 2D browser football game built with Phaser 3. Play quick 90-second matches against a simple AI opponent.

## Setup

```bash
npm install
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Test & Lint

```bash
npm run test
npm run lint
```

## Controls

### Desktop

| Action | Keys |
|--------|------|
| Move | WASD or Arrow keys |
| Pass | Space |
| Shoot | Shift |

### Mobile / Touch

| Action | Control |
|--------|---------|
| Move | Touch left side of screen |
| Pass | PASS button (bottom-right) |
| Shoot | SHOOT button (bottom-right) |

## Gameplay

- You control the blue player on the left side
- Red opponent AI defends the right side
- Walk into the ball to pick it up
- Pass sends the ball in your facing direction
- Shoot kicks the ball harder toward the goal
- Score by getting the ball into the opponent's goal (right side)
- After a goal, play pauses briefly and kickoff goes to the team that conceded
- Match lasts 90 seconds (timer turns red in the last 10 seconds)
- After full time you can restart or return to the main menu
- Game scales to fit the browser window

## Tech Stack

- TypeScript
- Vite
- Phaser 3
- Vitest
- ESLint

## Project Structure

```
src/
  main.ts                  # Entry point
  game/
    config/
      constants.ts         # Game constants
      gameConfig.ts        # Phaser config
    entities/
      Player.ts            # Player entity
      Ball.ts              # Ball entity
      Opponent.ts          # Opponent AI
    scenes/
      MainMenuScene.ts     # Main menu
      MatchScene.ts        # Match gameplay
    systems/
      ScoreManager.ts      # Score tracking
      MatchTimer.ts        # Match timer
tests/
  ScoreManager.test.ts
  MatchTimer.test.ts
```

## Status

v0.3 - Gameplay polish:
- Post-goal kickoff delay with possession given to conceding team
- Timer warning (turns red in last 10 seconds)
- Responsive scaling (FIT mode) for different screen sizes

v0.2 - Polished release:
- Main menu with start button
- Playable pitch with center line, circle, and penalty areas
- Player movement (WASD / arrows)
- Ball with possession pickup and wall bounce physics
- Pass (Space) and shoot (Shift)
- Simple opponent AI (chases ball, shoots at goal)
- Score display and 90-second timer
- Match end screen with restart flow
- Yellow possession ring around ball holder
- Player direction indicator (arrow showing facing)
- "GOAL!" flash animation on scoring
- Basic mobile touch controls (touch-to-move + on-screen buttons)
