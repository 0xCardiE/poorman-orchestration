Continuous Agent Workflow Guide

Purpose

This guide explains a simple reusable pattern for running Codex as a continuous agent inside a repo using:
	•	one repo-level instruction file
	•	optional high-level planning file
	•	one task per markdown file
	•	one shell script that loops through tasks and moves them through states

This pattern works well when you want the agent to keep working through a backlog with minimal manual prompting.

⸻

Core idea

Treat the repo itself as the agent’s memory.

Each Codex run starts fresh, but it can reconstruct context from:
	•	the current codebase
	•	AGENTS.md
	•	README.md
	•	the current task file

So the workflow is:
	1.	define stable repo rules
	2.	define tasks as small files
	3.	run a loop script
	4.	let Codex execute one task at a time
	5.	verify, commit, and move the task to done
	6.	continue until tasks/todo is empty

⸻

Recommended repo structure

your-repo/
├─ AGENTS.md
├─ PLANS.md                  # optional
├─ README.md
├─ run.sh                    # main continuous runner
├─ logs/
└─ tasks/
   ├─ todo/
   ├─ done/
   └─ failed/

What each file/folder is for

AGENTS.md
Permanent instructions for the agent.

Put here:
	•	project goal
	•	stack
	•	architecture rules
	•	coding rules
	•	what not to do
	•	verification expectations

PLANS.md (optional)
High-level roadmap.

Put here:
	•	milestones
	•	major phases
	•	future features
	•	scope boundaries

This is useful for context, but the actual execution should still be driven by task files.

tasks/todo/*.md
Actual executable tasks.

Each task file should be small and focused.

Good examples:
	•	01-scaffold-project.md
	•	02-add-player-movement.md
	•	03-add-ball-possession.md

tasks/done/
Completed tasks get moved here by the runner.

tasks/failed/
Failed tasks get moved here by the runner.

logs/
One log file per task run.

run.sh
The main orchestrator.

This is the file you run to continue the agent workflow.

⸻

File conventions

AGENTS.md

This is the most important file.

A good structure is:

# Project Agent Instructions

## Goal
Describe what the project is supposed to become.

## Stack
- TypeScript
- Vite
- Phaser 3

## Architecture rules
- Separate gameplay logic from rendering
- Prefer small modules
- Avoid unnecessary dependencies

## Agent rules
- Read the repo before changing anything
- Keep changes minimal
- Do not refactor unrelated files
- Keep the app working after each task
- Run build/test/lint when available

PLANS.md

Optional roadmap file.

Example:

# Project Plan

## Milestones
1. Scaffold project
2. Add main gameplay scene
3. Add controls
4. Add scoring
5. Add polish

Task files

Each task file should include:
	•	goal
	•	acceptance criteria
	•	constraints

Example:

Implement player movement.

Acceptance criteria:
- WASD and arrow keys work
- player stays within bounds
- movement is smooth enough for MVP
- build passes

Constraints:
- keep implementation minimal
- do not refactor unrelated code


⸻

Why tasks should be separate files

Do not put the whole project into one giant prompt.

Separate task files are better because:
	•	they reduce drift
	•	failures are isolated
	•	the loop can resume from where it stopped
	•	task state is visible in the filesystem
	•	the repo stays easier to debug

⸻

Main runner behavior

The runner should do this:
	1.	ensure required folders exist
	2.	ensure AGENTS.md exists
	3.	optionally run npm install if package.json exists and dependencies are missing
	4.	read the first task from tasks/todo
	5.	send prompt + task contents to Codex
	6.	save log output
	7.	run verification
	8.	commit changes if there are changes
	9.	move the task to tasks/done
	10.	continue with the next task
	11.	if a task fails, move it to tasks/failed and stop

The runner should only ask whether the project is complete when tasks/todo is empty.

⸻

Recommended run.sh

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$ROOT_DIR/tasks"
TODO_DIR="$TASKS_DIR/todo"
DONE_DIR="$TASKS_DIR/done"
FAILED_DIR="$TASKS_DIR/failed"
LOGS_DIR="$ROOT_DIR/logs"

mkdir -p "$TODO_DIR" "$DONE_DIR" "$FAILED_DIR" "$LOGS_DIR"

if ! command -v codex >/dev/null 2>&1; then
  echo "Error: codex is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$ROOT_DIR/AGENTS.md" ]; then
  echo "Error: AGENTS.md not found in repo root."
  exit 1
fi

echo "Starting Codex task runner..."
echo "Repo: $ROOT_DIR"
echo "Todo: $TODO_DIR"
echo "Done: $DONE_DIR"
echo "Failed: $FAILED_DIR"
echo

if [ -f "$ROOT_DIR/package.json" ]; then
  echo "Detected package.json"
  if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo "node_modules missing, running npm install..."
    (cd "$ROOT_DIR" && npm install)
  else
    echo "node_modules already present, skipping npm install"
  fi
  echo
fi

shopt -s nullglob
TASK_FILES=("$TODO_DIR"/*.md)

if [ ${#TASK_FILES[@]} -eq 0 ]; then
  echo "No task files found in $TODO_DIR"
  exit 0
fi

run_task() {
  local task_file="$1"
  local task_name
  local log_file
  task_name="$(basename "$task_file" .md)"
  log_file="$LOGS_DIR/${task_name}.log"

  echo "==================================================" | tee "$log_file"
  echo "Running task: $task_name" | tee -a "$log_file"
  echo "Task file: $task_file" | tee -a "$log_file"
  echo "Log: $log_file" | tee -a "$log_file"
  echo "==================================================" | tee -a "$log_file"

  if ! {
    echo "Read AGENTS.md and README.md first."
    echo
    echo "Then execute the task described in $(basename "$task_file")."
    echo
    echo "Rules:"
    echo "- Work only within this repository."
    echo "- Preserve existing working functionality."
    echo "- Keep changes minimal and practical."
    echo "- Do not refactor unrelated code."
    echo "- Inspect package.json if present."
    echo "- If dependencies are missing, run npm install."
    echo "- Run npm run build if available."
    echo "- Run npm run test if available."
    echo "- Run npm run lint if available."
    echo "- Update README.md if setup, controls, or behavior changed."
    echo "- When finished, print a short summary of what you changed."
    echo
    echo "Task file contents:"
    cat "$task_file"
  } | codex exec | tee -a "$log_file"; then
    echo "Task failed during Codex execution: $task_name" | tee -a "$log_file"
    mv "$task_file" "$FAILED_DIR/"
    return 1
  fi

  echo | tee -a "$log_file"

  if [ -f "$ROOT_DIR/package.json" ]; then
    echo "Checking build after task: $task_name" | tee -a "$log_file"
    if (cd "$ROOT_DIR" && npm run build) | tee -a "$log_file"; then
      echo "Build check passed for $task_name" | tee -a "$log_file"
    else
      echo "Build check failed for $task_name" | tee -a "$log_file"
      mv "$task_file" "$FAILED_DIR/"
      return 1
    fi
  fi

  if ! git -C "$ROOT_DIR" diff --quiet || ! git -C "$ROOT_DIR" diff --cached --quiet; then
    git -C "$ROOT_DIR" add -A
    git -C "$ROOT_DIR" commit -m "codex: complete $task_name" || true
  else
    echo "No file changes detected for $task_name" | tee -a "$log_file"
  fi

  mv "$task_file" "$DONE_DIR/"
  echo "Finished task: $task_name" | tee -a "$log_file"
  echo | tee -a "$log_file"
}

for task_file in "${TASK_FILES[@]}"; do
  if ! run_task "$task_file"; then
    echo
    echo "Stopped after failure."
    echo "Inspect $FAILED_DIR and $LOGS_DIR"
    exit 1
  fi
done

echo "All todo tasks completed."


⸻

How to run it

First-time setup
	1.	Create the repo structure.
	2.	Add AGENTS.md.
	3.	Add README.md.
	4.	Add optional PLANS.md.
	5.	Create initial task files in tasks/todo/.
	6.	Save the runner script as run.sh.
	7.	Make it executable:

chmod +x run.sh

Start the workflow

./run.sh

That is the main file to run for the continuous workflow.

⸻

How the workflow resumes

It resumes based on file location.
	•	tasks still in tasks/todo/ are pending
	•	tasks moved to tasks/done/ are complete
	•	tasks moved to tasks/failed/ need attention

This means the system can continue even though Codex itself does not persist memory between runs.

The repo state is the memory.

⸻

How to continue after interruption

If the script stops or the machine restarts:

./run.sh

It will continue with whatever remains in tasks/todo/.

⸻

How to rerun a completed task

Move it back:

mv tasks/done/03-some-task.md tasks/todo/
./run.sh


⸻

How to retry a failed task

Inspect the log first:

cat logs/03-some-task.log

Then move the task back:

mv tasks/failed/03-some-task.md tasks/todo/
./run.sh


⸻

Suggested task-writing rules

Tasks work best when they are:
	•	small
	•	verifiable
	•	specific
	•	ordered

Good:
	•	implement pass mechanic
	•	add score HUD
	•	create restart flow

Bad:
	•	make the game better
	•	build the whole product
	•	improve everything

A good task usually has:
	•	a clear goal
	•	3 to 6 acceptance criteria
	•	1 to 3 constraints

⸻

Naming conventions

Conventional

AGENTS.md is increasingly conventional for agent instructions.

Semi-conventional

PLANS.md is a reasonable roadmap name, but could also be:
	•	ROADMAP.md
	•	ARCHITECTURE.md
	•	PROJECT_PLAN.md

Arbitrary but useful

The tasks/ folder structure is not a universal standard, but it is a very practical convention for autonomous loops.

The numbered filenames are important because they control execution order.

Example:
	•	01-scaffold.md
	•	02-player.md
	•	03-ball.md

⸻

Recommended safety rules

Even if you want strong autonomy, keep these safeguards:
	•	use git
	•	commit after each task
	•	keep tasks small
	•	inspect logs after failures
	•	avoid one giant open-ended prompt

⸻

Minimal reusable checklist

For a new repo:
	1.	create AGENTS.md
	2.	create README.md
	3.	optionally create PLANS.md
	4.	create tasks/todo/, tasks/done/, tasks/failed/, logs/
	5.	add numbered task files to tasks/todo/
	6.	add run.sh
	7.	run chmod +x run.sh
	8.	run ./run.sh

⸻

Final summary

This workflow is built on a simple principle:
	•	AGENTS.md defines how the agent behaves
	•	task files define what the agent should do now
	•	the repo provides memory and current state
	•	run.sh provides orchestration and continuity

That makes the system reusable across many projects with only a few files changed.