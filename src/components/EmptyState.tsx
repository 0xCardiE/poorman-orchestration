interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="panel empty-state">
      <p className="panel-label">Workspace status</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
