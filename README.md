# Niche Research Digest

Niche Research Digest is a local-first web app for collecting sources, organizing research by topic, linking claims across sources, and producing concise topic digests.

## Current status

Milestones 1 through 6 are in place with:
- Vite
- React
- TypeScript
- ESLint
- Vitest
- a basic application shell with header, navigation, and section panels
- core data model modules for sources, topics, claims, and digest items
- local-first persistence via `localStorage`
- seeded demo workspace data for verifying the shell
- source create and edit flows with manual summaries and takeaways
- topic views that group related sources, show shared tags, and surface recent additions
- claim create and edit flows with explicit source links and simple claim-to-claim relationships
- digest dashboards grouped by topic with recent additions, unresolved questions, and conflicting claims derived from saved data

The current app is still intentionally straightforward. Claim relationships and digest generation remain explicit and rule-based: recent items are chosen by timestamps, unresolved questions come from saved topic prompts plus deterministic evidence-gap checks, and conflicts only appear when a claim is explicitly marked as contradicting another claim.

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

The app writes a seeded demo workspace into `localStorage` on first load and includes a reset action to restore that demo state. Topic navigation is intentionally lightweight: sources can belong to multiple topics, and topic relationships are derived from those shared source assignments instead of a nested taxonomy.
