import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  workspace: WorkspaceData;
  onSaveSource: (source: SourceRecord) => void;
}

type EditorMode = "create" | "edit" | null;

export function SourceLibrarySection({
  workspace,
  onSaveSource,
}: SourceLibrarySectionProps) {
  const sortedSources = useMemo(
    () =>
      [...workspace.sources].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
    [workspace.sources],
  );

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    sortedSources[0]?.id ?? null,
  );
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [formValues, setFormValues] = useState<SourceFormValues>(() =>
    createEmptySourceFormValues(getTodayDateValue()),
  );

  const selectedSource =
    workspace.sources.find((source) => source.id === selectedSourceId) ?? null;

  useEffect(() => {
    if (!selectedSourceId && sortedSources[0]) {
      setSelectedSourceId(sortedSources[0].id);
      return;
    }

    if (
      selectedSourceId &&
      !workspace.sources.some((source) => source.id === selectedSourceId)
    ) {
      setSelectedSourceId(sortedSources[0]?.id ?? null);
    }
  }, [selectedSourceId, sortedSources, workspace.sources]);

  function handleCreateSource() {
    setEditorMode("create");
    setFormValues(createEmptySourceFormValues(getTodayDateValue()));
  }

  function handleEditSource(sourceId: string) {
    const source = workspace.sources.find((entry) => entry.id === sourceId);

    if (!source) {
      return;
    }

    setSelectedSourceId(source.id);
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
    setSelectedSourceId(nextSource.id);
    setEditorMode(null);
    setFormValues(createSourceFormValues(nextSource));
  }

  return (
    <>
      <SourceList
        selectedSourceId={selectedSourceId}
        sources={sortedSources}
        workspace={workspace}
        onCreateSource={handleCreateSource}
        onEditSource={handleEditSource}
        onSelectSource={setSelectedSourceId}
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
          />
        ) : (
          <SourceForm
            formValues={formValues}
            isEditing={false}
            topics={workspace.topics}
            onCancel={handleCancelEditor}
            onSubmit={handleSubmit}
            onValuesChange={setFormValues}
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
