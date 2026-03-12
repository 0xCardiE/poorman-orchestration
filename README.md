# Browser Football Game

Lightweight browser football MVP built with Vite, TypeScript, and Phaser 3. It is designed for short local play sessions: start from the main menu, play a one-minute match, and restart immediately when full time is reached.

## Setup

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

## Controls

### Main Menu

- `Enter` / `Space` starts a match.
- Mouse or touch can also press the `Start Match` button.

### Match

- `WASD` or arrow keys move the player.
- `Space` passes.
- `Shift` shoots.
- `Esc` returns to the main menu.
- `Enter` or `R` restarts after full time.
- Mouse or touch can also use the on-screen restart and menu buttons shown at full time.

## Gameplay

- Each match lasts 60 seconds.
- You start each kickoff in possession.
- Score by sending a loose ball into the right goal.
- The opponent chases the ball carrier, contests loose balls, and retreats with possession.
- After a goal, play resets from midfield.
- At full time, the result overlay shows the outcome, final score, and restart options.

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

## Current Feature Status

- Implemented: main menu, match scene, one controllable player, one opponent, ball possession, passing, shooting, score, timer, and restart flow.
- Implemented: HUD for score, timer, possession state, and controls reminder.
- Implemented: full-time overlay with keyboard and clickable/tappable restart/menu actions.
- Not implemented: online play, accounts, backend features, advanced physics, commentary, tournaments.
- Deferred: mobile gameplay controls. Touch support is currently limited to menu and full-time buttons so desktop keyboard play remains stable late in MVP development.

## Known Limitations

- Only one human-controlled player and one AI opponent are present.
- The opponent AI is intentionally simple and does not use team tactics or complex pathfinding.
- Ball physics are arcade-style and do not include rebounds, spin, or advanced collisions.
