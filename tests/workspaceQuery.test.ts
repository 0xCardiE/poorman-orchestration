import { describe, expect, it } from "vitest";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  ALL_FILTER_VALUE,
  createDefaultWorkspaceFilters,
  getFilteredWorkspaceView,
  getWorkspaceFilterOptions,
} from "../src/lib/workspaceQuery";

describe("workspaceQuery", () => {
  const workspace = createDemoWorkspaceData();

  it("searches across source titles, topics, and linked claims", () => {
    const sourceResults = getFilteredWorkspaceView(workspace, {
      ...createDefaultWorkspaceFilters(),
      searchText: "timeline-linked notes",
    });
    const topicResults = getFilteredWorkspaceView(workspace, {
      ...createDefaultWorkspaceFilters(),
      searchText: "Scouting Note Quality",
    });
    const claimResults = getFilteredWorkspaceView(workspace, {
      ...createDefaultWorkspaceFilters(),
      searchText: "post-match review template",
    });

    expect(sourceResults.sources.map((source) => source.id)).toContain(
      "source-postmatch-template",
    );
    expect(topicResults.topics.map((topic) => topic.id)).toContain(
      "topic-scouting-notes",
    );
    expect(claimResults.claims.map((claim) => claim.id)).toContain(
      "claim-timeline-notes-improve-review",
    );
  });

  it("applies topic, tag, source type, and relationship filters", () => {
    const filtered = getFilteredWorkspaceView(workspace, {
      searchText: "",
      topicId: "topic-video-analysis",
      tag: "review",
      sourceType: "article",
      relationshipState: "support",
    });

    expect(filtered.sources.map((source) => source.id)).toEqual([
      "source-postmatch-template",
    ]);
    expect(filtered.claims.map((claim) => claim.id)).toContain(
      "claim-timeline-notes-improve-review",
    );
    expect(filtered.topics.map((topic) => topic.id)).toEqual([
      "topic-video-analysis",
    ]);
    expect(filtered.hasActiveFilters).toBe(true);
  });

  it("returns compact filter options from saved topics and tags", () => {
    const options = getWorkspaceFilterOptions(workspace);

    expect(options.topics[0]?.label).toBe("Scouting Note Quality");
    expect(options.tags.map((tag) => tag.value)).toContain("review");
    expect(options.sourceTypes.map((sourceType) => sourceType.value)).toEqual([
      "article",
      "paper",
      "report",
      "note",
    ]);
    expect(options.relationshipStates.map((state) => state.value)).toEqual([
      "support",
      "contradict",
      "neutral",
    ]);
    expect(ALL_FILTER_VALUE).toBe("all");
  });
});
