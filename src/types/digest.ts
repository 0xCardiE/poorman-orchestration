import type { ClaimRecord } from "./claim";
import type { SourceRecord } from "./source";
import type { TopicRecord } from "./topic";

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

export type DigestQuestionReason =
  | "topic-question"
  | "single-source-claim"
  | "unlinked-claim";

export interface DigestQuestionRecord {
  id: string;
  prompt: string;
  reason: DigestQuestionReason;
  claimId?: string;
}

export interface ConflictingClaimRecord {
  id: string;
  claimIds: [string, string];
  claims: [ClaimRecord, ClaimRecord];
}

export interface TopicDigestRecord {
  topic: TopicRecord;
  sources: SourceRecord[];
  claims: ClaimRecord[];
  recentSources: SourceRecord[];
  recentClaims: ClaimRecord[];
  unresolvedQuestions: DigestQuestionRecord[];
  conflictingClaims: ConflictingClaimRecord[];
  latestActivityAt: string;
}
