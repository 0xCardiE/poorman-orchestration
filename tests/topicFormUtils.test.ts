import { describe, expect, it } from "vitest";
import {
  createEmptyTopicFormValues,
  createTopicFormValues,
  createTopicRecord,
} from "../src/features/topics/topicFormUtils";

describe("topicFormUtils", () => {
  it("creates empty topic form values", () => {
    expect(createEmptyTopicFormValues()).toEqual({
      name: "",
      description: "",
      tagsText: "",
      questionPromptsText: "",
    });
  });

  it("maps topic records into editable form values", () => {
    expect(
      createTopicFormValues({
        id: "topic-1",
        name: "Topic One",
        description: "Description",
        tags: ["alpha", "beta"],
        questionPrompts: ["Question one?", "Question two?"],
        createdAt: "2026-03-13T09:00:00.000Z",
        updatedAt: "2026-03-13T10:00:00.000Z",
      }),
    ).toEqual({
      name: "Topic One",
      description: "Description",
      tagsText: "alpha, beta",
      questionPromptsText: "Question one?\nQuestion two?",
    });
  });

  it("creates new topic records with normalized tags and questions", () => {
    const record = createTopicRecord(
      {
        name: "  New Topic  ",
        description: "  Description  ",
        tagsText: "alpha, beta, alpha",
        questionPromptsText: "First?\nSecond?\nFirst?",
      },
      "2026-03-13T10:00:00.000Z",
    );

    expect(record.id).toBe("topic-new-topic-00000000");
    expect(record.name).toBe("New Topic");
    expect(record.description).toBe("Description");
    expect(record.tags).toEqual(["alpha", "beta"]);
    expect(record.questionPrompts).toEqual(["First?", "Second?"]);
    expect(record.createdAt).toBe("2026-03-13T10:00:00.000Z");
    expect(record.updatedAt).toBe("2026-03-13T10:00:00.000Z");
  });

  it("preserves ids and created timestamps when editing a topic", () => {
    const existingTopic = {
      id: "topic-existing",
      name: "Existing",
      description: "Original",
      tags: ["alpha"],
      questionPrompts: ["Original question?"],
      createdAt: "2026-03-13T09:00:00.000Z",
      updatedAt: "2026-03-13T09:30:00.000Z",
    };

    const record = createTopicRecord(
      {
        name: "Updated topic",
        description: "Updated description",
        tagsText: "beta, gamma",
        questionPromptsText: "Updated question?",
      },
      "2026-03-13T11:00:00.000Z",
      existingTopic,
    );

    expect(record.id).toBe("topic-existing");
    expect(record.createdAt).toBe("2026-03-13T09:00:00.000Z");
    expect(record.updatedAt).toBe("2026-03-13T11:00:00.000Z");
  });
});
