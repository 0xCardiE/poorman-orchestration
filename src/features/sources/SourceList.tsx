import { getTopicName } from "../../lib/workspace";
import type { SourceRecord } from "../../types/source";
import type { WorkspaceData } from "../../types/workspace";

interface SourceListProps {
  hasActiveFilters: boolean;
  selectedSourceId: string | null;
  sources: SourceRecord[];
  workspace: WorkspaceData;
  onCreateSource: () => void;
  onEditSource: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export function SourceList({
  hasActiveFilters,
  selectedSourceId,
  sources,
  workspace,
  onCreateSource,
  onEditSource,
  onSelectSource,
  onOpenTopic,
}: SourceListProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-label">Source library</p>
          <h2>Saved sources</h2>
        </div>
        <button type="button" className="primary-button" onClick={onCreateSource}>
          Add source
        </button>
      </div>

      {sources.length > 0 ? (
        <ul className="source-list">
          {sources.map((source) => {
            const isSelected = selectedSourceId === source.id;
            const topicNames = source.topicIds.map((topicId) =>
              getTopicName(workspace, topicId),
            );

            return (
              <li
                key={source.id}
                className={isSelected ? "source-card selected" : "source-card"}
              >
                <div className="source-card-header">
                  <div>
                    <h3>{source.title}</h3>
                    <p className="record-meta">
                      {source.publisher || "Unknown publisher"} ·{" "}
                      {source.publishedAt || "No date"}
                    </p>
                  </div>
                  <span className="pill subtle">{source.type}</span>
                </div>

                <p className="source-card-text">{source.summary || source.notes}</p>

                <dl className="source-card-grid">
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
                </dl>

                <div className="source-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onSelectSource(source.id)}
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onEditSource(source.id)}
                  >
                    Edit
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-copy">
          {hasActiveFilters
            ? "No sources match the current search and filter settings."
            : "No sources saved yet."}
        </p>
      )}
    </section>
  );
}
