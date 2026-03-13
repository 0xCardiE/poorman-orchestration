#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$ROOT_DIR/tasks"
TODO_DIR="$TASKS_DIR/todo"
DONE_DIR="$TASKS_DIR/done"
FAILED_DIR="$TASKS_DIR/failed"
LOGS_DIR="$ROOT_DIR/logs"

mkdir -p "$TODO_DIR" "$DONE_DIR" "$FAILED_DIR" "$LOGS_DIR"
cd "$ROOT_DIR"

echo "Codex runner starting..."

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI not installed or not in PATH."
  exit 1
fi

if [ ! -f "$ROOT_DIR/AGENTS.md" ]; then
  echo "Creating default AGENTS.md"
  cat <<'EOF' > "$ROOT_DIR/AGENTS.md"
# Agent instructions

You are working inside this repository.

Rules:
- Keep changes minimal and safe
- Do not break existing functionality
- Inspect the repository before changes
- Prefer small modular code
- Install dependencies if package.json exists
- Run build/test/lint when available
EOF
fi

if [ -f "$ROOT_DIR/package.json" ] && [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  (cd "$ROOT_DIR" && npm install)
fi

if [ -z "$(ls -A "$TODO_DIR" 2>/dev/null)" ]; then
  echo "No tasks in tasks/todo/. Asking Codex to generate initial tasks..."
  codex exec "
Read AGENTS.md and PLANS.md if present.

Analyze the repository and create a series of development tasks.

Create markdown files in tasks/todo/ named like:
01-task-name.md
02-task-name.md
...

Each file must contain: goal, acceptance criteria, constraints.
Tasks should progress logically and be small.
"
fi

run_task() {
  local task_file="$1"
  local task_name
  task_name="$(basename "$task_file")"
  local log_file="$LOGS_DIR/${task_name}.log"

  echo "Running task $task_name"

  if ! {
    echo "Read AGENTS.md and PLANS.md first."
    echo
    echo "Execute the task described in $task_name"
    echo
    cat "$task_file"
  } | codex exec | tee "$log_file"; then
    echo "Task failed"
    mv "$task_file" "$FAILED_DIR/"
    git -C "$ROOT_DIR" add -A || true
    git -C "$ROOT_DIR" commit -m "codex failed $task_name" || true
    return 1
  fi

  if [ -f "$ROOT_DIR/package.json" ]; then
    (cd "$ROOT_DIR" && npm run build) || true
  fi

  mv "$task_file" "$DONE_DIR/"
  git -C "$ROOT_DIR" add -A || true
  git -C "$ROOT_DIR" commit -m "codex completed $task_name" || true
}

while true; do
  shopt -s nullglob
  TASKS=("$TODO_DIR"/*.md)

  if [ ${#TASKS[@]} -eq 0 ]; then
    echo "No tasks left. Asking Codex if more tasks are needed..."
    codex exec "
Read AGENTS.md, PLANS.md, and the repository.

If the project is unfinished, generate additional tasks in tasks/todo/.

If the project is complete, say COMPLETE.
"
    sleep 1
    TASKS=("$TODO_DIR"/*.md)
    if [ ${#TASKS[@]} -eq 0 ]; then
      echo "Runner finished."
      break
    fi
  fi

  run_task "${TASKS[0]}" || exit 1
done
