import {
  ALL_FILTER_VALUE,
  type WorkspaceFilterOptions,
  type WorkspaceFilters,
} from "../lib/workspaceQuery";

interface WorkspaceToolbarProps {
  filters: WorkspaceFilters;
  filterOptions: WorkspaceFilterOptions;
  importMessage: string | null;
  resultSummary: string;
  onExport: () => void;
  onImport: () => void;
  onResetFilters: () => void;
  onUpdateFilters: (filters: WorkspaceFilters) => void;
}

export function WorkspaceToolbar({
  filters,
  filterOptions,
  importMessage,
  resultSummary,
  onExport,
  onImport,
  onResetFilters,
  onUpdateFilters,
}: WorkspaceToolbarProps) {
  return (
    <section className="panel toolbar-panel">
      <div className="panel-heading toolbar-heading">
        <div>
          <p className="panel-label">Workspace controls</p>
          <h2>Search, filter, and move data</h2>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="secondary-button" onClick={onExport}>
            Export JSON
          </button>
          <button type="button" className="secondary-button" onClick={onImport}>
            Import JSON
          </button>
        </div>
      </div>

      <div className="toolbar-grid">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            value={filters.searchText}
            placeholder="Titles, notes, topics, claims"
            onChange={(event) =>
              onUpdateFilters({
                ...filters,
                searchText: event.target.value,
              })
            }
          />
        </label>

        <label className="field">
          <span>Topic</span>
          <select
            value={filters.topicId}
            onChange={(event) =>
              onUpdateFilters({
                ...filters,
                topicId: event.target.value,
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>All topics</option>
            {filterOptions.topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Tag</span>
          <select
            value={filters.tag}
            onChange={(event) =>
              onUpdateFilters({
                ...filters,
                tag: event.target.value,
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>All tags</option>
            {filterOptions.tags.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Source type</span>
          <select
            value={filters.sourceType}
            onChange={(event) =>
              onUpdateFilters({
                ...filters,
                sourceType: event.target.value as WorkspaceFilters["sourceType"],
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>All types</option>
            {filterOptions.sourceTypes.map((sourceType) => (
              <option key={sourceType.value} value={sourceType.value}>
                {sourceType.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Relationship</span>
          <select
            value={filters.relationshipState}
            onChange={(event) =>
              onUpdateFilters({
                ...filters,
                relationshipState:
                  event.target.value as WorkspaceFilters["relationshipState"],
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>All states</option>
            {filterOptions.relationshipStates.map((relationshipState) => (
              <option key={relationshipState.value} value={relationshipState.value}>
                {relationshipState.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar-footer">
        <p className="record-meta">{resultSummary}</p>
        <div className="toolbar-actions">
          <button type="button" className="secondary-button" onClick={onResetFilters}>
            Clear filters
          </button>
        </div>
      </div>

      {importMessage ? <p className="form-message toolbar-message">{importMessage}</p> : null}
    </section>
  );
}
