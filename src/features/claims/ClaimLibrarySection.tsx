import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ClaimDetail } from "./ClaimDetail";
import { ClaimForm } from "./ClaimForm";
import { ClaimList } from "./ClaimList";
import {
  createClaimFormValues,
  createClaimRecord,
  createEmptyClaimFormValues,
  type ClaimFormValues,
} from "./claimUtils";
import type { ClaimRecord } from "../../types/claim";
import type { WorkspaceData } from "../../types/workspace";

interface ClaimLibrarySectionProps {
  workspace: WorkspaceData;
  selectedClaimId: string | null;
  onOpenSource: (sourceId: string) => void;
  onOpenTopic: (topicId: string) => void;
  onSaveClaim: (claim: ClaimRecord) => void;
  onSelectClaim: (claimId: string | null) => void;
}

type EditorMode = "create" | "edit" | null;

export function ClaimLibrarySection({
  workspace,
  selectedClaimId,
  onOpenSource,
  onOpenTopic,
  onSaveClaim,
  onSelectClaim,
}: ClaimLibrarySectionProps) {
  const sortedClaims = useMemo(
    () =>
      [...workspace.claims].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
    [workspace.claims],
  );
  const defaultTopicId = workspace.topics[0]?.id ?? "";
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ClaimFormValues>(() =>
    createEmptyClaimFormValues(defaultTopicId),
  );

  const selectedClaim =
    workspace.claims.find((claim) => claim.id === selectedClaimId) ?? null;
  const editingClaimId = editorMode === "edit" ? selectedClaim?.id : null;

  const relatedClaimOptions = useMemo(
    () =>
      workspace.claims
        .filter((claim) => claim.id !== editingClaimId)
        .map((claim) => ({
          id: claim.id,
          text: claim.text,
        })),
    [editingClaimId, workspace.claims],
  );

  useEffect(() => {
    if (!selectedClaimId && sortedClaims[0]) {
      onSelectClaim(sortedClaims[0].id);
      return;
    }

    if (
      selectedClaimId &&
      !workspace.claims.some((claim) => claim.id === selectedClaimId)
    ) {
      onSelectClaim(sortedClaims[0]?.id ?? null);
    }
  }, [onSelectClaim, selectedClaimId, sortedClaims, workspace.claims]);

  useEffect(() => {
    if (editorMode === null) {
      setFormValues((currentValues) =>
        currentValues.topicId ? currentValues : createEmptyClaimFormValues(defaultTopicId),
      );
    }
  }, [defaultTopicId, editorMode]);

  function handleCreateClaim() {
    setEditorMode("create");
    setValidationMessage(null);
    setFormValues(createEmptyClaimFormValues(defaultTopicId));
  }

  function handleEditClaim(claimId: string) {
    const claim = workspace.claims.find((entry) => entry.id === claimId);

    if (!claim) {
      return;
    }

    onSelectClaim(claim.id);
    setEditorMode("edit");
    setValidationMessage(null);
    setFormValues(createClaimFormValues(claim));
  }

  function handleCancelEditor() {
    setEditorMode(null);
    setValidationMessage(null);
    setFormValues(createEmptyClaimFormValues(defaultTopicId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formValues.sourceIds.length === 0) {
      setValidationMessage("Select at least one source before saving a claim.");
      return;
    }

    if (!formValues.topicId) {
      setValidationMessage("Select a topic before saving a claim.");
      return;
    }

    const existingClaim =
      editorMode === "edit" && selectedClaim ? selectedClaim : undefined;
    const nextClaim = createClaimRecord(
      formValues,
      new Date().toISOString(),
      existingClaim,
    );

    onSaveClaim(nextClaim);
    onSelectClaim(nextClaim.id);
    setEditorMode(null);
    setValidationMessage(null);
    setFormValues(createClaimFormValues(nextClaim));
  }

  return (
    <>
      <ClaimList
        claims={sortedClaims}
        selectedClaimId={selectedClaimId}
        workspace={workspace}
        onCreateClaim={handleCreateClaim}
        onEditClaim={handleEditClaim}
        onSelectClaim={(claimId) => onSelectClaim(claimId)}
      />

      <aside className="side-column">
        {editorMode ? (
          <ClaimForm
            formValues={formValues}
            isEditing={editorMode === "edit"}
            topics={workspace.topics}
            sources={workspace.sources}
            relatedClaimOptions={relatedClaimOptions}
            validationMessage={validationMessage}
            onCancel={handleCancelEditor}
            onSubmit={handleSubmit}
            onValuesChange={(values) => {
              setValidationMessage(null);
              setFormValues(values);
            }}
          />
        ) : selectedClaim ? (
          <ClaimDetail
            claim={selectedClaim}
            workspace={workspace}
            onCreateClaim={handleCreateClaim}
            onEditClaim={handleEditClaim}
            onOpenClaim={(claimId) => onSelectClaim(claimId)}
            onOpenSource={onOpenSource}
            onOpenTopic={onOpenTopic}
          />
        ) : (
          <ClaimForm
            formValues={formValues}
            isEditing={false}
            topics={workspace.topics}
            sources={workspace.sources}
            relatedClaimOptions={relatedClaimOptions}
            validationMessage={validationMessage}
            onCancel={handleCancelEditor}
            onSubmit={handleSubmit}
            onValuesChange={(values) => {
              setValidationMessage(null);
              setFormValues(values);
            }}
          />
        )}

        <section className="panel">
          <p className="panel-label">Current section</p>
          <h2>Claims</h2>
          <p>
            Claims stay explicit: each record names its topic, lists the sources it
            relies on, and stores only direct support, contradiction, or neutral
            links to other claims.
          </p>
          <p className="record-meta">
            Last workspace update: {workspace.meta.lastUpdatedAt.slice(0, 10)}
          </p>
        </section>
      </aside>
    </>
  );
}
