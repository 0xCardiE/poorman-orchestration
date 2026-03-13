import type { AppSection } from "../types/app";

export const navigationItems: AppSection[] = [
  {
    id: "sources",
    label: "Sources",
    description: "Capture articles, papers, notes, and publisher metadata.",
  },
  {
    id: "topics",
    label: "Topics",
    description: "Group related research and keep tags organized by subject.",
  },
  {
    id: "claims",
    label: "Claims",
    description: "Track support, contradiction, and neutral relationships.",
  },
  {
    id: "digests",
    label: "Digests",
    description: "Summarize recent additions and unresolved questions.",
  },
];
