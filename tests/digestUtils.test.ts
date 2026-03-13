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
});
