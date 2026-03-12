## Goal
Add minimal mobile touch controls for movement, pass, and shoot without destabilizing desktop keyboard play.

## Acceptance Criteria
- A touch-friendly movement control and separate pass/shoot actions are available during the match.
- Desktop keyboard controls continue to work unchanged.
- Touch controls are shown only when appropriate for touch play, or otherwise fail gracefully on desktop.
- Restart and menu flow remain usable on mobile.
- README documents the supported mobile controls and any intentional limitations.

## Constraints
- Keep the implementation lightweight and readable.
- Avoid adding dependencies or building a complex virtual gamepad system.
- If a control tradeoff is necessary, preserve desktop behavior first.
