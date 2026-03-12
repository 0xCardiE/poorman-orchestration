# Browser Football Game

A lightweight 2D browser football prototype built with TypeScript, Vite, and Phaser 3.

## Setup

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

## Controls

Desktop:

- `Enter`, `Space`, or click: start from the main menu
- `WASD` or arrow keys: move
- `J`: pass
- `K`: shoot
- `R`: restart the current match
- `Esc`: return to the main menu
- `Enter` or `Space`: restart after full time

Touch devices:

- Tap the menu screen to start
- Use the bottom-left touch pad to move
- Tap `PASS` to pass
- Tap `SHOOT` to shoot
- Tap the full-time banner to restart

## Current status

Implemented in the current MVP:

- main menu and match scene
- one controllable player and one simple opponent
- player movement with pitch boundaries
- ball possession, passing, and shooting
- score tracking and a 60-second match timer
- restart flow during play and after full time
- basic touch controls alongside desktop keyboard controls

Not implemented:

- advanced physics
- multiplayer or backend features
