import { createDemoWorkspaceData } from "./demoData";
import type { ClaimLink, ClaimRecord, ClaimRelationship } from "../types/claim";
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
    ...workspace,
    version: 2,
    claims: workspace.claims
      .map((claim) => normalizeClaimRecord(claim))
      .filter((claim): claim is ClaimRecord => claim !== null),
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

function isClaimRelationship(value: unknown): value is ClaimRelationship {
  return value === "support" || value === "contradict" || value === "neutral";
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
    const parsedValue = JSON.parse(savedValue) as unknown;

    if (isWorkspaceData(parsedValue)) {
      return normalizeWorkspaceData(parsedValue);
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

export function resetWorkspaceData() {
  const demoData = createDemoWorkspaceData();
  saveWorkspaceData(demoData);

  return demoData;
}
