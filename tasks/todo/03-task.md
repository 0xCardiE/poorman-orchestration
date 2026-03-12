## Goal
Implement one controllable player with desktop keyboard movement inside the pitch.

## Acceptance Criteria
- A visible player entity appears in the match scene.
- Keyboard controls move the player smoothly on desktop.
- The player stays within pitch bounds.
- Movement-related values live in config rather than being scattered through scene code.
- Add or update tests for any extracted movement logic that is practical to verify outside Phaser.

## Constraints
- Keep player logic in small modules under `entities` and `systems` where it improves clarity.
- Do not add ball possession, passing, or shooting yet.
- Avoid complex animation work; a simple placeholder representation is enough.
- Run build and relevant tests before finishing.
