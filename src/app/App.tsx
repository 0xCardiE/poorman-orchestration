import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { SectionNavigation } from "../components/SectionNavigation";
import { getTopicName, saveSourceRecord } from "../lib/workspace";
import type { AppSectionId } from "../types/app";
import { useWorkspace } from "./useWorkspace";
import { navigationItems } from "../lib/navigation";
import { SourceLibrarySection } from "../features/sources/SourceLibrarySection";
import { TopicLibrarySection } from "../features/topics/TopicLibrarySection";
import type { SourceRecord } from "../types/source";
import "./App.css";

function renderSectionContent(
  activeSection: AppSectionId,
  workspace: ReturnType<typeof useWorkspace>["workspace"],
) {
  switch (activeSection) {
    case "topics":
      return (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Topic overview</p>
              <h2>Tracked topics</h2>
            </div>
            <span className="pill">{workspace.topics.length} tracked</span>
          </div>
          <ul className="record-list">
            {workspace.topics.map((topic) => (
              <li key={topic.id} className="record-item">
                <div className="record-header">
                  <h3>{topic.name}</h3>
                  <span className="pill subtle">{topic.tags.length} tags</span>
                </div>
                <p>{topic.description}</p>
                <p className="record-meta">
                  Open questions: {topic.questionPrompts.length}
                </p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "claims":
      return (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Claim map</p>
              <h2>Captured claims</h2>
            </div>
            <span className="pill">{workspace.claims.length} claims</span>
          </div>
          <ul className="record-list">
            {workspace.claims.map((claim) => (
              <li key={claim.id} className="record-item">
                <div className="record-header">
                  <h3>{claim.text}</h3>
                  <span className="pill subtle">
                    {claim.relatedClaims.length} links
                  </span>
                </div>
                <p className="record-meta">
                  Topic: {getTopicName(workspace, claim.topicId)}
                </p>
                <p>{claim.notes}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "digests":
      return (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Digest queue</p>
              <h2>Digest items</h2>
            </div>
            <span className="pill">{workspace.digestItems.length} items</span>
          </div>
          <ul className="record-list">
            {workspace.digestItems.map((item) => (
              <li key={item.id} className="record-item">
                <div className="record-header">
                  <h3>{item.title}</h3>
                  <span className="pill subtle">{item.kind}</span>
                </div>
                <p className="record-meta">
                  Topic: {getTopicName(workspace, item.topicId)}
                </p>
                <p>{item.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "sources":
      return null;
  }
}

export function App() {
  const [activeSection, setActiveSection] = useState<AppSectionId>("sources");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const { resetWorkspace, setWorkspace, workspace } = useWorkspace();

  const activeItem = navigationItems.find((item) => item.id === activeSection)!;
  const isSourcesSection = activeSection === "sources";

  function handleSaveSource(source: SourceRecord) {
    setWorkspace((currentWorkspace) => saveSourceRecord(currentWorkspace, source));
  }

  function handleOpenTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setActiveSection("topics");
  }

  function handleOpenSource(sourceId: string) {
    setSelectedSourceId(sourceId);
    setActiveSection("sources");
  }

  return (
    <div className="app-shell">
      <header className="hero panel">
        <div>
          <p className="eyebrow">Niche Research Digest</p>
          <h1>Local-first research workspace</h1>
          <p className="intro">
            A simple shell for collecting sources, grouping topics, tracking
            claims, and staging digest items. The app starts with demo data and
            persists the workspace in local storage.
          </p>
        </div>
        <div className="hero-actions">
          <div className="status-card">
            <span className="status-value">
              {workspace.sources.length +
                workspace.topics.length +
                workspace.claims.length +
                workspace.digestItems.length}
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
            onOpenTopic={handleOpenTopic}
            onSaveSource={handleSaveSource}
            onSelectSource={setSelectedSourceId}
          />
        ) : activeSection === "topics" ? (
          <TopicLibrarySection
            workspace={workspace}
            selectedTopicId={selectedTopicId}
            onOpenSource={handleOpenSource}
            onSelectTopic={setSelectedTopicId}
          />
        ) : (
          <>
            {renderSectionContent(activeSection, workspace)}

            <aside className="side-column">
              <section className="panel">
                <p className="panel-label">Current section</p>
                <h2>{activeItem.label}</h2>
                <p>{activeItem.description}</p>
                <p className="record-meta">
                  Last workspace update: {workspace.meta.lastUpdatedAt.slice(0, 10)}
                </p>
              </section>

              <EmptyState
                title="Capture and editing flows land next"
                description={`The ${activeItem.label.toLowerCase()} area is seeded with example records, but create, edit, and linking actions are still intentionally empty in this milestone.`}
              />
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
