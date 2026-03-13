import { useState } from "react";
import { SectionNavigation } from "../components/SectionNavigation";
import { saveClaimRecord, saveSourceRecord } from "../lib/workspace";
import type { AppSectionId } from "../types/app";
import { useWorkspace } from "./useWorkspace";
import { ClaimLibrarySection } from "../features/claims/ClaimLibrarySection";
import { DigestDashboardSection } from "../features/digests/DigestDashboardSection";
import { SourceLibrarySection } from "../features/sources/SourceLibrarySection";
import { TopicLibrarySection } from "../features/topics/TopicLibrarySection";
import type { ClaimRecord } from "../types/claim";
import type { SourceRecord } from "../types/source";
import "./App.css";

export function App() {
  const [activeSection, setActiveSection] = useState<AppSectionId>("sources");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedDigestTopicId, setSelectedDigestTopicId] = useState<string | null>(
    null,
  );
  const { resetWorkspace, setWorkspace, workspace } = useWorkspace();
  const isSourcesSection = activeSection === "sources";

  function handleSaveSource(source: SourceRecord) {
    setWorkspace((currentWorkspace) => saveSourceRecord(currentWorkspace, source));
  }

  function handleSaveClaim(claim: ClaimRecord) {
    setWorkspace((currentWorkspace) => saveClaimRecord(currentWorkspace, claim));
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
          <button type="button" className="reset-button" onClick={resetWorkspace}>
            Reset demo data
          </button>
        </div>
      </header>

      <SectionNavigation
        activeSection={activeSection}
        onSelect={setActiveSection}
        workspace={workspace}
      />

      <main className="content-grid">
        {isSourcesSection ? (
          <SourceLibrarySection
            workspace={workspace}
            selectedSourceId={selectedSourceId}
            onOpenClaim={handleOpenClaim}
            onOpenTopic={handleOpenTopic}
            onSaveSource={handleSaveSource}
            onSelectSource={setSelectedSourceId}
          />
        ) : activeSection === "topics" ? (
          <TopicLibrarySection
            workspace={workspace}
            selectedTopicId={selectedTopicId}
            onOpenClaim={handleOpenClaim}
            onOpenSource={handleOpenSource}
            onSelectTopic={setSelectedTopicId}
          />
        ) : activeSection === "claims" ? (
          <ClaimLibrarySection
            workspace={workspace}
            selectedClaimId={selectedClaimId}
            onOpenSource={handleOpenSource}
            onOpenTopic={handleOpenTopic}
            onSaveClaim={handleSaveClaim}
            onSelectClaim={setSelectedClaimId}
          />
        ) : (
          <DigestDashboardSection
            workspace={workspace}
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
