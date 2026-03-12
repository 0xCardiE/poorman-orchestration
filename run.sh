#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$ROOT_DIR/tasks"
TODO_DIR="$TASKS_DIR/todo"
DONE_DIR="$TASKS_DIR/done"
FAILED_DIR="$TASKS_DIR/failed"
LOGS_DIR="$ROOT_DIR/logs"

mkdir -p "$TODO_DIR" "$DONE_DIR" "$FAILED_DIR" "$LOGS_DIR"

if ! command -v agent >/dev/null 2>&1; then
  echo "Error: agent is not installed or not in PATH."
  exit 1
fi

if [ ! -f "$ROOT_DIR/AGENTS.md" ]; then
  echo "Error: AGENTS.md not found in repo root."
  exit 1
fi

echo "Starting Cursor Agent task runner..."
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
  local prompt
  task_name="$(basename "$task_file" .md)"
  log_file="$LOGS_DIR/${task_name}.log"

  echo "==================================================" | tee "$log_file"
  echo "Running task: $task_name" | tee -a "$log_file"
  echo "Task file: $task_file" | tee -a "$log_file"
  echo "Log: $log_file" | tee -a "$log_file"
  echo "==================================================" | tee -a "$log_file"

  prompt="$(
    {
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
    }
  )"

  if ! agent --print --trust "$prompt" | tee -a "$log_file"; then
    echo "Task failed during Cursor Agent execution: $task_name" | tee -a "$log_file"
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
    git -C "$ROOT_DIR" commit -m "agent: complete $task_name" || true
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