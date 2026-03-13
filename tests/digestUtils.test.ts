import { describe, expect, it } from "vitest";
import {
  getTopicDigestRecord,
  getTopicDigestRecords,
} from "../src/features/digests/digestUtils";
import { createDemoWorkspaceData } from "../src/lib/demoData";

describe("digestUtils", () => {
  const workspace = createDemoWorkspaceData();

  it("builds topic digests with recent activity, unresolved questions, and explicit conflicts", () => {
    const digest = getTopicDigestRecord(workspace, "topic-video-analysis");

    expect(digest?.recentSources.map((source) => source.id)).toEqual([
      "source-comparison-notes",
      "source-postmatch-template",
    ]);
    expect(digest?.recentClaims.map((claim) => claim.id)).toEqual([
      "claim-phase-buckets-beat-timelines",
      "claim-manual-summaries-need-citations",
      "claim-timeline-notes-improve-review",
    ]);
    expect(digest?.unresolvedQuestions.map((question) => question.reason)).toEqual([
      "topic-question",
      "topic-question",
      "single-source-claim",
      "single-source-claim",
    ]);
    expect(digest?.conflictingClaims).toHaveLength(1);
    expect(digest?.conflictingClaims[0]?.claimIds).toEqual([
      "claim-phase-buckets-beat-timelines",
      "claim-timeline-notes-improve-review",
    ]);
  });

  it("sorts topic digests by latest activity", () => {
    expect(getTopicDigestRecords(workspace).map((digest) => digest.topic.id)).toEqual([
      "topic-video-analysis",
      "topic-scouting-notes",
    ]);
  });

  it("deduplicates mirrored conflicts and flags unlinked claims as unresolved questions", () => {
    const customWorkspace = createDemoWorkspaceData();
    const timelineClaim = customWorkspace.claims.find(
      (claim) => claim.id === "claim-timeline-notes-improve-review",
    );

    if (!timelineClaim) {
      throw new Error("Expected demo claim to exist");
    }

    timelineClaim.relatedClaims = [
      ...timelineClaim.relatedClaims,
      {
        claimId: "claim-phase-buckets-beat-timelines",
        relationship: "contradict",
      },
    ];

    customWorkspace.claims.push({
      id: "claim-needs-linking",
      text: "A fresh claim without linked peer evidence should stay visible.",
      topicId: "topic-video-analysis",
      sourceIds: ["source-comparison-notes", "source-postmatch-template"],
      notes: "",
      relatedClaims: [],
      createdAt: "2026-03-13T09:30:00.000Z",
      updatedAt: "2026-03-13T09:30:00.000Z",
    });

    const digest = getTopicDigestRecord(customWorkspace, "topic-video-analysis");

    expect(digest?.conflictingClaims).toHaveLength(1);
    expect(digest?.conflictingClaims[0]?.claimIds).toEqual([
      "claim-phase-buckets-beat-timelines",
      "claim-timeline-notes-improve-review",
    ]);
    expect(
      digest?.unresolvedQuestions.some(
        (question) =>
          question.reason === "unlinked-claim" &&
          question.claimId === "claim-needs-linking",
      ),
    ).toBe(true);
  });
});
