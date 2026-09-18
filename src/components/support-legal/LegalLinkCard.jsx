import { ExternalLink } from "lucide-react";

export default function LegalLinkCard({ icon: Icon, title, description, url }) {
  return (
    <section className="signet-panel signet-legal-link-card">
      <div className="signet-legal-link-copy">
        {Icon && (
          <div className="signet-settings-icon">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <p className="signet-preview-label">Published on the Signet website</p>
          <h2>{title}</h2>
          <p>{description}</p>
          <a href={url} target="_blank" rel="noreferrer" className="signet-legal-url">
            {url}
          </a>
        </div>
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="signet-btn">
        <ExternalLink size={15} /> Open on site
      </a>
    </section>
  );
}
