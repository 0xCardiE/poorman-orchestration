import { useEffect, useState } from "react";
import {
  loadWorkspaceData,
  resetWorkspaceData,
  saveWorkspaceData,
} from "../lib/storage";
import type { WorkspaceData } from "../types/workspace";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => loadWorkspaceData());

  useEffect(() => {
    saveWorkspaceData(workspace);
  }, [workspace]);

  return {
    workspace,
    setWorkspace,
    resetWorkspace: () => setWorkspace(resetWorkspaceData()),
  };
}
