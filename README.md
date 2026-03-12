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

| Action | Keys |
|--------|------|
| Move | WASD or Arrow keys |
| Pass | Space |
| Shoot | Shift |

## Gameplay

- You control the blue player on the left side
- Red opponent AI defends the right side
- Walk into the ball to pick it up
- Pass sends the ball in your facing direction
- Shoot kicks the ball harder toward the goal
- Score by getting the ball into the opponent's goal (right side)
- Match lasts 90 seconds
- After full time you can restart or return to the main menu

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

v0.1 - All core features implemented:
- Main menu with start button
- Playable pitch with center line and circle
- Player movement (WASD / arrows)
- Ball with possession pickup
- Pass (Space) and shoot (Shift)
- Simple opponent AI (chases ball, shoots at goal)
- Score display and 90-second timer
- Match end screen with restart flow
