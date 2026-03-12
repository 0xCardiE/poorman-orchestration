#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$ROOT_DIR/tasks"
LOGS_DIR="$ROOT_DIR/logs"

mkdir -p "$LOGS_DIR"

if ! command -v codex >/dev/null 2>&1; then
  echo "Error: codex is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$ROOT_DIR/AGENTS.md" ]; then
  echo "Error: AGENTS.md not found in repo root."
  exit 1
fi

if [ ! -d "$TASKS_DIR" ]; then
  echo "Error: tasks directory not found."
  exit 1
fi

echo "Starting Codex task runner..."
echo "Repo: $ROOT_DIR"
echo "Tasks: $TASKS_DIR"
echo

shopt -s nullglob
TASK_FILES=("$TASKS_DIR"/*.md)

if [ ${#TASK_FILES[@]} -eq 0 ]; then
  echo "No task files found in $TASKS_DIR"
  exit 1
fi

for task_file in "${TASK_FILES[@]}"; do
  task_name="$(basename "$task_file" .md)"
  log_file="$LOGS_DIR/${task_name}.log"

  echo "=================================================="
  echo "Running task: $task_name"
  echo "Log: $log_file"
  echo "=================================================="

  PROMPT=$(
    cat <<EOF
Read AGENTS.md first.

Then execute the task described in $(basename "$task_file").

Rules:
- Work only within this repository.
- Preserve existing working functionality.
- Keep changes minimal and practical.
- Do not refactor unrelated code.
- Run the relevant build/test commands if available.
- Update README.md if setup, controls, or behavior changed.
- When finished, print a short summary of what you changed.

Task file contents:
$(cat "$task_file")
EOF
  )

  if ! codex exec "$PROMPT" | tee "$log_file"; then
    echo
    echo "Task failed: $task_name"
    echo "See log: $log_file"
    exit 1
  fi

  echo | tee -a "$log_file"
  echo "Checking build after task: $task_name" | tee -a "$log_file"
  if (cd "$ROOT_DIR" && npm run build) | tee -a "$log_file"; then
    echo "Build check passed for $task_name" | tee -a "$log_file"
  else
    echo "Build check failed for $task_name" | tee -a "$log_file"
    echo "See log: $log_file"
    exit 1
  fi

  if ! git diff --quiet || ! git diff --cached --quiet; then
    git add -A
    git commit -m "codex: complete $task_name" || true
  else
    echo "No file changes detected for $task_name"
  fi

  echo
  echo "Finished task: $task_name"
  echo
done

echo "All tasks completed."
