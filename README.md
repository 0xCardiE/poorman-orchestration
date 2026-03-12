# Browser Football Game

A lightweight 2D browser football prototype built with TypeScript, Vite, and Phaser 3.

## Setup

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run test
npm run lint
```

## Controls

- `WASD` or arrow keys: move
- `J`: pass
- `K`: shoot
- `R`: restart the current match
- `Esc`: return to the main menu
- `Enter` or `Space`: start from the menu, restart after full time
- Touch devices: use the bottom-left touch pad to move, tap `PASS` or `SHOOT`, and tap the full-time banner to restart

## Current status

Implemented in the current MVP:

- main menu and match scene
- player movement and pitch bounds
- ball possession, pass, and shoot
- one simple opponent
- score, timer, and restart flow
- basic mobile touch controls

Not implemented:

- advanced physics
- multiplayer or backend features
