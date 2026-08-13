export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="signet-page-head flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {eyebrow && <p className="signet-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
