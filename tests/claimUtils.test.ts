import { describe, expect, it } from "vitest";
import { createDemoWorkspaceData } from "../src/lib/demoData";
import {
  createClaimRecord,
  getClaimsForSource,
  getClaimsForTopic,
  setClaimRelationship,
} from "../src/features/claims/claimUtils";

describe("claimUtils", () => {
  const workspace = createDemoWorkspaceData();

  it("collects claims linked to a source", () => {
    expect(
      getClaimsForSource(workspace, "source-postmatch-template").map(
        (claim) => claim.id,
      ),
    ).toEqual([
      "claim-manual-summaries-need-citations",
      "claim-timeline-notes-improve-review",
    ]);
  });

  it("collects claims linked to a topic", () => {
    expect(
      getClaimsForTopic(workspace, "topic-video-analysis").map((claim) => claim.id),
    ).toEqual([
      "claim-phase-buckets-beat-timelines",
      "claim-manual-summaries-need-citations",
      "claim-timeline-notes-improve-review",
    ]);
  });

  it("creates claim records with explicit linked sources", () => {
    const claim = createClaimRecord(
      {
        text: "Manual claim",
        topicId: "topic-video-analysis",
        sourceIds: ["source-postmatch-template", "source-postmatch-template"],
        notes: "Needs review",
        relatedClaims: [
          {
            claimId: "claim-checklists-improve-consistency",
            relationship: "support",
          },
        ],
      },
      "2026-03-13T10:00:00.000Z",
    );

    expect(claim.sourceIds).toEqual(["source-postmatch-template"]);
    expect(claim.relatedClaims).toHaveLength(1);
  });

  it("adds and removes direct claim relationships", () => {
    expect(
      setClaimRelationship([], "claim-checklists-improve-consistency", "neutral"),
    ).toEqual([
      {
        claimId: "claim-checklists-improve-consistency",
        relationship: "neutral",
      },
    ]);

    expect(
      setClaimRelationship(
        [
          {
            claimId: "claim-checklists-improve-consistency",
            relationship: "neutral",
          },
        ],
        "claim-checklists-improve-consistency",
        "none",
      ),
    ).toEqual([]);
  });

  it("normalizes claim text, linked sources, and related claims when saving", () => {
    const claim = createClaimRecord(
      {
        text: "  Manual claim with duplicates  ",
        topicId: "topic-video-analysis",
        sourceIds: [
          "source-postmatch-template",
          " source-postmatch-template ",
          "source-comparison-notes",
        ],
        notes: "  Needs review  ",
        relatedClaims: [
          {
            claimId: "claim-existing",
            relationship: "neutral",
          },
          {
            claimId: "claim-existing",
            relationship: "support",
          },
          {
            claimId: "claim-manual-claim-with-duplicates-00000000",
            relationship: "contradict",
          },
        ],
      },
      "2026-03-13T10:00:00.000Z",
      {
        id: "claim-manual-claim-with-duplicates-00000000",
        text: "Older text",
        topicId: "topic-video-analysis",
        sourceIds: [],
        notes: "",
        relatedClaims: [],
        createdAt: "2026-03-12T10:00:00.000Z",
        updatedAt: "2026-03-12T10:00:00.000Z",
      },
    );

    expect(claim.text).toBe("Manual claim with duplicates");
    expect(claim.notes).toBe("Needs review");
    expect(claim.sourceIds).toEqual([
      "source-postmatch-template",
      "source-comparison-notes",
    ]);
    expect(claim.relatedClaims).toEqual([
      {
        claimId: "claim-existing",
        relationship: "support",
      },
    ]);
  });

  it("replaces an existing relationship instead of duplicating it", () => {
    expect(
      setClaimRelationship(
        [
          {
            claimId: "claim-checklists-improve-consistency",
            relationship: "neutral",
          },
        ],
        "claim-checklists-improve-consistency",
        "support",
      ),
    ).toEqual([
      {
        claimId: "claim-checklists-improve-consistency",
        relationship: "support",
      },
    ]);
  });
});
