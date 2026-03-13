import { navigationItems } from "../lib/navigation";
import { getSectionCount } from "../lib/workspace";
import type { AppSectionId } from "../types/app";
import type { WorkspaceData } from "../types/workspace";

interface SectionNavigationProps {
  activeSection: AppSectionId;
  onSelect: (sectionId: AppSectionId) => void;
  workspace: WorkspaceData;
}

export function SectionNavigation({
  activeSection,
  onSelect,
  workspace,
}: SectionNavigationProps) {
  return (
    <nav className="section-nav" aria-label="Primary">
      {navigationItems.map((item) => {
        const isActive = item.id === activeSection;

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? "nav-item active" : "nav-item"}
            onClick={() => onSelect(item.id)}
          >
            <span className="nav-item-label">{item.label}</span>
            <span className="nav-item-description">{item.description}</span>
            <span className="nav-item-count">
              {getSectionCount(workspace, item.id)} items
            </span>
          </button>
        );
      })}
    </nav>
  );
}
