import { describe, expect, it } from "vitest";
import {
  createClaimRecord,
  createEmptyClaimFormValues,
} from "../src/features/claims/claimUtils";
import { createTopicRecord } from "../src/features/topics/topicFormUtils";
import {
  createEmptySourceFormValues,
  createSourceRecord,
} from "../src/features/sources/sourceUtils";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  getSectionCount,
  saveClaimRecord,
  getTopicName,
  saveSourceRecord,
  saveTopicRecord,
} from "../src/lib/workspace";

describe("createDemoWorkspaceData", () => {
  it("creates the seeded records needed for the app shell", () => {
    const workspace = createDemoWorkspaceData();

    expect(workspace.sources).toHaveLength(3);
    expect(workspace.topics).toHaveLength(2);
    expect(workspace.claims).toHaveLength(4);
    expect(workspace.digestItems).toHaveLength(2);
    expect(workspace.meta.seeded).toBe(true);
  });
});

describe("workspace helpers", () => {
  const workspace = createDemoWorkspaceData();

  it("returns counts for each top-level section", () => {
    expect(getSectionCount(workspace, "sources")).toBe(3);
    expect(getSectionCount(workspace, "topics")).toBe(2);
    expect(getSectionCount(workspace, "claims")).toBe(4);
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

  it("saves new claim records and updates workspace metadata", () => {
    const formValues = createEmptyClaimFormValues("topic-video-analysis");
    const nextClaim = createClaimRecord(
      {
        ...formValues,
        text: "Fresh claim",
        sourceIds: ["source-postmatch-template"],
      },
      "2026-03-13T10:05:00.000Z",
    );

    const nextWorkspace = saveClaimRecord(workspace, nextClaim);

    expect(nextWorkspace.claims[0]?.id).toBe(nextClaim.id);
    expect(nextWorkspace.claims).toHaveLength(5);
    expect(nextWorkspace.meta.seeded).toBe(false);
    expect(nextWorkspace.meta.lastUpdatedAt).toBe("2026-03-13T10:05:00.000Z");
  });

  it("saves new topic records and makes them available across the workspace", () => {
    const nextTopic = createTopicRecord(
      {
        name: "Evidence gaps",
        description: "Tracks missing evidence and follow-up work.",
        tagsText: "evidence, follow-up",
        questionPromptsText: "Which sources are still missing?",
      },
      "2026-03-13T10:10:00.000Z",
    );

    const nextWorkspace = saveTopicRecord(workspace, nextTopic);

    expect(nextWorkspace.topics[0]?.id).toBe(nextTopic.id);
    expect(nextWorkspace.topics).toHaveLength(3);
    expect(getTopicName(nextWorkspace, nextTopic.id)).toBe("Evidence gaps");
    expect(nextWorkspace.meta.seeded).toBe(false);
    expect(nextWorkspace.meta.lastUpdatedAt).toBe("2026-03-13T10:10:00.000Z");
  });

  it("updates existing topic records without changing their ids", () => {
    const existingTopic = workspace.topics[0];

    expect(existingTopic).toBeDefined();

    const updatedTopic = createTopicRecord(
      {
        name: "Updated topic name",
        description: "Updated description",
        tagsText: "updated, workflow",
        questionPromptsText: "What changed?",
      },
      "2026-03-13T10:15:00.000Z",
      existingTopic!,
    );

    const nextWorkspace = saveTopicRecord(workspace, updatedTopic);

    expect(nextWorkspace.topics).toHaveLength(workspace.topics.length);
    expect(getTopicName(nextWorkspace, existingTopic!.id)).toBe("Updated topic name");
    expect(nextWorkspace.topics.find((topic) => topic.id === existingTopic!.id)?.tags).toEqual(
      ["updated", "workflow"],
    );
    expect(
      nextWorkspace.topics.find((topic) => topic.id === existingTopic!.id)?.questionPrompts,
    ).toEqual(["What changed?"]);
  });
});
