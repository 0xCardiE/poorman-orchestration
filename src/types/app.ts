export type AppSectionId = "sources" | "topics" | "claims" | "digests";

export interface AppSection {
  id: AppSectionId;
  label: string;
  description: string;
}
