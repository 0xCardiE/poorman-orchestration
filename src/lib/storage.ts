import { createDemoWorkspaceData } from "./demoData";
import type { WorkspaceData } from "../types/workspace";

export const WORKSPACE_STORAGE_KEY = "niche-research-digest.workspace";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isWorkspaceData(value: unknown): value is WorkspaceData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkspaceData>;

  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.sources) &&
    Array.isArray(candidate.topics) &&
    Array.isArray(candidate.claims) &&
    Array.isArray(candidate.digestItems) &&
    typeof candidate.meta === "object" &&
    candidate.meta !== null
  );
}

export function loadWorkspaceData(): WorkspaceData {
  const demoData = createDemoWorkspaceData();

  if (!canUseLocalStorage()) {
    return demoData;
  }

  const savedValue = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

  if (!savedValue) {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(demoData));
    return demoData;
  }

  try {
    const parsedValue = JSON.parse(savedValue) as unknown;

    if (isWorkspaceData(parsedValue)) {
      return parsedValue;
    }
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(demoData));
  return demoData;
}

export function saveWorkspaceData(workspace: WorkspaceData) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}

export function resetWorkspaceData() {
  const demoData = createDemoWorkspaceData();
  saveWorkspaceData(demoData);

  return demoData;
}
