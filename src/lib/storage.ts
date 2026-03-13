import { createDemoWorkspaceData } from "./demoData";
import type { ClaimLink, ClaimRecord, ClaimRelationship } from "../types/claim";
import type { DigestItemKind, DigestItemRecord } from "../types/digest";
import type { SourceRecord, SourceType } from "../types/source";
import type { TopicRecord } from "../types/topic";
import type { WorkspaceData } from "../types/workspace";

export const WORKSPACE_STORAGE_KEY = "niche-research-digest.workspace";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isWorkspaceData(value: unknown): value is WorkspaceData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkspaceData>;

  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.sources) &&
    Array.isArray(candidate.topics) &&
    Array.isArray(candidate.claims) &&
    Array.isArray(candidate.digestItems) &&
    typeof candidate.meta === "object" &&
    candidate.meta !== null
  );
}

function normalizeWorkspaceData(workspace: WorkspaceData): WorkspaceData {
  return {
    version: 2,
    meta: normalizeWorkspaceMeta(workspace.meta, workspace.meta.lastUpdatedAt),
    sources: workspace.sources
      .map((source) => normalizeSourceRecord(source))
      .filter((source): source is SourceRecord => source !== null),
    topics: workspace.topics
      .map((topic) => normalizeTopicRecord(topic))
      .filter((topic): topic is TopicRecord => topic !== null),
    claims: workspace.claims
      .map((claim) => normalizeClaimRecord(claim))
      .filter((claim): claim is ClaimRecord => claim !== null),
    digestItems: workspace.digestItems
      .map((digestItem) => normalizeDigestItemRecord(digestItem))
      .filter((digestItem): digestItem is DigestItemRecord => digestItem !== null),
  };
}

function normalizeWorkspaceMeta(
  value: WorkspaceData["meta"],
  fallbackUpdatedAt: string,
): WorkspaceData["meta"] {
  return {
    name: typeof value?.name === "string" ? value.name : "Imported workspace",
    seeded: Boolean(value?.seeded),
    lastUpdatedAt:
      typeof value?.lastUpdatedAt === "string"
        ? value.lastUpdatedAt
        : fallbackUpdatedAt,
  };
}

function normalizeSourceRecord(value: unknown): SourceRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SourceRecord>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    !isSourceType(candidate.type) ||
    typeof candidate.url !== "string" ||
    typeof candidate.publisher !== "string" ||
    typeof candidate.publishedAt !== "string" ||
    typeof candidate.notes !== "string" ||
    typeof candidate.summary !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    url: candidate.url,
    type: candidate.type,
    publisher: candidate.publisher,
    publishedAt: candidate.publishedAt,
    topicIds: uniqueStrings(
      Array.isArray(candidate.topicIds) ? candidate.topicIds.filter(isString) : [],
    ),
    tags: uniqueStrings(Array.isArray(candidate.tags) ? candidate.tags.filter(isString) : []),
    notes: candidate.notes,
    summary: candidate.summary,
    keyTakeaways: uniqueStrings(
      Array.isArray(candidate.keyTakeaways)
        ? candidate.keyTakeaways.filter(isString)
        : [],
    ),
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

function normalizeTopicRecord(value: unknown): TopicRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TopicRecord>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name,
    description: candidate.description,
    tags: uniqueStrings(Array.isArray(candidate.tags) ? candidate.tags.filter(isString) : []),
    questionPrompts: uniqueStrings(
      Array.isArray(candidate.questionPrompts)
        ? candidate.questionPrompts.filter(isString)
        : [],
    ),
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

function normalizeClaimRecord(value: unknown): ClaimRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ClaimRecord> & { sourceId?: string };
  const sourceIds = Array.isArray(candidate.sourceIds)
    ? uniqueStrings(candidate.sourceIds.filter(isString))
    : typeof candidate.sourceId === "string"
      ? [candidate.sourceId]
      : [];

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.text !== "string" ||
    typeof candidate.topicId !== "string" ||
    typeof candidate.notes !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    text: candidate.text,
    sourceIds,
    topicId: candidate.topicId,
    notes: candidate.notes,
    relatedClaims: normalizeClaimLinks(candidate.relatedClaims),
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

function normalizeClaimLinks(value: unknown): ClaimLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Partial<ClaimLink>;

      if (
        typeof candidate.claimId !== "string" ||
        !isClaimRelationship(candidate.relationship)
      ) {
        return null;
      }

      return {
        claimId: candidate.claimId,
        relationship: candidate.relationship,
      };
    })
    .filter((entry): entry is ClaimLink => entry !== null);
}

function normalizeDigestItemRecord(value: unknown): DigestItemRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<DigestItemRecord>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.topicId !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.summary !== "string" ||
    !isDigestItemKind(candidate.kind) ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    topicId: candidate.topicId,
    title: candidate.title,
    summary: candidate.summary,
    kind: candidate.kind,
    sourceIds: uniqueStrings(
      Array.isArray(candidate.sourceIds) ? candidate.sourceIds.filter(isString) : [],
    ),
    claimIds: uniqueStrings(
      Array.isArray(candidate.claimIds) ? candidate.claimIds.filter(isString) : [],
    ),
    createdAt: candidate.createdAt,
  };
}

function isClaimRelationship(value: unknown): value is ClaimRelationship {
  return value === "support" || value === "contradict" || value === "neutral";
}

function isDigestItemKind(value: unknown): value is DigestItemKind {
  return (
    value === "recent-source" ||
    value === "claim-watch" ||
    value === "open-question"
  );
}

function isSourceType(value: unknown): value is SourceType {
  return (
    value === "article" ||
    value === "paper" ||
    value === "report" ||
    value === "note"
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function loadWorkspaceData(): WorkspaceData {
  const demoData = createDemoWorkspaceData();

  if (!canUseLocalStorage()) {
    return demoData;
  }

  const savedValue = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (!savedValue) {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(demoData));
    return demoData;
  }

  try {
    const workspace = parseWorkspaceData(savedValue);

    if (workspace) {
      return workspace;
    }
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(demoData));
  return demoData;
}

export function saveWorkspaceData(workspace: WorkspaceData) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}

export function parseWorkspaceData(value: string): WorkspaceData | null {
  const parsedValue = JSON.parse(value) as unknown;

  if (!isWorkspaceData(parsedValue)) {
    return null;
  }

  return normalizeWorkspaceData(parsedValue);
}

export function exportWorkspaceData(workspace: WorkspaceData): string {
  return JSON.stringify(workspace, null, 2);
}

export function resetWorkspaceData() {
  const demoData = createDemoWorkspaceData();
  saveWorkspaceData(demoData);

  return demoData;
}
