## Goal
Add pass and shoot actions using the existing movement direction and ball logic.

## Acceptance Criteria
- The player can trigger a pass action from possession.
- The player can trigger a stronger shoot action from possession.
- After a pass or shot, the ball travels independently until possession is regained or the ball stops.
- Controls for pass and shoot are documented in `README.md`.
- The project builds successfully and relevant logic tests are updated.

## Constraints
- Keep pass and shot behavior readable and intentionally arcade-like.
- Reuse shared ball systems instead of duplicating movement logic.
- Do not add scoring rules or opponent behavior in this task.
- Avoid overengineering aiming or input systems.
