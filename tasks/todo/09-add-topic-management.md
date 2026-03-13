Goal:
- Add topic creation and editing so the workspace can be managed without relying on seeded demo topics or imported data.

Acceptance criteria:
- Add a straightforward way to create a topic with name, description, tags, and open questions.
- Add an edit flow for existing topics from the topic section.
- Ensure new and edited topics persist locally and appear immediately in source and claim forms.
- Keep topic pages working with related sources, claims, tags, and digest views after topic changes.
- Confirm the app still builds successfully and relevant tests cover the new topic management logic.

Constraints:
- Keep the topic model lightweight and local-first.
- Do not introduce nested topic hierarchies or backend storage.
- Prefer small domain helpers and simple UI flows over large refactors.
