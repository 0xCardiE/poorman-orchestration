## Goal
Add a short kickoff reset flow so match starts and post-goal restarts are clearer and easier to read during play.

## Acceptance Criteria
- A kickoff state exists at match start and after each goal.
- During kickoff reset, player, opponent, and ball positions return to their starting locations.
- A short visible countdown or status message signals when play becomes active again.
- Player movement and ball actions are disabled until the kickoff state ends.
- Any extracted kickoff timing or state transition logic that is framework-light has test coverage.

## Constraints
- Keep the flow fast enough for short sessions.
- Do not add new scenes for kickoff handling.
- Reuse existing match state and HUD patterns where practical.
