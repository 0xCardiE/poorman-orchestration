import { useEffect, useMemo, useState, type FormEvent } from "react";
import { EmptyState } from "../../components/EmptyState";
import { SourceDetail } from "./SourceDetail";
import { SourceForm } from "./SourceForm";
import { SourceList } from "./SourceList";
import {
  createEmptySourceFormValues,
  createSourceFormValues,
  createSourceRecord,
  getTodayDateValue,
  type SourceFormValues,
} from "./sourceUtils";
import type { SourceRecord } from "../../types/source";
import type { WorkspaceData } from "../../types/workspace";

interface SourceLibrarySectionProps {
  hasActiveFilters: boolean;
  workspace: WorkspaceData;
  visibleSources: SourceRecord[];
  selectedSourceId: string | null;
  onOpenClaim: (claimId: string) => void;
  onSaveSource: (source: SourceRecord) => void;
  onSelectSource: (sourceId: string | null) => void;
  onOpenTopic: (topicId: string) => void;
}

type EditorMode = "create" | "edit" | null;

export function SourceLibrarySection({
  hasActiveFilters,
  workspace,
  visibleSources,
  selectedSourceId,
  onOpenClaim,
  onSaveSource,
  onSelectSource,
  onOpenTopic,
}: SourceLibrarySectionProps) {
  const sortedSources = useMemo(
    () => [...visibleSources].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [visibleSources],
  );

  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [formValues, setFormValues] = useState<SourceFormValues>(() =>
    createEmptySourceFormValues(getTodayDateValue()),
  );

  const selectedSource = sortedSources.find((source) => source.id === selectedSourceId) ?? null;

  useEffect(() => {
    if (!selectedSourceId && sortedSources[0]) {
      onSelectSource(sortedSources[0].id);
      return;
    }

    if (
      selectedSourceId &&
      !sortedSources.some((source) => source.id === selectedSourceId)
    ) {
      onSelectSource(sortedSources[0]?.id ?? null);
    }
  }, [onSelectSource, selectedSourceId, sortedSources]);

  function handleCreateSource() {
    setEditorMode("create");
    setFormValues(createEmptySourceFormValues(getTodayDateValue()));
  }

  function handleEditSource(sourceId: string) {
    const source = workspace.sources.find((entry) => entry.id === sourceId);

    if (!source) {
      return;
    }

    onSelectSource(source.id);
    setEditorMode("edit");
    setFormValues(createSourceFormValues(source));
  }

  function handleCancelEditor() {
    setEditorMode(null);
    setFormValues(createEmptySourceFormValues(getTodayDateValue()));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const existingSource =
      editorMode === "edit" && selectedSource ? selectedSource : undefined;
    const nextSource = createSourceRecord(
      formValues,
      new Date().toISOString(),
      existingSource,
    );

    onSaveSource(nextSource);
    onSelectSource(nextSource.id);
    setEditorMode(null);
    setFormValues(createSourceFormValues(nextSource));
  }

  return (
    <>
      <SourceList
        hasActiveFilters={hasActiveFilters}
        selectedSourceId={selectedSourceId}
        sources={sortedSources}
        workspace={workspace}
        onCreateSource={handleCreateSource}
        onEditSource={handleEditSource}
        onOpenTopic={onOpenTopic}
        onSelectSource={(sourceId) => onSelectSource(sourceId)}
      />

      <aside className="side-column">
        {editorMode ? (
          <SourceForm
            formValues={formValues}
            isEditing={editorMode === "edit"}
            topics={workspace.topics}
            onCancel={handleCancelEditor}
            onSubmit={handleSubmit}
            onValuesChange={setFormValues}
          />
        ) : selectedSource ? (
          <SourceDetail
            source={selectedSource}
            workspace={workspace}
            onEditSource={handleEditSource}
            onCreateSource={handleCreateSource}
            onOpenClaim={onOpenClaim}
            onOpenTopic={onOpenTopic}
          />
        ) : (
          <EmptyState
            title={
              hasActiveFilters ? "No sources match the current filters" : "No sources yet"
            }
            description={
              hasActiveFilters
                ? "Clear or adjust the workspace filters to see more source records."
                : "Add a source to start building a research library."
            }
          />
        )}

        <section className="panel">
          <p className="panel-label">Current section</p>
          <h2>Source library</h2>
          <p>
            Save research inputs with a lightweight manual summary so topic and
            claim work can build on cleaner notes later.
          </p>
          <p className="record-meta">
            Last workspace update: {workspace.meta.lastUpdatedAt.slice(0, 10)}
          </p>
        </section>
      </aside>
    </>
  );
}
