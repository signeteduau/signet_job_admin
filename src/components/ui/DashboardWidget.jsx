export default function DashboardWidget({ title, subtitle, children, action }) {
  return (
    <div className="signet-widget">
      <div className="signet-widget-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="signet-widget-body">{children}</div>
    </div>
  );
}
