# Browser Football Game

Minimal Vite + TypeScript + Phaser 3 scaffold for a lightweight 2D browser football game. The current state provides a working app shell, a single Phaser match scene, ESLint, and Vitest so the next milestones can focus on gameplay.

## Setup

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

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

The project currently boots into a minimal match scene that draws a pitch, a placeholder player, and a ball. No movement, passing, shooting, AI, score, or timer logic has been implemented yet.
