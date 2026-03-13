import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { WorkspaceToolbar } from "../components/WorkspaceToolbar";
import { SectionNavigation } from "../components/SectionNavigation";
import { exportWorkspaceData, parseWorkspaceData } from "../lib/storage";
import {
  createDefaultWorkspaceFilters,
  getFilteredWorkspaceView,
  getWorkspaceFilterOptions,
} from "../lib/workspaceQuery";
import {
  saveClaimRecord,
  saveSourceRecord,
  saveTopicRecord,
} from "../lib/workspace";
import type { AppSectionId } from "../types/app";
import { useWorkspace } from "./useWorkspace";
import { ClaimLibrarySection } from "../features/claims/ClaimLibrarySection";
import { DigestDashboardSection } from "../features/digests/DigestDashboardSection";
import { SourceLibrarySection } from "../features/sources/SourceLibrarySection";
import { TopicLibrarySection } from "../features/topics/TopicLibrarySection";
import type { ClaimRecord } from "../types/claim";
import type { SourceRecord } from "../types/source";
import type { TopicRecord } from "../types/topic";
import "./App.css";

export function App() {
  const [activeSection, setActiveSection] = useState<AppSectionId>("sources");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [filters, setFilters] = useState(createDefaultWorkspaceFilters);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [selectedDigestTopicId, setSelectedDigestTopicId] = useState<string | null>(
    null,
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { resetWorkspace, setWorkspace, workspace } = useWorkspace();
  const isSourcesSection = activeSection === "sources";
  const filterOptions = useMemo(() => getWorkspaceFilterOptions(workspace), [workspace]);
  const filteredWorkspace = useMemo(
    () => getFilteredWorkspaceView(workspace, filters),
    [filters, workspace],
  );
  const digestWorkspace = useMemo(
    () => ({
      ...workspace,
      sources: filteredWorkspace.sources,
      topics: filteredWorkspace.topics,
      claims: filteredWorkspace.claims,
    }),
    [filteredWorkspace.claims, filteredWorkspace.sources, filteredWorkspace.topics, workspace],
  );

  const resultSummary = filteredWorkspace.hasActiveFilters
    ? `${filteredWorkspace.sources.length} sources, ${filteredWorkspace.topics.length} topics, and ${filteredWorkspace.claims.length} claims match the current view.`
    : `${workspace.sources.length} sources, ${workspace.topics.length} topics, and ${workspace.claims.length} claims are available.`;

  function handleSaveSource(source: SourceRecord) {
    setWorkspace((currentWorkspace) => saveSourceRecord(currentWorkspace, source));
    setImportMessage(null);
  }

  function handleSaveClaim(claim: ClaimRecord) {
    setWorkspace((currentWorkspace) => saveClaimRecord(currentWorkspace, claim));
    setImportMessage(null);
  }

  function handleSaveTopic(topic: TopicRecord) {
    setWorkspace((currentWorkspace) => saveTopicRecord(currentWorkspace, topic));
    setImportMessage(null);
  }

  function handleOpenTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setActiveSection("topics");
  }

  function handleOpenSource(sourceId: string) {
    setSelectedSourceId(sourceId);
    setActiveSection("sources");
  }

  function handleOpenClaim(claimId: string) {
    setSelectedClaimId(claimId);
    setActiveSection("claims");
  }

  function handleResetWorkspace() {
    setSelectedSourceId(null);
    setSelectedClaimId(null);
    setSelectedTopicId(null);
    setSelectedDigestTopicId(null);
    setImportMessage(null);
    resetWorkspace();
  }

  function handleExportWorkspace() {
    const fileName = `${workspace.meta.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace"}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    const fileContents = exportWorkspaceData(workspace);
    const blob = new Blob([fileContents], { type: "application/json" });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
    setImportMessage(`Exported ${fileName}.`);
  }

  async function handleImportWorkspace(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const importedValue = await file.text();
      const importedWorkspace = parseWorkspaceData(importedValue);

      if (!importedWorkspace) {
        setImportMessage("Import failed. Select a valid workspace JSON file.");
        return;
      }

      setSelectedSourceId(null);
      setSelectedClaimId(null);
      setSelectedTopicId(null);
      setSelectedDigestTopicId(null);
      setWorkspace(importedWorkspace);
      setImportMessage(`Imported ${file.name}.`);
    } catch {
      setImportMessage("Import failed. The selected file could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="app-shell">
      <header className="hero panel">
        <div>
          <p className="eyebrow">Niche Research Digest</p>
          <h1>Local-first research workspace</h1>
          <p className="intro">
            A simple shell for collecting sources, grouping topics, tracking
            claims, and generating explainable topic digests. The app starts with demo data and
            persists the workspace in local storage.
          </p>
        </div>
        <div className="hero-actions">
          <div className="status-card">
            <span className="status-value">
              {workspace.sources.length + workspace.topics.length + workspace.claims.length}
            </span>
            <span className="status-label">records in workspace</span>
          </div>
          <button
            type="button"
            className="reset-button"
            onClick={handleResetWorkspace}
          >
            Reset demo data
          </button>
        </div>
      </header>

      <WorkspaceToolbar
        filters={filters}
        filterOptions={filterOptions}
        importMessage={importMessage}
        resultSummary={resultSummary}
        onExport={handleExportWorkspace}
        onImport={() => importInputRef.current?.click()}
        onResetFilters={() => setFilters(createDefaultWorkspaceFilters())}
        onUpdateFilters={(nextFilters) => {
          setFilters(nextFilters);
          setImportMessage(null);
        }}
      />

      <input
        ref={importInputRef}
        hidden
        accept="application/json,.json"
        type="file"
        onChange={handleImportWorkspace}
      />

      <SectionNavigation
        activeSection={activeSection}
        onSelect={setActiveSection}
        workspace={workspace}
      />

      <main className="content-grid">
        {isSourcesSection ? (
          <SourceLibrarySection
            workspace={workspace}
            visibleSources={filteredWorkspace.sources}
            hasActiveFilters={filteredWorkspace.hasActiveFilters}
            selectedSourceId={selectedSourceId}
            onOpenClaim={handleOpenClaim}
            onOpenTopic={handleOpenTopic}
            onSaveSource={handleSaveSource}
            onSelectSource={setSelectedSourceId}
          />
        ) : activeSection === "topics" ? (
          <TopicLibrarySection
            workspace={workspace}
            visibleTopics={filteredWorkspace.topics}
            hasActiveFilters={filteredWorkspace.hasActiveFilters}
            selectedTopicId={selectedTopicId}
            onOpenClaim={handleOpenClaim}
            onOpenSource={handleOpenSource}
            onSaveTopic={handleSaveTopic}
            onSelectTopic={setSelectedTopicId}
          />
        ) : activeSection === "claims" ? (
          <ClaimLibrarySection
            workspace={workspace}
            visibleClaims={filteredWorkspace.claims}
            hasActiveFilters={filteredWorkspace.hasActiveFilters}
            selectedClaimId={selectedClaimId}
            onOpenSource={handleOpenSource}
            onOpenTopic={handleOpenTopic}
            onSaveClaim={handleSaveClaim}
            onSelectClaim={setSelectedClaimId}
          />
        ) : (
          <DigestDashboardSection
            workspace={workspace}
            digestWorkspace={digestWorkspace}
            hasActiveFilters={filteredWorkspace.hasActiveFilters}
            selectedTopicId={selectedDigestTopicId}
            onOpenClaim={handleOpenClaim}
            onOpenSource={handleOpenSource}
            onOpenTopic={handleOpenTopic}
            onSelectTopic={setSelectedDigestTopicId}
          />
        )}
      </main>
    </div>
  );
}
