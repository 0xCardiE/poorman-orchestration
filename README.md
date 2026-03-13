# Browser Football Game

A lightweight 2D browser football game (Phaser 3 + Vite + TypeScript).

## Setup

```bash
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

## Controls

- **Menu:** SPACE — start match
- **Match:**
  - **Arrows** — move (acceleration-based)
  - **Shift** — sprint (drains stamina)
  - **Q** — dribble (close control, slower)
  - **X** — short pass · **Z** — long pass (or finesse shot when shooting)
  - **C** — hold to charge shot, release to shoot
  - **E** — tackle (when near opponent with ball)
  - **Tab** — switch controlled player (5 per team)
  - **R** — restart match
- **Set pieces (throw-in/corner):** Arrows aim, Up/Down power, X to take

## Commands

| Command       | Description        |
|---------------|--------------------|
| `npm run dev` | Start dev server   |
| `npm run build` | Type-check + build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests         |
| `npm run lint` | Lint source       |

## Current status

- **Done:** Base game (1–8) plus advanced gameplay (9–21): stamina & sprint, acceleration & dribble, tackling & fouls, ball spin/curve, out-of-play & set pieces (throw-in, corner, goal kick), short/long pass & charge shot & finesse, goalkeepers (both ends), full teams (5v5), formations (2-1-2, 3-1-1, 2-2-1), player switching (Tab), opponent pressing & formation, two halves & half-time, stoppage time, HUD (stamina, selected player, set-piece). Desktop keyboard controls.
- **Optional later:** Basic mobile controls, difficulty select, one-twos, substitutions.

## Summary (task 11)

**Completed:** Base MVP plus all advanced milestones: movement depth (stamina, sprint, acceleration, dribble), tackling and first-touch, ball physics (spin/curve), set pieces (throw-in, corner, goal kick), passing depth (short/long), shooting depth (charge, finesse), goalkeepers, full team and formations, player switching, opponent AI (pressing, formation), match flow (halves, half-time, stoppage time), fouls, HUD polish.

**Remaining:** Optional: difficulty menu, mobile controls, subs, one-twos.

---

# Poorman AI orchestration

A minimal orchestration setup for running an AI coding agent over a task queue. You define the work in **AGENTS.md**, **PLANS.md**, and **tasks/todo/**; a runner script runs the agent in a loop and moves tasks to **tasks/done/** or **tasks/failed/**.

## Runners

Three runners are provided, one per CLI:

| Runner | CLI command | Use when |
|--------|-------------|----------|
| **runner-codex.sh** | `codex` | You use the Codex CLI. |
| **runner-cursor.sh** | `agent` | You use the Cursor Agent CLI (local). |
| **runner-claude.sh** | `claude` | You use the Anthropic Claude CLI. |

Run from the repo root:

```bash
./runner-codex.sh    # Codex
./runner-cursor.sh   # Cursor Agent
./runner-claude.sh   # Anthropic Claude
```

Each runner:

- Ensures **AGENTS.md** exists (creates a default if missing).
- Installs dependencies if **package.json** exists and **node_modules** is missing.
- If **tasks/todo/** is empty, asks the agent to generate initial tasks there.
- For each task file in **tasks/todo/**:
  - Runs the agent with the task content and AGENTS.md/PLANS.md context.
  - On success: runs `npm run build` if present, moves the task to **tasks/done/**, then commits (so the move is included).
  - On failure: moves the task to **tasks/failed/**, commits that state, then exits.
- When no tasks remain, asks the agent whether more tasks are needed; if not, exits.

Logs go to **logs/** (one `.log` file per task).

## Repo layout

```text
AGENTS.md          # Agent instructions (required)
PLANS.md           # Milestone plan (optional but recommended)
tasks/
  todo/            # Task files to run (e.g. 01-scaffold.md, 02-feature.md)
  done/            # Completed tasks (moved by runner)
  failed/          # Failed tasks (moved by runner)
logs/              # Per-task logs
runner-codex.sh     # Runner for Codex CLI
runner-cursor.sh   # Runner for Cursor Agent CLI
runner-claude.sh   # Runner for Anthropic Claude CLI
```

## Requirements

- The CLI you use must be installed and on your PATH: `codex`, `agent`, or `claude`.
- For **runner-cursor.sh**: Cursor Agent with `agent --print --trust` for non-interactive runs.
- For **runner-claude.sh**: Anthropic Claude CLI (`claude`).

## Starting a new project

1. Clone or create the repo.
2. Add **AGENTS.md** (and optionally **PLANS.md**) for your project.
3. Add task files in **tasks/todo/** (e.g. `01-scaffold.md`, `02-next-step.md`).
4. Run the appropriate script: `./runner-codex.sh`, `./runner-cursor.sh`, or `./runner-claude.sh`.

If **tasks/todo/** is empty, the runner will ask the agent to generate tasks there before proceeding.
