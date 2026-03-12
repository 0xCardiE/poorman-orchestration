## Goal
Add at least one simple opponent that creates pressure during play.

## Acceptance Criteria
- A visible opponent entity appears in the match scene.
- The opponent follows a basic readable behavior, such as chasing the ball carrier or defending a zone.
- The opponent can contest loose balls or possession in a simple deterministic way.
- AI code lives in a small dedicated module under `src/game/systems` or similar.
- The game remains playable and the build still passes.

## Constraints
- Keep the AI intentionally basic and easy to reason about.
- Do not introduce pathfinding, complex tactics, or additional game modes.
- Preserve existing player, ball, pass, and shot behavior unless a change is needed for integration.
- Add tests only for logic that can be cleanly extracted from Phaser objects.
