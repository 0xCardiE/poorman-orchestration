import type { ClaimRecord } from "../../types/claim";
import type {
  ConflictingClaimRecord,
  DigestQuestionRecord,
  TopicDigestRecord,
} from "../../types/digest";
import type { WorkspaceData } from "../../types/workspace";
import { getClaimsForTopic } from "../claims/claimUtils";
import { getSourcesForTopic } from "../topics/topicUtils";

const RECENT_SOURCE_LIMIT = 3;
const RECENT_CLAIM_LIMIT = 3;

export function getTopicDigestRecord(
  workspace: WorkspaceData,
  topicId: string,
): TopicDigestRecord | null {
  const topic = workspace.topics.find((entry) => entry.id === topicId);

  if (!topic) {
    return null;
  }

  const sources = getSourcesForTopic(workspace, topicId);
  const claims = getClaimsForTopic(workspace, topicId);
  const recentSources = getRecentSources(sources);
  const recentClaims = getRecentClaims(claims);
  const unresolvedQuestions = getUnresolvedQuestions(topic.questionPrompts, claims);
  const conflictingClaims = getConflictingClaims(workspace, claims);

  return {
    topic,
    sources,
    claims,
    recentSources,
    recentClaims,
    unresolvedQuestions,
    conflictingClaims,
    latestActivityAt:
      getLatestActivityAt(topic.updatedAt, recentSources, recentClaims) ?? topic.updatedAt,
  };
}

export function getTopicDigestRecords(workspace: WorkspaceData): TopicDigestRecord[] {
  return workspace.topics
    .map((topic) => getTopicDigestRecord(workspace, topic.id))
    .filter((digest): digest is TopicDigestRecord => digest !== null)
    .sort((left, right) => right.latestActivityAt.localeCompare(left.latestActivityAt));
}

export function formatDigestDate(value: string): string {
  return value.slice(0, 10);
}

function getRecentSources(claims: TopicDigestRecord["sources"]) {
  return [...claims]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, RECENT_SOURCE_LIMIT);
}

function getRecentClaims(claims: TopicDigestRecord["claims"]) {
  return [...claims]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, RECENT_CLAIM_LIMIT);
}

function getLatestActivityAt(
  topicUpdatedAt: string,
  sources: TopicDigestRecord["recentSources"],
  claims: TopicDigestRecord["recentClaims"],
) {
  const timestamps = [
    topicUpdatedAt,
    ...sources.map((source) => source.createdAt),
    ...claims.map((claim) => claim.updatedAt),
  ];

  return timestamps.sort().at(-1) ?? null;
}

function getUnresolvedQuestions(
  questionPrompts: string[],
  claims: ClaimRecord[],
): DigestQuestionRecord[] {
  const questions = new Map<string, DigestQuestionRecord>();

  for (const questionPrompt of questionPrompts) {
    const prompt = questionPrompt.trim();

    if (!prompt) {
      continue;
    }

    questions.set(`topic-question:${prompt.toLowerCase()}`, {
      id: `topic-question:${prompt.toLowerCase()}`,
      prompt,
      reason: "topic-question",
    });
  }

  for (const claim of claims) {
    if (claim.sourceIds.length === 1) {
      const prompt = `What additional source could verify this claim: ${claim.text}`;
      questions.set(`single-source-claim:${claim.id}`, {
        id: `single-source-claim:${claim.id}`,
        prompt,
        reason: "single-source-claim",
        claimId: claim.id,
      });
    }

    if (claim.relatedClaims.length === 0) {
      const prompt = `Should this claim be linked to supporting, neutral, or conflicting evidence: ${claim.text}`;
      questions.set(`unlinked-claim:${claim.id}`, {
        id: `unlinked-claim:${claim.id}`,
        prompt,
        reason: "unlinked-claim",
        claimId: claim.id,
      });
    }
  }

  return [...questions.values()];
}

function getConflictingClaims(
  workspace: WorkspaceData,
  claims: ClaimRecord[],
): ConflictingClaimRecord[] {
  const claimIds = new Set(claims.map((claim) => claim.id));
  const conflicts = new Map<string, ConflictingClaimRecord>();

  for (const claim of claims) {
    for (const relatedClaim of claim.relatedClaims) {
      if (relatedClaim.relationship !== "contradict") {
        continue;
      }

      const counterpart = workspace.claims.find(
        (entry) => entry.id === relatedClaim.claimId,
      );

      if (!counterpart || !claimIds.has(counterpart.id)) {
        continue;
      }

      const [leftId, rightId]: [string, string] =
        claim.id.localeCompare(counterpart.id) <= 0
          ? [claim.id, counterpart.id]
          : [counterpart.id, claim.id];
      const conflictKey = `${leftId}:${rightId}`;

      if (conflicts.has(conflictKey)) {
        continue;
      }

      const orderedClaims: [ClaimRecord, ClaimRecord] =
        leftId === claim.id
          ? [claim, counterpart]
          : [counterpart, claim];

      conflicts.set(conflictKey, {
        id: conflictKey,
        claimIds: [leftId, rightId],
        claims: orderedClaims,
      });
    }
  }

  return [...conflicts.values()].sort((left, right) =>
    right.claims[0].updatedAt.localeCompare(left.claims[0].updatedAt),
  );
}
