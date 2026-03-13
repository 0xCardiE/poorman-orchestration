import type { SourceRecord, SourceType } from "../../types/source";

export interface SourceFormValues {
  title: string;
  url: string;
  type: SourceType;
  publisher: string;
  publishedAt: string;
  topicIds: string[];
  tagsText: string;
  notes: string;
  summary: string;
  keyTakeawaysText: string;
}

const DEFAULT_SOURCE_TYPE: SourceType = "article";

export function createEmptySourceFormValues(today: string): SourceFormValues {
  return {
    title: "",
    url: "",
    type: DEFAULT_SOURCE_TYPE,
    publisher: "",
    publishedAt: today,
    topicIds: [],
    tagsText: "",
    notes: "",
    summary: "",
    keyTakeawaysText: "",
  };
}

export function createSourceFormValues(source: SourceRecord): SourceFormValues {
  return {
    title: source.title,
    url: source.url,
    type: source.type,
    publisher: source.publisher,
    publishedAt: source.publishedAt,
    topicIds: source.topicIds,
    tagsText: source.tags.join(", "),
    notes: source.notes,
    summary: source.summary,
    keyTakeawaysText: source.keyTakeaways.join("\n"),
  };
}

export function createSourceRecord(
  values: SourceFormValues,
  now: string,
  existingSource?: SourceRecord,
): SourceRecord {
  const title = values.title.trim();

  return {
    id: existingSource?.id ?? createSourceId(title, now),
    title,
    url: values.url.trim(),
    type: values.type,
    publisher: values.publisher.trim(),
    publishedAt: values.publishedAt,
    topicIds: uniqueStrings(values.topicIds),
    tags: splitOnComma(values.tagsText),
    notes: values.notes.trim(),
    summary: values.summary.trim(),
    keyTakeaways: splitOnNewLine(values.keyTakeawaysText),
    createdAt: existingSource?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getTodayDateValue(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function createSourceId(title: string, now: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const timeToken = now.replace(/[^0-9]/g, "").slice(-8);

  return `source-${slug || "untitled"}-${timeToken}`;
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
