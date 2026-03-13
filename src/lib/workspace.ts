import type { AppSectionId } from "../types/app";
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
