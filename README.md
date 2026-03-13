# Niche Research Digest

Niche Research Digest is a local-first web app for collecting sources, organizing research by topic, linking claims across sources, and producing concise topic digests.

## Current status

Milestone 1 is scaffolded with:
- Vite
- React
- TypeScript
- ESLint
- Vitest
- the initial feature-oriented folder structure from `AGENTS.md`

The current app is intentionally minimal. It provides a simple shell only, without product features yet.

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

The app shell is intentionally feature-light for Milestone 1. It establishes the TypeScript, linting, testing, and folder conventions that later tasks will build on.
