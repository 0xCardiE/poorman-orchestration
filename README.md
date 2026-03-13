# Niche Research Digest

Niche Research Digest is a local-first web app for collecting sources, organizing research by topic, linking claims across sources, and producing concise topic digests.

## Current status

Milestone 2 is in place with:
- Vite
- React
- TypeScript
- ESLint
- Vitest
- a basic application shell with header, navigation, and section panels
- core data model modules for sources, topics, claims, and digest items
- local-first persistence via `localStorage`
- seeded demo workspace data for verifying the shell

The current app is still intentionally straightforward. It shows read-only demo records and leaves source editing and deeper workflows for later milestones.

## Project structure

```text
src/
  app/
  components/
  features/
    claims/
    digests/
    sources/
    topics/
  lib/
  types/
tests/
```

Key local-first modules:

```text
src/lib/demoData.ts
src/lib/storage.ts
src/types/source.ts
src/types/topic.ts
src/types/claim.ts
src/types/digest.ts
src/types/workspace.ts
```

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Available commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Notes

The app writes a seeded demo workspace into `localStorage` on first load and includes a reset action to restore that demo state. This milestone focuses on the app shell and data model only; create/edit flows are still pending.
