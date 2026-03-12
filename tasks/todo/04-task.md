## Goal
Introduce the ball and a simple possession model for the controllable player.

## Acceptance Criteria
- A visible ball exists in the match scene.
- The match starts with a clear possession state.
- While the player has possession, the ball follows the player in a consistent way.
- Possession logic is separated from rendering enough to support future passing and shooting.
- Any framework-light possession or follow behavior that can be tested has coverage.

## Constraints
- Keep the implementation intentionally simple; no advanced physics simulation.
- Do not implement pass or shot actions in this task.
- Reuse shared config/constants instead of hardcoding distances and speeds.
- Preserve existing menu and movement flow.
