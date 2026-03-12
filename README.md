# Browser Football Game

Minimal Vite + TypeScript + Phaser 3 scaffold for a lightweight 2D browser football game. The current state provides a working app shell, a main menu, a dedicated match scene with a simple pitch, ESLint, and Vitest so the next milestones can focus on gameplay.

## Setup

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Start a match from the main menu with the on-screen button or by pressing `Enter` / `Space`. In the match scene, move the player with `WASD` or the arrow keys, and press `Esc` to return to the menu. The player begins each match in possession, with the ball following their movement.

## Available Commands

- `npm run dev` starts Vite in development mode.
- `npm run build` runs TypeScript checks and creates a production build in `dist/`.
- `npm run test` runs the Vitest suite once.
- `npm run lint` runs ESLint on the repository.

## Current Structure

- `src/game/config` contains shared game constants and Phaser config assembly.
- `src/game/scenes` contains Phaser scenes.
- `src/game/entities` contains small gameplay state factories.
- `src/game/systems` contains drawing and gameplay helpers.
- `src/ui` contains DOM mounting helpers.
- `src/utils` contains general utilities.
- `tests` contains automated tests.

## Current Status

The project now boots into a main menu and transitions into a dedicated match scene that renders a simple football pitch with touchlines, a halfway line, penalty areas, goal areas, and goals. One controllable player can move around the pitch and is clamped to the field bounds. The match starts with the player in possession, and the ball follows the player's facing direction using simple gameplay state rather than physics. Passing, shooting, AI, score, and timer logic have not been implemented yet.
