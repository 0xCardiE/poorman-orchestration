import { getTopicName } from "../../lib/workspace";
import type { ClaimRecord } from "../../types/claim";
import type { WorkspaceData } from "../../types/workspace";

interface ClaimListProps {
  claims: ClaimRecord[];
  selectedClaimId: string | null;
  workspace: WorkspaceData;
  onCreateClaim: () => void;
  onEditClaim: (claimId: string) => void;
  onSelectClaim: (claimId: string) => void;
}

export function ClaimList({
  claims,
  selectedClaimId,
  workspace,
  onCreateClaim,
  onEditClaim,
  onSelectClaim,
}: ClaimListProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Claim map</p>
          <h2>Captured claims</h2>
        </div>
        <button type="button" className="primary-button" onClick={onCreateClaim}>
          Add claim
        </button>
      </div>

      <ul className="source-list">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className={selectedClaimId === claim.id ? "source-card selected" : "source-card"}
          >
            <div className="source-card-header">
              <div>
                <h3>{claim.text}</h3>
                <p className="record-meta">
                  {getTopicName(workspace, claim.topicId)} · {claim.sourceIds.length} linked
                  source{claim.sourceIds.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="pill subtle">
                {claim.relatedClaims.length} relationship
                {claim.relatedClaims.length === 1 ? "" : "s"}
              </span>
            </div>

            <p className="source-card-text">{claim.notes || "No notes yet."}</p>

            <div className="source-card-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => onSelectClaim(claim.id)}
              >
                View claim
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onEditClaim(claim.id)}
              >
                Edit claim
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
