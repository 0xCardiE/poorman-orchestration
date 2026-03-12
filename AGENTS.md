# Browser Football Game - Agent Instructions

## Goal
Build a lightweight 2D browser football game that runs in the browser and is fun to play in short sessions.

## Product scope for v1
Implement:
- main menu
- match scene
- one controllable player
- one ball
- movement
- passing
- shooting
- simple opponent AI
- score
- timer
- restart match flow
- desktop keyboard controls
- basic mobile controls only if easy after desktop works

Do not implement in v1:
- online multiplayer
- accounts
- backend server
- cosmetics store
- complex physics simulation
- commentary
- tournaments

## Tech stack
- TypeScript
- Vite
- Phaser 3
- Vitest
- ESLint

## Architecture rules
- Keep rendering and gameplay logic separate
- Keep constants in a dedicated config module
- Use small modules
- Prefer simple clear code over abstractions
- Avoid adding dependencies unless necessary
- Keep core game logic framework-light where possible

## Folder structure target
- src/game/scenes
- src/game/entities
- src/game/systems
- src/game/config
- src/ui
- src/utils
- tests

## Quality bar
Before finishing a task:
- run build
- run tests if relevant
- avoid unrelated changes
- keep README updated when setup or controls change

## Coding rules
- Use descriptive names
- Avoid giant files
- Add comments only where needed
- Do not leave dead code unless clearly marked as temporary
- Prefer incremental changes that keep the game playable

## Task behavior
When asked to implement something:
1. inspect current codebase first
2. make a short plan
3. implement the smallest good version
4. verify it runs
5. summarize what changed and what remains

## Definition of done for features
A feature is done when:
- it works in local gameplay
- it does not break existing flow
- build passes
- controls and behavior are documented if user-visible

## Current priority order
1. project scaffold
2. playable pitch and player movement
3. ball and possession
4. pass
5. shoot
6. opponent behavior
7. score and timer
8. polish
