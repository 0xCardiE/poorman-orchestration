import type { TopicRecord } from "../../types/topic";

export interface TopicFormValues {
  name: string;
  description: string;
  tagsText: string;
  questionPromptsText: string;
}

export function createEmptyTopicFormValues(): TopicFormValues {
  return {
    name: "",
    description: "",
    tagsText: "",
    questionPromptsText: "",
  };
}

export function createTopicFormValues(topic: TopicRecord): TopicFormValues {
  return {
    name: topic.name,
    description: topic.description,
    tagsText: topic.tags.join(", "),
    questionPromptsText: topic.questionPrompts.join("\n"),
  };
}

export function createTopicRecord(
  values: TopicFormValues,
  now: string,
  existingTopic?: TopicRecord,
): TopicRecord {
  const name = values.name.trim();

  return {
    id: existingTopic?.id ?? createTopicId(name, now),
    name,
    description: values.description.trim(),
    tags: splitOnComma(values.tagsText),
    questionPrompts: splitOnNewLine(values.questionPromptsText),
    createdAt: existingTopic?.createdAt ?? now,
    updatedAt: now,
  };
}

function splitOnComma(value: string): string[] {
  return uniqueStrings(
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function splitOnNewLine(value: string): string[] {
  return uniqueStrings(
    value
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function createTopicId(name: string, now: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const timeToken = now.replace(/[^0-9]/g, "").slice(-8);

  return `topic-${slug || "untitled"}-${timeToken}`;
}
