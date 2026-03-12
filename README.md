# Niche Research Digest

Niche Research Digest is a local-first web app for collecting sources, organizing them by topic, linking claims across sources, and generating concise digest views.

## Project intent

This repository is set up to be driven by an autonomous coding loop. The repo-level instructions live in `AGENTS.md`, the milestone plan lives in `PLANS.md`, and the immediate work queue lives in `tasks/todo/`.

## Intended v1

The first useful version should support:
- source capture with title, URL, type, publisher, date, topic, tags, notes
- topic organization
- manual summaries and key takeaways per source
- claim capture and simple relationship labels
- digest views that surface recent additions and conflicting perspectives
- search and filtering
- local persistence

## Runner workflow

Use:

```bash
./run.sh
```

The runner will:
- read project instructions from `AGENTS.md` and `PLANS.md`
- execute the next task from `tasks/todo/`
- log output to `logs/`
- move completed tasks to `tasks/done/`
- move failed tasks to `tasks/failed/`

## Notes

- The initial build should stay local-first and avoid backend complexity.
- Prefer a simple React + TypeScript implementation.
- Keep the MVP focused on usefulness, clarity, and incremental delivery.
