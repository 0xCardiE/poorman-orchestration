## Goal
Add the first playable game flow with a main menu scene and a match scene that renders a simple football pitch.

## Acceptance Criteria
- The game boots into a main menu scene with a clear way to start a match.
- Starting the match transitions into a dedicated match scene.
- The match scene renders a recognizable pitch with boundaries and goals/goal areas marked simply.
- Scene setup is organized under `src/game/scenes` and reusable configuration is kept in `src/game/config`.
- The project still builds successfully after the scene flow is added.

## Constraints
- Keep visuals simple and code readable.
- Separate scene rendering concerns from future gameplay systems where practical.
- Do not implement ball logic, scoring, or AI in this task.
- Keep the game playable after the scene transition is introduced.
