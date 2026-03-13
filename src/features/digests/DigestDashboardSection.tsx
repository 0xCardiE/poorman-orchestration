import { useEffect, useMemo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { getTopicName } from "../../lib/workspace";
import type { DigestQuestionReason, TopicDigestRecord } from "../../types/digest";
import type { WorkspaceData } from "../../types/workspace";
import { formatDigestDate, getTopicDigestRecords } from "./digestUtils";

interface DigestDashboardSectionProps {
  digestWorkspace: WorkspaceData;
  hasActiveFilters: boolean;
  workspace: WorkspaceData;
  selectedTopicId: string | null;
  onOpenClaim: (claimId: string) => void;
  onOpenSource: (sourceId: string) => void;
  onOpenTopic: (topicId: string) => void;
  onSelectTopic: (topicId: string | null) => void;
}

const questionReasonLabels: Record<DigestQuestionReason, string> = {
  "topic-question": "Saved question",
  "single-source-claim": "Evidence gap",
  "unlinked-claim": "Needs claim link",
};

export function DigestDashboardSection({
  digestWorkspace,
  hasActiveFilters,
  workspace,
  selectedTopicId,
  onOpenClaim,
  onOpenSource,
  onOpenTopic,
  onSelectTopic,
}: DigestDashboardSectionProps) {
  const digestRecords = useMemo(
    () => getTopicDigestRecords(digestWorkspace),
    [digestWorkspace],
  );

  const selectedDigest =
    digestRecords.find((record) => record.topic.id === selectedTopicId) ??
    digestRecords[0] ??
    null;

  useEffect(() => {
    if (!selectedTopicId && digestRecords[0]) {
      onSelectTopic(digestRecords[0].topic.id);
      return;
    }

    if (
      selectedTopicId &&
      !digestRecords.some((record) => record.topic.id === selectedTopicId)
    ) {
      onSelectTopic(digestRecords[0]?.topic.id ?? null);
    }
  }, [digestRecords, onSelectTopic, selectedTopicId]);

  if (digestRecords.length === 0) {
    return (
      <>
        <EmptyState
          title={
            hasActiveFilters
              ? "No digests match the current filters"
              : "No topics to digest yet"
          }
          description={
            hasActiveFilters
              ? "Clear or adjust the workspace filters to see more topic digests."
              : "Create a topic, add sources, and link claims to see a rule-based digest."
          }
        />

        <aside className="side-column">
          <section className="panel">
            <p className="panel-label">Digest rules</p>
            <h2>How summaries are built</h2>
            <p>
              Recent additions are the newest saved sources and updated claims. Open
              questions come from topic prompts and simple evidence-gap rules.
              Conflicts come only from explicit contradiction links between claims.
            </p>
          </section>
        </aside>
      </>
    );
  }

  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-label">Digest dashboard</p>
            <h2>Topic digests</h2>
          </div>
          <span className="pill">{digestRecords.length} topics</span>
        </div>

        <ul className="source-list">
          {digestRecords.map((record) => {
            const isSelected = record.topic.id === selectedDigest?.topic.id;

            return (
              <li
                key={record.topic.id}
                className={isSelected ? "source-card selected" : "source-card"}
              >
                <div className="source-card-header">
                  <div>
                    <h3>{record.topic.name}</h3>
                    <p className="record-meta">
                      {record.sources.length} sources · {record.claims.length} claims
                    </p>
                  </div>
                  <span className="pill subtle">
                    {record.unresolvedQuestions.length} open ·{" "}
                    {record.conflictingClaims.length} conflicts
                  </span>
                </div>

                <p className="source-card-text">
                  Last activity on {formatDigestDate(record.latestActivityAt)}.{" "}
                  {getDigestSummary(record)}
                </p>

                <dl className="source-card-grid">
                  <div>
                    <dt>Recent additions</dt>
                    <dd>
                      {record.recentSources.length + record.recentClaims.length > 0
                        ? `${record.recentSources.length} sources, ${record.recentClaims.length} claims`
                        : "No recent activity"}
                    </dd>
                  </div>
                  <div>
                    <dt>Attention needed</dt>
                    <dd>
                      {record.conflictingClaims.length > 0
                        ? "Conflicting claims need review"
                        : record.unresolvedQuestions.length > 0
                          ? "Open questions remain"
                          : "No active flags"}
                    </dd>
                  </div>
                </dl>

                <div className="source-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onSelectTopic(record.topic.id)}
                  >
                    View digest
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onOpenTopic(record.topic.id)}
                  >
                    Open topic
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="side-column">
        {selectedDigest ? (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">Digest detail</p>
                <h2>{selectedDigest.topic.name}</h2>
              </div>
              <span className="pill">
                {selectedDigest.unresolvedQuestions.length +
                  selectedDigest.conflictingClaims.length}{" "}
                review items
              </span>
            </div>

            <p>{getDigestSummary(selectedDigest)}</p>

            <div className="detail-section">
              <p className="panel-label">Recent additions</p>
              {selectedDigest.recentSources.length > 0 ||
              selectedDigest.recentClaims.length > 0 ? (
                <div className="digest-stack">
                  {selectedDigest.recentSources.map((source) => (
                    <div key={source.id} className="digest-card">
                      <div className="record-header">
                        <div>
                          <h3>{source.title}</h3>
                          <p className="record-meta">
                            Source added on {formatDigestDate(source.createdAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onOpenSource(source.id)}
                        >
                          Open source
                        </button>
                      </div>
                    </div>
                  ))}

                  {selectedDigest.recentClaims.map((claim) => (
                    <div key={claim.id} className="digest-card">
                      <div className="record-header">
                        <div>
                          <h3>{claim.text}</h3>
                          <p className="record-meta">
                            Claim updated on {formatDigestDate(claim.updatedAt)}
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
                    </div>
                  ))}
                </div>
              ) : (
                <p>No sources or claims have been added to this topic yet.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Unresolved questions</p>
              {selectedDigest.unresolvedQuestions.length > 0 ? (
                <div className="digest-stack">
                  {selectedDigest.unresolvedQuestions.map((question) => (
                    <div key={question.id} className="digest-card">
                      <div className="record-header">
                        <div>
                          <h3>{question.prompt}</h3>
                          <p className="record-meta">
                            {questionReasonLabels[question.reason]}
                          </p>
                        </div>
                        {question.claimId ? (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => onOpenClaim(question.claimId!)}
                          >
                            Open claim
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No unresolved questions are currently flagged for this topic.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Conflicting claims</p>
              {selectedDigest.conflictingClaims.length > 0 ? (
                <div className="digest-stack">
                  {selectedDigest.conflictingClaims.map((conflict) => (
                    <div key={conflict.id} className="digest-card">
                      <div className="record-header">
                        <div>
                          <h3>{conflict.claims[0].text}</h3>
                          <p className="record-meta">
                            Contradicts: {conflict.claims[1].text}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => onOpenClaim(conflict.claims[0].id)}
                        >
                          Open claim
                        </button>
                      </div>
                      <p className="record-meta">
                        Sources: {conflict.claims[0].sourceIds.length} and{" "}
                        {conflict.claims[1].sourceIds.length}. Related topic:{" "}
                        {getTopicName(workspace, conflict.claims[1].topicId)}.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No explicit contradictions are linked to this topic yet.</p>
              )}
            </div>
          </section>
        ) : null}

        <section className="panel">
          <p className="panel-label">Digest rules</p>
          <h2>Explainable summary</h2>
          <ul className="takeaway-list">
            <li>Recent additions are the three newest sources and three most recently updated claims for each topic.</li>
            <li>Unresolved questions come from saved topic questions, single-source claims, and claims with no links to other claims.</li>
            <li>Conflicts only appear when a claim is explicitly marked as contradicting another claim.</li>
          </ul>
        </section>
      </aside>
    </>
  );
}

function getDigestSummary(record: TopicDigestRecord) {
  if (record.sources.length === 0 && record.claims.length === 0) {
    return "No sources or claims are linked yet, so this digest is waiting on initial research.";
  }

  const summaryParts = [
    `${record.sources.length} source${record.sources.length === 1 ? "" : "s"} and ${record.claims.length} claim${record.claims.length === 1 ? "" : "s"} are linked to this topic.`,
  ];

  if (record.conflictingClaims.length > 0) {
    summaryParts.push(
      `${record.conflictingClaims.length} explicit conflict${record.conflictingClaims.length === 1 ? "" : "s"} need review.`,
    );
  } else if (record.unresolvedQuestions.length > 0) {
    summaryParts.push(
      `${record.unresolvedQuestions.length} open question${record.unresolvedQuestions.length === 1 ? "" : "s"} remain.`,
    );
  } else {
    summaryParts.push("No conflicts or open questions are currently flagged.");
  }

  return summaryParts.join(" ");
}
