# Niche Research Digest - Agent Instructions

## Goal
Build a browser-based research workspace that helps a user collect sources, capture key claims, compare perspectives, and produce concise topic digests.

## Product scope for v1
Implement:
- app scaffold
- dashboard with clear navigation
- source library with title, URL, type, publisher, date, topic, tags, and notes
- source detail view with manual summary and key takeaways
- claim capture with support, contradict, or neutral relationships
- topic pages that group related sources and claims
- digest view that highlights recent additions and unresolved questions
- search and filters across sources, topics, and claims
- local persistence
- basic import/export if it is easy after core flows work

Do not implement in v1:
- user accounts
- backend server
- real-time collaboration
- browser extension capture flow
- full web scraping pipeline
- vector database or embeddings infrastructure
- paid plans or billing

## Tech stack
- TypeScript
- Vite
- React
- localStorage or IndexedDB for persistence
- Vitest
- ESLint

## Architecture rules
- Keep domain logic separate from UI components
- Keep source, topic, claim, and digest models in dedicated modules
- Prefer pure functions for digest and relationship logic
- Use small components and small feature modules
- Avoid unnecessary dependencies
- Prefer local-first design and simple data flows

## Folder structure target
- src/app
- src/components
- src/features/sources
- src/features/topics
- src/features/claims
- src/features/digests
- src/lib
- src/types
- tests

## Quality bar
Before finishing a task:
- run build
- run tests if relevant
- avoid unrelated changes
- keep README updated when setup or behavior changes

## Coding rules
- Use descriptive names
- Avoid giant files
- Add comments only where needed
- Do not leave dead code unless clearly marked as temporary
- Prefer incremental changes that keep the app usable

## Task behavior
When asked to implement something:
1. inspect current codebase first
2. make a short plan
3. implement the smallest good version
4. verify it runs
5. summarize what changed and what remains

## Definition of done for features
A feature is done when:
- it works in the browser
- it does not break existing flows
- build passes
- important user behavior is documented if visible

## Current priority order
1. project scaffold
2. source capture and storage
3. topic and tag organization
4. claim capture and linking
5. digest generation
6. search and filters
7. import/export
8. polish
