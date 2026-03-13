import { getClaimsForTopic } from "../claims/claimUtils";
import type { ClaimRecord } from "../../types/claim";
import type { SourceRecord } from "../../types/source";
import type { TopicRecord } from "../../types/topic";
import type { WorkspaceData } from "../../types/workspace";

export interface TopicTagStat {
  tag: string;
  count: number;
}

export interface RelatedTopicSummary {
  topicId: string;
  name: string;
  sharedSourceCount: number;
}

export interface TopicSnapshot {
  topic: TopicRecord;
  sources: SourceRecord[];
  claims: ClaimRecord[];
  recentSources: SourceRecord[];
  recentClaims: ClaimRecord[];
  tags: TopicTagStat[];
  relatedTopics: RelatedTopicSummary[];
  latestActivityAt: string | null;
}

export function getTopicSnapshot(
  workspace: WorkspaceData,
  topicId: string,
): TopicSnapshot | null {
  const topic = workspace.topics.find((entry) => entry.id === topicId);

  if (!topic) {
    return null;
  }

  const sources = getSourcesForTopic(workspace, topicId);
  const claims = getClaimsForTopic(workspace, topicId);

  return {
    topic,
    sources,
    claims,
    recentSources: getRecentSources(sources),
    recentClaims: getRecentClaims(claims),
    tags: getTopicTagStats(topic, sources),
    relatedTopics: getRelatedTopics(workspace, topicId),
    latestActivityAt: getLatestActivityTimestamp(sources, claims),
  };
}

export function getTopicSnapshots(workspace: WorkspaceData): TopicSnapshot[] {
  return workspace.topics
    .map((topic) => getTopicSnapshot(workspace, topic.id))
    .filter((snapshot): snapshot is TopicSnapshot => snapshot !== null)
    .sort((left, right) => {
      const leftTimestamp = left.latestActivityAt ?? left.topic.updatedAt;
      const rightTimestamp = right.latestActivityAt ?? right.topic.updatedAt;

      return rightTimestamp.localeCompare(leftTimestamp);
    });
}

export function getSourcesForTopic(
  workspace: WorkspaceData,
  topicId: string,
): SourceRecord[] {
  return workspace.sources.filter((source) => source.topicIds.includes(topicId));
}

function getRecentSources(sources: SourceRecord[]): SourceRecord[] {
  return [...sources]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 3);
}

function getRecentClaims(claims: ClaimRecord[]): ClaimRecord[] {
  return [...claims]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3);
}

function getLatestActivityTimestamp(
  sources: SourceRecord[],
  claims: ClaimRecord[],
): string | null {
  const latestSourceAt = [...sources]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]
    ?.createdAt;
  const latestClaimAt = [...claims]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
    ?.updatedAt;

  return [latestSourceAt, latestClaimAt].filter(Boolean).sort().at(-1) ?? null;
}

function getTopicTagStats(
  topic: TopicRecord,
  sources: SourceRecord[],
): TopicTagStat[] {
  const counts = new Map<string, number>();

  for (const tag of topic.tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  for (const source of sources) {
    for (const tag of source.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag));
}

function getRelatedTopics(
  workspace: WorkspaceData,
  topicId: string,
): RelatedTopicSummary[] {
  const connectionCounts = new Map<string, number>();

  for (const source of workspace.sources) {
    if (!source.topicIds.includes(topicId)) {
      continue;
    }

    for (const relatedTopicId of source.topicIds) {
      if (relatedTopicId === topicId) {
        continue;
      }

      connectionCounts.set(
        relatedTopicId,
        (connectionCounts.get(relatedTopicId) ?? 0) + 1,
      );
    }
  }

  return [...connectionCounts.entries()]
    .map(([relatedTopicId, sharedSourceCount]) => {
      const relatedTopic = workspace.topics.find(
        (topic) => topic.id === relatedTopicId,
      );

      if (!relatedTopic) {
        return null;
      }

      return {
        topicId: relatedTopic.id,
        name: relatedTopic.name,
        sharedSourceCount,
      };
    })
    .filter((entry): entry is RelatedTopicSummary => entry !== null)
    .sort(
      (left, right) =>
        right.sharedSourceCount - left.sharedSourceCount ||
        left.name.localeCompare(right.name),
    );
}
