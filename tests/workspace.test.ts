import { describe, expect, it } from "vitest";
import {
  createEmptySourceFormValues,
  createSourceRecord,
} from "../src/features/sources/sourceUtils";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  getSectionCount,
  getTopicName,
  saveSourceRecord,
} from "../src/lib/workspace";

describe("createDemoWorkspaceData", () => {
  it("creates the seeded records needed for the app shell", () => {
    const workspace = createDemoWorkspaceData();

    expect(workspace.sources).toHaveLength(3);
    expect(workspace.topics).toHaveLength(2);
    expect(workspace.claims).toHaveLength(3);
    expect(workspace.digestItems).toHaveLength(2);
    expect(workspace.meta.seeded).toBe(true);
  });
});

describe("workspace helpers", () => {
  const workspace = createDemoWorkspaceData();

  it("returns counts for each top-level section", () => {
    expect(getSectionCount(workspace, "sources")).toBe(3);
    expect(getSectionCount(workspace, "topics")).toBe(2);
    expect(getSectionCount(workspace, "claims")).toBe(3);
    expect(getSectionCount(workspace, "digests")).toBe(2);
  });

  it("looks up topic names by id", () => {
    expect(getTopicName(workspace, "topic-video-analysis")).toBe(
      "Video Analysis Workflows",
    );
    expect(getTopicName(workspace, "missing")).toBe("Unknown topic");
  });

  it("saves new source records and updates workspace metadata", () => {
    const formValues = createEmptySourceFormValues("2026-03-13");
    const nextSource = createSourceRecord(
      {
        ...formValues,
        title: "Fresh source",
      },
      "2026-03-13T10:00:00.000Z",
    );

    const nextWorkspace = saveSourceRecord(workspace, nextSource);

    expect(nextWorkspace.sources[0]?.id).toBe(nextSource.id);
    expect(nextWorkspace.sources).toHaveLength(4);
    expect(nextWorkspace.meta.seeded).toBe(false);
    expect(nextWorkspace.meta.lastUpdatedAt).toBe("2026-03-13T10:00:00.000Z");
  });
});
