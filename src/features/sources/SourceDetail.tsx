import { getTopicName } from "../../lib/workspace";
import { getClaimsForSource } from "../claims/claimUtils";
import type { SourceRecord } from "../../types/source";
import type { WorkspaceData } from "../../types/workspace";

interface SourceDetailProps {
  source: SourceRecord;
  workspace: WorkspaceData;
  onEditSource: (sourceId: string) => void;
  onCreateSource: () => void;
  onOpenClaim: (claimId: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export function SourceDetail({
  source,
  workspace,
  onEditSource,
  onCreateSource,
  onOpenClaim,
  onOpenTopic,
}: SourceDetailProps) {
  const topicNames = source.topicIds.map((topicId) =>
    getTopicName(workspace, topicId),
  );
  const linkedClaims = getClaimsForSource(workspace, source.id);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Source detail</p>
          <h2>{source.title}</h2>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onEditSource(source.id)}
        >
          Edit source
        </button>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Type</dt>
          <dd>{source.type}</dd>
        </div>
        <div>
          <dt>Publisher</dt>
          <dd>{source.publisher || "Not set"}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{source.publishedAt || "Not set"}</dd>
        </div>
        <div>
          <dt>Topics</dt>
          <dd>
            {source.topicIds.length > 0 ? (
              <div className="tag-row">
                {source.topicIds.map((topicId, index) => (
                  <button
                    key={topicId}
                    type="button"
                    className="topic-link-button"
                    onClick={() => onOpenTopic(topicId)}
                  >
                    {topicNames[index]}
                  </button>
                ))}
              </div>
            ) : (
              "None assigned"
            )}
          </dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{source.tags.join(", ") || "None"}</dd>
        </div>
        <div>
          <dt>Link</dt>
          <dd>
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                Open source
              </a>
            ) : (
              "Not set"
            )}
          </dd>
        </div>
      </dl>

      <div className="detail-section">
        <p className="panel-label">Manual summary</p>
        <p>{source.summary || "No summary captured yet."}</p>
      </div>

      <div className="detail-section">
        <p className="panel-label">Key takeaways</p>
        {source.keyTakeaways.length > 0 ? (
          <ul className="takeaway-list">
            {source.keyTakeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        ) : (
          <p>No takeaways captured yet.</p>
        )}
      </div>

      <div className="detail-section">
        <p className="panel-label">Notes</p>
        <p>{source.notes || "No notes yet."}</p>
      </div>

      <div className="detail-section">
        <p className="panel-label">Linked claims</p>
        {linkedClaims.length > 0 ? (
          <ul className="record-list compact-list">
            {linkedClaims.map((claim) => (
              <li key={claim.id} className="record-item">
                <div className="record-header">
                  <div>
                    <h3>{claim.text}</h3>
                    <p className="record-meta">
                      {getTopicName(workspace, claim.topicId)} · {claim.relatedClaims.length}{" "}
                      relationship{claim.relatedClaims.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onOpenClaim(claim.id)}
                  >
                    Open claim
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No claims link back to this source yet.</p>
        )}
      </div>

      <button type="button" className="primary-button" onClick={onCreateSource}>
        Add another source
      </button>
    </section>
  );
}
