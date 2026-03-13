import type { WorkspaceData } from "../types/workspace";

export function createDemoWorkspaceData(): WorkspaceData {
  return {
    version: 1,
    meta: {
      name: "Demo workspace",
      seeded: true,
      lastUpdatedAt: "2026-03-13T09:00:00.000Z",
    },
    topics: [
      {
        id: "topic-video-analysis",
        name: "Video Analysis Workflows",
        description:
          "How independent analysts capture, review, and compare match footage.",
        tags: ["analysis", "workflow", "review"],
        questionPrompts: [
          "What slows down manual review the most?",
          "Which source formats are easiest to compare side by side?",
        ],
        createdAt: "2026-03-10T08:00:00.000Z",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
      {
        id: "topic-scouting-notes",
        name: "Scouting Note Quality",
        description:
          "Patterns that make qualitative scouting notes easier to revisit later.",
        tags: ["scouting", "notes", "synthesis"],
        questionPrompts: [
          "How detailed should a note be before it becomes hard to scan?",
        ],
        createdAt: "2026-03-11T08:30:00.000Z",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
    ],
    sources: [
      {
        id: "source-postmatch-template",
        title: "Post-match review template",
        url: "https://example.com/post-match-review-template",
        type: "article",
        publisher: "Analyst Weekly",
        publishedAt: "2026-03-03",
        topicIds: ["topic-video-analysis"],
        tags: ["template", "review"],
        notes:
          "Useful as a baseline structure for segmenting observations into phases of play.",
        summary:
          "A lightweight structure for turning raw match notes into a reusable review document.",
        keyTakeaways: [
          "Separate first-watch notes from second-pass synthesis.",
          "Keep timeline references beside each observation.",
        ],
        createdAt: "2026-03-12T11:00:00.000Z",
        updatedAt: "2026-03-12T11:00:00.000Z",
      },
      {
        id: "source-scouting-checklist",
        title: "Scouting checklist for repeatable note capture",
        url: "https://example.com/scouting-checklist",
        type: "report",
        publisher: "Field Notes Lab",
        publishedAt: "2026-02-26",
        topicIds: ["topic-scouting-notes"],
        tags: ["checklist", "consistency"],
        notes:
          "Strong on structure, weaker on how to link a note back to source evidence.",
        summary:
          "A checklist-driven approach for keeping scouting observations consistent across sessions.",
        keyTakeaways: [
          "Use the same heading order every time.",
          "Track confidence alongside each observation.",
        ],
        createdAt: "2026-03-12T15:30:00.000Z",
        updatedAt: "2026-03-12T15:30:00.000Z",
      },
      {
        id: "source-comparison-notes",
        title: "Research notes on side-by-side source comparison",
        url: "https://example.com/source-comparison-notes",
        type: "note",
        publisher: "Personal workspace",
        publishedAt: "2026-03-12",
        topicIds: ["topic-video-analysis", "topic-scouting-notes"],
        tags: ["comparison", "manual-summary"],
        notes:
          "Suggests that manual summaries are easier to trust when each claim cites at least one source.",
        summary:
          "Internal notes from testing a local-first workflow for source capture and comparison.",
        keyTakeaways: [
          "Short summaries are easier to review than full transcripts.",
          "Topic-level questions help identify gaps early.",
        ],
        createdAt: "2026-03-13T08:00:00.000Z",
        updatedAt: "2026-03-13T08:00:00.000Z",
      },
    ],
    claims: [
      {
        id: "claim-timeline-notes-improve-review",
        text: "Timeline-linked notes make post-match review faster to revisit.",
        sourceId: "source-postmatch-template",
        topicId: "topic-video-analysis",
        notes: "Matches the strongest recommendation from the template article.",
        relatedClaims: [
          {
            claimId: "claim-checklists-improve-consistency",
            relationship: "support",
          },
        ],
        createdAt: "2026-03-12T11:10:00.000Z",
        updatedAt: "2026-03-12T11:10:00.000Z",
      },
      {
        id: "claim-checklists-improve-consistency",
        text: "Repeatable headings improve note quality across scouting sessions.",
        sourceId: "source-scouting-checklist",
        topicId: "topic-scouting-notes",
        notes: "Useful, but it does not fully address evidence linking.",
        relatedClaims: [
          {
            claimId: "claim-manual-summaries-need-citations",
            relationship: "neutral",
          },
        ],
        createdAt: "2026-03-12T15:40:00.000Z",
        updatedAt: "2026-03-12T15:40:00.000Z",
      },
      {
        id: "claim-manual-summaries-need-citations",
        text: "Manual summaries are easier to trust when each claim is tied to a source.",
        sourceId: "source-comparison-notes",
        topicId: "topic-video-analysis",
        notes: "This likely needs more supporting evidence from external sources.",
        relatedClaims: [
          {
            claimId: "claim-checklists-improve-consistency",
            relationship: "support",
          },
        ],
        createdAt: "2026-03-13T08:10:00.000Z",
        updatedAt: "2026-03-13T08:10:00.000Z",
      },
    ],
    digestItems: [
      {
        id: "digest-recent-comparison-notes",
        topicId: "topic-video-analysis",
        title: "Recent source added",
        summary:
          "A new internal note compares manual summary patterns and introduces citation expectations.",
        kind: "recent-source",
        sourceIds: ["source-comparison-notes"],
        claimIds: ["claim-manual-summaries-need-citations"],
        createdAt: "2026-03-13T08:15:00.000Z",
      },
      {
        id: "digest-open-question-evidence",
        topicId: "topic-scouting-notes",
        title: "Open question",
        summary:
          "The workspace still needs a clearer rule for linking scouting notes back to evidence.",
        kind: "open-question",
        sourceIds: ["source-scouting-checklist"],
        claimIds: ["claim-checklists-improve-consistency"],
        createdAt: "2026-03-13T08:20:00.000Z",
      },
    ],
  };
}
