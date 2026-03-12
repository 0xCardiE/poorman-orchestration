## Goal
Reduce the production bundle warning and improve initial load behavior with a small, targeted build optimization pass.

## Acceptance Criteria
- The current large-chunk build warning is reduced or removed through a focused change such as code splitting or chunk configuration.
- The game still boots into the main menu and match flow without regressions after the build change.
- Build configuration changes are kept small and documented if they affect development or deployment.
- `npm run build` still passes after the optimization.

## Constraints
- Do not replace Phaser or restructure the whole app around a new loading architecture.
- Avoid premature micro-optimizations outside the main bundle-size issue.
- Keep the change easy to reason about for future gameplay work.
