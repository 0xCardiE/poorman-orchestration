import { useEffect, useMemo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { getTopicName } from "../../lib/workspace";
import type { WorkspaceData } from "../../types/workspace";
import { getTopicSnapshots } from "./topicUtils";

interface TopicLibrarySectionProps {
  hasActiveFilters: boolean;
  workspace: WorkspaceData;
  visibleTopics: WorkspaceData["topics"];
  selectedTopicId: string | null;
  onOpenClaim: (claimId: string) => void;
  onOpenSource: (sourceId: string) => void;
  onSelectTopic: (topicId: string | null) => void;
}

export function TopicLibrarySection({
  hasActiveFilters,
  workspace,
  visibleTopics,
  selectedTopicId,
  onOpenClaim,
  onOpenSource,
  onSelectTopic,
}: TopicLibrarySectionProps) {
  const topicSnapshots = useMemo(() => {
    const visibleTopicIds = new Set(visibleTopics.map((topic) => topic.id));

    return getTopicSnapshots(workspace).filter((snapshot) =>
      visibleTopicIds.has(snapshot.topic.id),
    );
  }, [visibleTopics, workspace]);

  const selectedTopic =
    topicSnapshots.find((snapshot) => snapshot.topic.id === selectedTopicId) ??
    topicSnapshots[0] ??
    null;

  useEffect(() => {
    if (!selectedTopicId && topicSnapshots[0]) {
      onSelectTopic(topicSnapshots[0].topic.id);
      return;
    }

    if (
      selectedTopicId &&
      !topicSnapshots.some((snapshot) => snapshot.topic.id === selectedTopicId)
    ) {
      onSelectTopic(topicSnapshots[0]?.topic.id ?? null);
    }
  }, [onSelectTopic, selectedTopicId, topicSnapshots]);

  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-label">Topic overview</p>
            <h2>Tracked topics</h2>
          </div>
          <span className="pill">{topicSnapshots.length} tracked</span>
        </div>

        {topicSnapshots.length > 0 ? (
          <ul className="source-list">
            {topicSnapshots.map((snapshot) => {
              const isSelected = snapshot.topic.id === selectedTopic?.topic.id;

              return (
                <li
                  key={snapshot.topic.id}
                  className={isSelected ? "source-card selected" : "source-card"}
                >
                  <div className="source-card-header">
                    <div>
                      <h3>{snapshot.topic.name}</h3>
                      <p className="record-meta">
                        {snapshot.sources.length} sources · {snapshot.claims.length} claims ·{" "}
                        {snapshot.topic.questionPrompts.length} open questions
                      </p>
                    </div>
                    <span className="pill subtle">
                      {snapshot.tags.length} tags
                    </span>
                  </div>

                  <p className="source-card-text">{snapshot.topic.description}</p>

                  <dl className="source-card-grid">
                    <div>
                      <dt>Top tags</dt>
                      <dd>
                        {snapshot.tags
                          .slice(0, 3)
                          .map((entry) => entry.tag)
                          .join(", ") || "None"}
                      </dd>
                    </div>
                    <div>
                      <dt>Recent additions</dt>
                      <dd>
                        {snapshot.recentSources
                          .map((source) => source.title)
                          .join(", ") || "No sources yet"}
                      </dd>
                    </div>
                  </dl>

                  <div className="source-card-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onSelectTopic(snapshot.topic.id)}
                    >
                      View topic
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-copy">
            {hasActiveFilters
              ? "No topics match the current search and filter settings."
              : "No topics saved yet."}
          </p>
        )}
      </section>

      <aside className="side-column">
        {selectedTopic ? (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-label">Topic detail</p>
                <h2>{selectedTopic.topic.name}</h2>
              </div>
              <span className="pill">{selectedTopic.sources.length} sources</span>
            </div>

            <p>{selectedTopic.topic.description}</p>

            <div className="detail-section">
              <p className="panel-label">Tags</p>
              <div className="tag-row">
                {selectedTopic.tags.length > 0 ? (
                  selectedTopic.tags.map((entry) => (
                    <span key={entry.tag} className="pill subtle">
                      {entry.tag} ({entry.count})
                    </span>
                  ))
                ) : (
                  <p>No tags linked to this topic yet.</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <p className="panel-label">Recent additions</p>
              {selectedTopic.recentSources.length > 0 ? (
                <ul className="record-list compact-list">
                  {selectedTopic.recentSources.map((source) => (
                    <li key={source.id} className="record-item">
                      <div className="record-header">
                        <div>
                          <h3>{source.title}</h3>
                          <p className="record-meta">
                            {source.publisher || "Unknown publisher"} ·{" "}
                            {source.createdAt.slice(0, 10)}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent sources for this topic yet.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Linked claims</p>
              {selectedTopic.claims.length > 0 ? (
                <ul className="record-list compact-list">
                  {selectedTopic.claims.map((claim) => (
                    <li key={claim.id} className="record-item">
                      <div className="record-header">
                        <div>
                          <h3>{claim.text}</h3>
                          <p className="record-meta">
                            {claim.sourceIds.length} linked source
                            {claim.sourceIds.length === 1 ? "" : "s"} ·{" "}
                            {claim.relatedClaims.length} relationship
                            {claim.relatedClaims.length === 1 ? "" : "s"}
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
                <p>No claims are linked to this topic yet.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Related sources</p>
              {selectedTopic.sources.length > 0 ? (
                <ul className="record-list compact-list">
                  {selectedTopic.sources.map((source) => (
                    <li key={source.id} className="record-item">
                      <div className="record-header">
                        <div>
                          <h3>{source.title}</h3>
                          <p className="record-meta">
                            {source.tags.join(", ") || "No tags"}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No sources are assigned to this topic yet.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Related topics</p>
              {selectedTopic.relatedTopics.length > 0 ? (
                <div className="tag-row">
                  {selectedTopic.relatedTopics.map((relatedTopic) => (
                    <button
                      key={relatedTopic.topicId}
                      type="button"
                      className="topic-link-button"
                      onClick={() => onSelectTopic(relatedTopic.topicId)}
                    >
                      {relatedTopic.name} · {relatedTopic.sharedSourceCount} shared
                      source
                      {relatedTopic.sharedSourceCount === 1 ? "" : "s"}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No lightweight cross-topic links yet.</p>
              )}
            </div>

            <div className="detail-section">
              <p className="panel-label">Open questions</p>
              {selectedTopic.topic.questionPrompts.length > 0 ? (
                <ul className="takeaway-list">
                  {selectedTopic.topic.questionPrompts.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              ) : (
                <p>No open questions captured for this topic.</p>
              )}
            </div>
          </section>
        ) : (
          <EmptyState
            title={
              hasActiveFilters ? "No topics match the current filters" : "No topics yet"
            }
            description={
              hasActiveFilters
                ? "Clear or adjust the workspace filters to see more topic records."
                : "Add a topic to start grouping related sources and tags."
            }
          />
        )}

        <section className="panel">
          <p className="panel-label">Current section</p>
          <h2>Topics</h2>
          <p>
            Topic views stay lightweight by reusing the source assignments that
            already exist in the workspace.
          </p>
          <p className="record-meta">
            Last workspace update: {workspace.meta.lastUpdatedAt.slice(0, 10)}
          </p>
          {selectedTopic ? (
            <p className="record-meta">
              Selected topic: {getTopicName(workspace, selectedTopic.topic.id)}
            </p>
          ) : null}
        </section>
      </aside>
    </>
  );
}
