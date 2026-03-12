## Goal
Reconstruct the missing project scaffold for a Vite + TypeScript + Phaser 3 game so the repository has a real source tree instead of only instructions, installed dependencies, and build output.

## Acceptance Criteria
- A `package.json` exists with scripts for `dev`, `build`, `test`, and `lint`.
- The repo contains the initial folder structure from `AGENTS.md`, including `src/game/scenes`, `src/game/entities`, `src/game/systems`, `src/game/config`, `src/ui`, `src/utils`, and `tests`.
- Vite, TypeScript, Phaser 3, Vitest, and ESLint are configured with minimal working defaults.
- A minimal app entry point exists and the project builds successfully.
- `README.md` documents setup and available commands.

## Constraints
- Keep the scaffold minimal; do not add extra libraries unless required.
- Prefer small modules and keep gameplay logic framework-light.
- Avoid unrelated cleanup of generated files or user changes.
- Verify the build before closing the task.
