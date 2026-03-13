import { getClaimText, getSourceTitle, getTopicName } from "../../lib/workspace";
import type { ClaimRecord } from "../../types/claim";
import type { WorkspaceData } from "../../types/workspace";

interface ClaimDetailProps {
  claim: ClaimRecord;
  workspace: WorkspaceData;
  onCreateClaim: () => void;
  onEditClaim: (claimId: string) => void;
  onOpenClaim: (claimId: string) => void;
  onOpenSource: (sourceId: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export function ClaimDetail({
  claim,
  workspace,
  onCreateClaim,
  onEditClaim,
  onOpenClaim,
  onOpenSource,
  onOpenTopic,
}: ClaimDetailProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Claim detail</p>
          <h2>{claim.text}</h2>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onEditClaim(claim.id)}
        >
          Edit claim
        </button>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Topic</dt>
          <dd>
            <button
              type="button"
              className="topic-link-button"
              onClick={() => onOpenTopic(claim.topicId)}
            >
              {getTopicName(workspace, claim.topicId)}
            </button>
          </dd>
        </div>
        <div>
          <dt>Linked sources</dt>
          <dd>{claim.sourceIds.length}</dd>
        </div>
        <div>
          <dt>Related claims</dt>
          <dd>{claim.relatedClaims.length}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{claim.updatedAt.slice(0, 10)}</dd>
        </div>
      </dl>

      <div className="detail-section">
        <p className="panel-label">Source evidence</p>
        {claim.sourceIds.length > 0 ? (
          <div className="tag-row">
            {claim.sourceIds.map((sourceId) => (
              <button
                key={sourceId}
                type="button"
                className="topic-link-button"
                onClick={() => onOpenSource(sourceId)}
              >
                {getSourceTitle(workspace, sourceId)}
              </button>
            ))}
          </div>
        ) : (
          <p>No linked sources yet.</p>
        )}
      </div>

      <div className="detail-section">
        <p className="panel-label">Relationship map</p>
        {claim.relatedClaims.length > 0 ? (
          <ul className="record-list compact-list">
            {claim.relatedClaims.map((link) => (
              <li key={link.claimId} className="record-item">
                <div className="record-header">
                  <div>
                    <h3>{getClaimText(workspace, link.claimId)}</h3>
                    <p className="record-meta">{link.relationship}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onOpenClaim(link.claimId)}
                  >
                    Open claim
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No related claims linked yet.</p>
        )}
      </div>

      <div className="detail-section">
        <p className="panel-label">Notes</p>
        <p>{claim.notes || "No claim notes yet."}</p>
      </div>

      <button type="button" className="primary-button" onClick={onCreateClaim}>
        Add another claim
      </button>
    </section>
  );
}
