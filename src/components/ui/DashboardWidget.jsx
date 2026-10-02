import { Link } from "react-router-dom";

export default function DashboardWidget({ title, subtitle, children, action, to, actionLabel = "View all" }) {
  return (
    <div className="signet-widget">
      <div className="signet-widget-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action ||
          (to ? (
            <Link to={to} className="signet-widget-link">
              {actionLabel}
            </Link>
          ) : null)}
      </div>
      <div className="signet-widget-body">{children}</div>
    </div>
  );
}
