import type { AppSectionId } from "../types/app";
import type { ClaimRecord } from "../types/claim";
import type { SourceRecord } from "../types/source";
import type { WorkspaceData } from "../types/workspace";

export function getSectionCount(
  workspace: WorkspaceData,
  sectionId: AppSectionId,
): number {
  switch (sectionId) {
    case "sources":
      return workspace.sources.length;
    case "topics":
      return workspace.topics.length;
    case "claims":
      return workspace.claims.length;
    case "digests":
      return workspace.digestItems.length;
  }
}

export function getTopicName(workspace: WorkspaceData, topicId: string): string {
  return (
    workspace.topics.find((topic) => topic.id === topicId)?.name ?? "Unknown topic"
  );
}

export function getSourceTitle(
  workspace: WorkspaceData,
  sourceId: string,
): string {
  return (
    workspace.sources.find((source) => source.id === sourceId)?.title ??
    "Unknown source"
  );
}

export function getClaimText(workspace: WorkspaceData, claimId: string): string {
  return (
    workspace.claims.find((claim) => claim.id === claimId)?.text ?? "Unknown claim"
  );
}

export function saveSourceRecord(
  workspace: WorkspaceData,
  source: SourceRecord,
): WorkspaceData {
  const sourceExists = workspace.sources.some((entry) => entry.id === source.id);
  const nextSources = sourceExists
    ? workspace.sources.map((entry) => (entry.id === source.id ? source : entry))
    : [source, ...workspace.sources];

  return {
    ...workspace,
    sources: nextSources,
    meta: {
      ...workspace.meta,
      seeded: false,
      lastUpdatedAt: source.updatedAt,
    },
  };
}

export function saveClaimRecord(
  workspace: WorkspaceData,
  claim: ClaimRecord,
): WorkspaceData {
  const claimExists = workspace.claims.some((entry) => entry.id === claim.id);
  const nextClaims = claimExists
    ? workspace.claims.map((entry) => (entry.id === claim.id ? claim : entry))
    : [claim, ...workspace.claims];

  return {
    ...workspace,
    claims: nextClaims,
    meta: {
      ...workspace.meta,
      seeded: false,
      lastUpdatedAt: claim.updatedAt,
    },
  };
}
