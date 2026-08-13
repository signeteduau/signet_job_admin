export default function EmptyState({ title = "No results found", description }) {
  return (
    <div className="signet-empty">
      <div className="signet-empty-icon">∅</div>
      <p className="signet-empty-title">{title}</p>
      {description && <p className="signet-empty-desc">{description}</p>}
    </div>
  );
}
