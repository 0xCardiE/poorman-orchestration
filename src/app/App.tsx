import "./App.css";
import { navigationItems } from "../lib/navigation";

export function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Niche Research Digest</p>
        <h1>Research workspace scaffold</h1>
        <p className="intro">
          This minimal shell establishes the project structure for sources,
          topics, claims, and digests without implementing product flows yet.
        </p>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Planned sections</h2>
          <ul className="section-list">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Current status</h2>
          <p>
            The scaffold includes Vite, React, TypeScript, ESLint, Vitest, and
            the feature folder layout described in the project instructions.
          </p>
          <p>
            Later milestones can add models, persistence, and UI flows on top of
            this shell.
          </p>
        </section>
      </main>
    </div>
  );
}
