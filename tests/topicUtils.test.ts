import { describe, expect, it } from "vitest";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  getSourcesForTopic,
  getTopicSnapshot,
  getTopicSnapshots,
} from "../src/features/topics/topicUtils";

describe("topicUtils", () => {
  const workspace = createDemoWorkspaceData();

  it("collects sources for a topic from the existing source assignments", () => {
    expect(
      getSourcesForTopic(workspace, "topic-video-analysis").map(
        (source) => source.id,
      ),
    ).toEqual(["source-postmatch-template", "source-comparison-notes"]);
  });

  it("builds topic snapshots with combined tags, recent sources, and related topics", () => {
    const snapshot = getTopicSnapshot(workspace, "topic-video-analysis");

    expect(snapshot?.recentSources.map((source) => source.id)).toEqual([
      "source-comparison-notes",
      "source-postmatch-template",
    ]);
    expect(snapshot?.claims.map((claim) => claim.id)).toEqual([
      "claim-phase-buckets-beat-timelines",
      "claim-manual-summaries-need-citations",
      "claim-timeline-notes-improve-review",
    ]);
    expect(snapshot?.tags.map((entry) => entry.tag)).toEqual([
      "review",
      "analysis",
      "comparison",
      "manual-summary",
      "template",
      "workflow",
    ]);
    expect(snapshot?.relatedTopics).toEqual([
      {
        topicId: "topic-scouting-notes",
        name: "Scouting Note Quality",
        sharedSourceCount: 1,
      },
    ]);
  });

  it("sorts topic snapshots by their latest source activity", () => {
    expect(getTopicSnapshots(workspace).map((snapshot) => snapshot.topic.id)).toEqual(
      ["topic-video-analysis", "topic-scouting-notes"],
    );
  });
});
