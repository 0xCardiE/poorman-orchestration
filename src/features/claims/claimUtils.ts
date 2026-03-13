import type {
  ClaimLink,
  ClaimRecord,
  ClaimRelationship,
} from "../../types/claim";
import type { WorkspaceData } from "../../types/workspace";

export type ClaimRelationshipFieldValue = ClaimRelationship | "none";

export interface ClaimFormValues {
  text: string;
  topicId: string;
  sourceIds: string[];
  notes: string;
  relatedClaims: ClaimLink[];
}

export function createEmptyClaimFormValues(defaultTopicId = ""): ClaimFormValues {
  return {
    text: "",
    topicId: defaultTopicId,
    sourceIds: [],
    notes: "",
    relatedClaims: [],
  };
}

export function createClaimFormValues(claim: ClaimRecord): ClaimFormValues {
  return {
    text: claim.text,
    topicId: claim.topicId,
    sourceIds: claim.sourceIds,
    notes: claim.notes,
    relatedClaims: claim.relatedClaims,
  };
}

export function createClaimRecord(
  values: ClaimFormValues,
  now: string,
  existingClaim?: ClaimRecord,
): ClaimRecord {
  const text = values.text.trim();

  return {
    id: existingClaim?.id ?? createClaimId(text, now),
    text,
    topicId: values.topicId,
    sourceIds: uniqueStrings(values.sourceIds),
    notes: values.notes.trim(),
    relatedClaims: uniqueClaimLinks(values.relatedClaims, existingClaim?.id),
    createdAt: existingClaim?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getClaimsForSource(
  workspace: WorkspaceData,
  sourceId: string,
): ClaimRecord[] {
  return sortClaimsByUpdatedAt(
    workspace.claims.filter((claim) => claim.sourceIds.includes(sourceId)),
  );
}

export function getClaimsForTopic(
  workspace: WorkspaceData,
  topicId: string,
): ClaimRecord[] {
  return sortClaimsByUpdatedAt(
    workspace.claims.filter((claim) => claim.topicId === topicId),
  );
}

export function getClaimRelationshipValue(
  relatedClaims: ClaimLink[],
  claimId: string,
): ClaimRelationshipFieldValue {
  return relatedClaims.find((entry) => entry.claimId === claimId)?.relationship ?? "none";
}

export function setClaimRelationship(
  relatedClaims: ClaimLink[],
  claimId: string,
  relationship: ClaimRelationshipFieldValue,
): ClaimLink[] {
  const nextRelationships = relatedClaims.filter((entry) => entry.claimId !== claimId);

  if (relationship === "none") {
    return nextRelationships;
  }

  return [...nextRelationships, { claimId, relationship }];
}

function sortClaimsByUpdatedAt(claims: ClaimRecord[]) {
  return [...claims].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function uniqueClaimLinks(links: ClaimLink[], currentClaimId?: string): ClaimLink[] {
  const uniqueLinks = new Map<string, ClaimLink>();

  for (const link of links) {
    if (link.claimId === currentClaimId) {
      continue;
    }

    uniqueLinks.set(link.claimId, {
      claimId: link.claimId,
      relationship: link.relationship,
    });
  }

  return [...uniqueLinks.values()];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function createClaimId(text: string, now: string) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const timeToken = now.replace(/[^0-9]/g, "").slice(-8);

  return `claim-${slug || "untitled"}-${timeToken}`;
}
