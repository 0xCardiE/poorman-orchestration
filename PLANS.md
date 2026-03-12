# Niche Research Digest Plan

## Objective
Build a local-first web app for collecting sources, organizing research by topic, linking claims across sources, and producing concise digest views.

## Milestone 1 - Scaffold
- Set up Vite + React + TypeScript
- Add ESLint
- Add Vitest
- Create initial folder structure
- Create README with setup and commands

## Milestone 2 - App Shell and Data Model
- Add layout, header, navigation, and empty states
- Define core types for sources, topics, claims, and digests
- Add local persistence with sensible seed data or defaults

## Milestone 3 - Source Library
- Add source list view
- Add source create and edit flows
- Capture title, URL, type, publisher, date, topic, tags, notes
- Add source detail view with summary and takeaways

## Milestone 4 - Topics and Tag Organization
- Add topic pages
- Group sources by topic
- Show related tags and recent additions
- Keep relationships simple and readable

## Milestone 5 - Claims and Relationships
- Add claim records linked to sources
- Support support, contradict, and neutral relationship labels
- Show linked claims on source and topic pages
- Keep relationship editing straightforward

## Milestone 6 - Digest View
- Add digest page with highlights by topic
- Surface recent sources, unresolved questions, and conflicting claims
- Keep digest generation rule-based and transparent

## Milestone 7 - Search, Filters, and Export
- Add search across titles, notes, topics, and claims
- Add basic filters for topic, tag, source type, and relationship state
- Add JSON import/export if it fits cleanly

## Milestone 8 - Polish
- Improve information density and readability
- Add small tests for core digest or relationship logic
- Fix obvious UX and state bugs
- Keep code tidy without large refactors

## Execution rules
- Complete milestones in order
- After each milestone, verify project still builds
- If something is unclear, choose the simplest useful v1 interpretation
- Record progress in README or a progress section if useful
