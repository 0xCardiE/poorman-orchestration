export type SourceType = "article" | "paper" | "report" | "note";

export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  type: SourceType;
  publisher: string;
  publishedAt: string;
  topicIds: string[];
  tags: string[];
  notes: string;
  summary: string;
  keyTakeaways: string[];
  createdAt: string;
  updatedAt: string;
}
