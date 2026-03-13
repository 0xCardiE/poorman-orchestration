import type { ClaimRecord } from "./claim";
import type { DigestItemRecord } from "./digest";
import type { SourceRecord } from "./source";
import type { TopicRecord } from "./topic";

export interface WorkspaceMeta {
  name: string;
  seeded: boolean;
  lastUpdatedAt: string;
}

export interface WorkspaceData {
  version: number;
  meta: WorkspaceMeta;
  sources: SourceRecord[];
  topics: TopicRecord[];
  claims: ClaimRecord[];
  digestItems: DigestItemRecord[];
}
