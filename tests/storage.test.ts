import { describe, expect, it } from "vitest";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  exportWorkspaceData,
  parseWorkspaceData,
} from "../src/lib/storage";

describe("storage import and export", () => {
  it("exports workspace data as formatted JSON", () => {
    const workspace = createDemoWorkspaceData();
    const exportedValue = exportWorkspaceData(workspace);

    expect(exportedValue).toContain('"version": 2');
    expect(exportedValue).toContain('"sources"');
  });

  it("normalizes imported workspace data", () => {
    const importedValue = JSON.stringify({
      version: 1,
      meta: {
        name: "Imported",
        seeded: false,
        lastUpdatedAt: "2026-03-13T10:00:00.000Z",
      },
      topics: [
        {
          id: "topic-1",
          name: "Topic One",
          description: "A topic",
          tags: ["alpha", "alpha"],
          questionPrompts: ["Question?", "Question?"],
          createdAt: "2026-03-13T09:00:00.000Z",
          updatedAt: "2026-03-13T10:00:00.000Z",
        },
      ],
      sources: [
        {
          id: "source-1",
          title: "Source One",
          url: "https://example.com",
          type: "article",
          publisher: "Publisher",
          publishedAt: "2026-03-13",
          topicIds: ["topic-1", "topic-1"],
          tags: ["alpha", "alpha"],
          notes: "Notes",
          summary: "Summary",
          keyTakeaways: ["First", "First"],
          createdAt: "2026-03-13T09:00:00.000Z",
          updatedAt: "2026-03-13T10:00:00.000Z",
        },
      ],
      claims: [
        {
          id: "claim-1",
          text: "Claim",
          sourceId: "source-1",
          topicId: "topic-1",
          notes: "Claim notes",
          relatedClaims: [
            {
              claimId: "claim-2",
              relationship: "support",
            },
          ],
          createdAt: "2026-03-13T09:00:00.000Z",
          updatedAt: "2026-03-13T10:00:00.000Z",
        },
      ],
      digestItems: [
        {
          id: "digest-1",
          topicId: "topic-1",
          title: "Digest",
          summary: "Summary",
          kind: "open-question",
          sourceIds: ["source-1", "source-1"],
          claimIds: ["claim-1", "claim-1"],
          createdAt: "2026-03-13T10:00:00.000Z",
        },
      ],
    });

    const workspace = parseWorkspaceData(importedValue);

    expect(workspace).not.toBeNull();
    expect(workspace?.version).toBe(2);
    expect(workspace?.sources[0]?.topicIds).toEqual(["topic-1"]);
    expect(workspace?.sources[0]?.tags).toEqual(["alpha"]);
    expect(workspace?.claims[0]?.sourceIds).toEqual(["source-1"]);
    expect(workspace?.digestItems[0]?.claimIds).toEqual(["claim-1"]);
  });

  it("rejects invalid workspace JSON", () => {
    expect(parseWorkspaceData('{"version":2}')).toBeNull();
  });
});
