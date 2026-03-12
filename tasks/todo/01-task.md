## Goal
Extract the match HUD and full-time overlay out of `MatchScene` into small dedicated modules so gameplay orchestration and UI rendering are more clearly separated.

## Acceptance Criteria
- `MatchScene` no longer contains the full HUD and overlay construction inline.
- HUD creation and HUD refresh logic live in small reusable modules under `src/game/systems` or `src/ui`.
- The full-time overlay still shows the result, restart action, and menu action with the current behavior unchanged.
- The game still builds and the existing automated tests still pass.

## Constraints
- Do not change core gameplay rules in this task.
- Keep the UI visuals functionally the same unless a small cleanup is required by the extraction.
- Prefer simple data flow over introducing a large UI abstraction layer.
