interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="panel empty-state">
      <p className="panel-label">Not built yet</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
