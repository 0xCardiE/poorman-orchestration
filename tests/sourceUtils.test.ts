import { describe, expect, it } from "vitest";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  createEmptySourceFormValues,
  createSourceFormValues,
  createSourceRecord,
} from "../src/features/sources/sourceUtils";

describe("sourceUtils", () => {
  it("builds editable form values from a saved source", () => {
    const source = createDemoWorkspaceData().sources[0]!;

    expect(createSourceFormValues(source)).toEqual({
      title: source.title,
      url: source.url,
      type: source.type,
      publisher: source.publisher,
      publishedAt: source.publishedAt,
      topicIds: source.topicIds,
      tagsText: "template, review",
      notes: source.notes,
      summary: source.summary,
      keyTakeawaysText:
        "Separate first-watch notes from second-pass synthesis.\nKeep timeline references beside each observation.",
    });
  });

  it("normalizes tags and takeaways when creating a source record", () => {
    const formValues = createEmptySourceFormValues("2026-03-13");

    const source = createSourceRecord(
      {
        ...formValues,
        title: "  Match analysis notes  ",
        publisher: "  Analyst Weekly  ",
        tagsText: " review, timeline, review ",
        keyTakeawaysText: "First point\n\nSecond point\nFirst point",
        topicIds: ["topic-video-analysis", "topic-video-analysis"],
      },
      "2026-03-13T09:45:00.000Z",
    );

    expect(source.id).toBe("source-match-analysis-notes-94500000");
    expect(source.title).toBe("Match analysis notes");
    expect(source.publisher).toBe("Analyst Weekly");
    expect(source.tags).toEqual(["review", "timeline"]);
    expect(source.keyTakeaways).toEqual(["First point", "Second point"]);
    expect(source.topicIds).toEqual(["topic-video-analysis"]);
  });
});
