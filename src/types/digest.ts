export type DigestItemKind =
  | "recent-source"
  | "claim-watch"
  | "open-question";

export interface DigestItemRecord {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  kind: DigestItemKind;
  sourceIds: string[];
  claimIds: string[];
  createdAt: string;
}
