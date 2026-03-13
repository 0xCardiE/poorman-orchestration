import type { ClaimRelationship, ClaimRecord } from "../types/claim";
import type { SourceRecord, SourceType } from "../types/source";
import type { TopicRecord } from "../types/topic";
import type { WorkspaceData } from "../types/workspace";

export const ALL_FILTER_VALUE = "all";

export interface WorkspaceFilters {
  searchText: string;
  topicId: string;
  tag: string;
  sourceType: SourceType | typeof ALL_FILTER_VALUE;
  relationshipState: ClaimRelationship | typeof ALL_FILTER_VALUE;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface WorkspaceFilterOptions {
  topics: FilterOption[];
  tags: FilterOption[];
  sourceTypes: FilterOption[];
  relationshipStates: FilterOption[];
}

export interface FilteredWorkspaceView {
  sources: SourceRecord[];
  topics: TopicRecord[];
  claims: ClaimRecord[];
  hasActiveFilters: boolean;
}

const sourceTypeOrder: SourceType[] = ["article", "paper", "report", "note"];
const relationshipOrder: ClaimRelationship[] = [
  "support",
  "contradict",
  "neutral",
];

export function createDefaultWorkspaceFilters(): WorkspaceFilters {
  return {
    searchText: "",
    topicId: ALL_FILTER_VALUE,
    tag: ALL_FILTER_VALUE,
    sourceType: ALL_FILTER_VALUE,
    relationshipState: ALL_FILTER_VALUE,
  };
}

export function getWorkspaceFilterOptions(
  workspace: WorkspaceData,
): WorkspaceFilterOptions {
  const tags = new Set<string>();

  for (const topic of workspace.topics) {
    for (const tag of topic.tags) {
      tags.add(tag);
    }
  }

  for (const source of workspace.sources) {
    for (const tag of source.tags) {
      tags.add(tag);
    }
  }

  return {
    topics: workspace.topics
      .map((topic) => ({
        value: topic.id,
        label: topic.name,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    tags: [...tags]
      .sort((left, right) => left.localeCompare(right))
      .map((tag) => ({
        value: tag,
        label: tag,
      })),
    sourceTypes: sourceTypeOrder.map((sourceType) => ({
      value: sourceType,
      label: capitalize(sourceType),
    })),
    relationshipStates: relationshipOrder.map((relationshipState) => ({
      value: relationshipState,
      label: capitalize(relationshipState),
    })),
  };
}

export function getFilteredWorkspaceView(
  workspace: WorkspaceData,
  filters: WorkspaceFilters,
): FilteredWorkspaceView {
  const searchTerm = normalizeSearch(filters.searchText);
  const sources = workspace.sources.filter((source) =>
    matchesSourceFilters(workspace, source, filters, searchTerm),
  );
  const claims = workspace.claims.filter((claim) =>
    matchesClaimFilters(workspace, claim, filters, searchTerm),
  );
  const topics = workspace.topics.filter((topic) =>
    matchesTopicFilters(workspace, topic, filters, searchTerm),
  );

  return {
    sources,
    claims,
    topics,
    hasActiveFilters:
      Boolean(searchTerm) ||
      filters.topicId !== ALL_FILTER_VALUE ||
      filters.tag !== ALL_FILTER_VALUE ||
      filters.sourceType !== ALL_FILTER_VALUE ||
      filters.relationshipState !== ALL_FILTER_VALUE,
  };
}

function matchesSourceFilters(
  workspace: WorkspaceData,
  source: SourceRecord,
  filters: WorkspaceFilters,
  searchTerm: string,
) {
  if (
    filters.topicId !== ALL_FILTER_VALUE &&
    !source.topicIds.includes(filters.topicId)
  ) {
    return false;
  }

  if (filters.tag !== ALL_FILTER_VALUE && !source.tags.includes(filters.tag)) {
    return false;
  }

  if (
    filters.sourceType !== ALL_FILTER_VALUE &&
    source.type !== filters.sourceType
  ) {
    return false;
  }

  if (
    filters.relationshipState !== ALL_FILTER_VALUE &&
    !getClaimsForSource(workspace, source.id).some((claim) =>
      claim.relatedClaims.some(
        (relatedClaim) => relatedClaim.relationship === filters.relationshipState,
      ),
    )
  ) {
    return false;
  }

  if (!searchTerm) {
    return true;
  }

  const topicNames = source.topicIds.map((topicId) =>
    workspace.topics.find((topic) => topic.id === topicId)?.name ?? "",
  );
  const claimTexts = getClaimsForSource(workspace, source.id).map((claim) => claim.text);

  return matchesSearch(
    [
      source.title,
      source.notes,
      source.summary,
      source.publisher,
      source.url,
      source.tags.join(" "),
      source.keyTakeaways.join(" "),
      topicNames.join(" "),
      claimTexts.join(" "),
    ],
    searchTerm,
  );
}

function matchesClaimFilters(
  workspace: WorkspaceData,
  claim: ClaimRecord,
  filters: WorkspaceFilters,
  searchTerm: string,
) {
  if (filters.topicId !== ALL_FILTER_VALUE && claim.topicId !== filters.topicId) {
    return false;
  }

  if (
    filters.relationshipState !== ALL_FILTER_VALUE &&
    !claim.relatedClaims.some(
      (relatedClaim) => relatedClaim.relationship === filters.relationshipState,
    )
  ) {
    return false;
  }

  const linkedSources = workspace.sources.filter((source) =>
    claim.sourceIds.includes(source.id),
  );
  const topic = workspace.topics.find((entry) => entry.id === claim.topicId) ?? null;

  if (
    filters.tag !== ALL_FILTER_VALUE &&
    !linkedSources.some((source) => source.tags.includes(filters.tag)) &&
    !topic?.tags.includes(filters.tag)
  ) {
    return false;
  }

  if (
    filters.sourceType !== ALL_FILTER_VALUE &&
    !linkedSources.some((source) => source.type === filters.sourceType)
  ) {
    return false;
  }

  if (!searchTerm) {
    return true;
  }

  return matchesSearch(
    [
      claim.text,
      claim.notes,
      topic?.name ?? "",
      linkedSources.map((source) => source.title).join(" "),
      linkedSources.map((source) => source.notes).join(" "),
    ],
    searchTerm,
  );
}

function matchesTopicFilters(
  workspace: WorkspaceData,
  topic: TopicRecord,
  filters: WorkspaceFilters,
  searchTerm: string,
) {
  if (filters.topicId !== ALL_FILTER_VALUE && topic.id !== filters.topicId) {
    return false;
  }

  const sources = workspace.sources.filter((source) => source.topicIds.includes(topic.id));
  const claims = workspace.claims.filter((claim) => claim.topicId === topic.id);

  if (
    filters.tag !== ALL_FILTER_VALUE &&
    !topic.tags.includes(filters.tag) &&
    !sources.some((source) => source.tags.includes(filters.tag))
  ) {
    return false;
  }

  if (
    filters.sourceType !== ALL_FILTER_VALUE &&
    !sources.some((source) => source.type === filters.sourceType)
  ) {
    return false;
  }

  if (
    filters.relationshipState !== ALL_FILTER_VALUE &&
    !claims.some((claim) =>
      claim.relatedClaims.some(
        (relatedClaim) => relatedClaim.relationship === filters.relationshipState,
      ),
    )
  ) {
    return false;
  }

  if (!searchTerm) {
    return true;
  }

  return matchesSearch(
    [
      topic.name,
      topic.description,
      topic.tags.join(" "),
      topic.questionPrompts.join(" "),
      sources.map((source) => source.title).join(" "),
      sources.map((source) => source.notes).join(" "),
      claims.map((claim) => claim.text).join(" "),
      claims.map((claim) => claim.notes).join(" "),
    ],
    searchTerm,
  );
}

function getClaimsForSource(workspace: WorkspaceData, sourceId: string) {
  return workspace.claims.filter((claim) => claim.sourceIds.includes(sourceId));
}

function matchesSearch(values: string[], searchTerm: string) {
  return normalizeSearch(values.join(" ")).includes(searchTerm);
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
