export type ClaimRelationship = "support" | "contradict" | "neutral";

export interface ClaimLink {
  claimId: string;
  relationship: ClaimRelationship;
}

export interface ClaimRecord {
  id: string;
  text: string;
  sourceId: string;
  topicId: string;
  notes: string;
  relatedClaims: ClaimLink[];
  createdAt: string;
  updatedAt: string;
}
