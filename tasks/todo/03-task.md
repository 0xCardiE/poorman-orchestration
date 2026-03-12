## Goal
Make the opponent a real scoring threat by adding a simple attacking action when it has possession near the player's goal.

## Acceptance Criteria
- When the opponent has possession, it can progress into an attacking range and release a shot toward the left goal.
- Opponent attacks can result in normal goal detection and score updates through the existing match rules.
- AI decision logic for choosing between retreating, carrying, and shooting is extracted into a small dedicated helper.
- README controls or gameplay notes are updated if the match behavior becomes meaningfully different.
- Relevant AI decision logic has automated tests where it can be verified outside Phaser.

## Constraints
- Keep the opponent behavior intentionally simple and deterministic.
- Do not introduce extra opponents, formations, or pathfinding.
- Reuse the existing ball motion and possession systems instead of duplicating kick logic.
