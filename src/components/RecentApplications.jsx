import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2, MapPin } from "lucide-react";
import { fetchUniqueApplications, enrichApplicationsWithCandidates } from "../lib/firestore";
import DashboardWidget from "./ui/DashboardWidget";
import EmptyState from "./ui/EmptyState";
import StatusBadge from "./ui/StatusBadge";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || "C").slice(0, 1).toUpperCase();
}

function timeAgo(date) {
  if (!date || Number.isNaN(new Date(date).getTime())) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function isPresent(value) {
  return Boolean(value && value !== "—");
}

export default function RecentApplications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchUniqueApplications();
        const enriched = await enrichApplicationsWithCandidates(all);
        setApps(enriched.slice(0, 6));
      } catch (err) {
        console.error("RecentApplications load failed:", err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardWidget
      title="Recent applications"
      subtitle="Latest candidate submissions"
      to={loading ? undefined : "/admin/applications"}
    >
      {loading ? (
        <div className="signet-widget-loader" role="status" aria-live="polite">
          <Loader2 size={22} className="animate-spin" />
          <p>Loading applications…</p>
        </div>
      ) : apps.length === 0 ? (
        <EmptyState title="No applications yet" description="New applications will show up here." />
      ) : (
        <div className="signet-app-list">
          {apps.map((app) => {
            const name = app.candidateName || "Candidate";
            const when = timeAgo(app.appliedAt);
            return (
              <button
                key={app.id}
                type="button"
                className="signet-app-card is-link"
                onClick={() => {
                  if (app.userId) navigate(`/admin/candidates/${app.userId}`);
                  else if (app.jobId) navigate(`/admin/jobs/${app.jobId}`);
                  else navigate("/admin/applications");
                }}
              >
                {app.logoUrl ? (
                  <img src={app.logoUrl} alt="" className="signet-app-card-avatar" />
                ) : (
                  <span className="signet-app-card-avatar is-fallback">{initials(name)}</span>
                )}
                <div className="signet-app-card-body">
                  <div className="signet-app-card-top">
                    <strong className="signet-app-card-name">{name}</strong>
                    <StatusBadge status={app.status || "Under Review"} />
                  </div>
                  <p className="signet-app-card-role">{app.title || "Untitled role"}</p>
                  <div className="signet-app-card-meta">
                    {isPresent(app.companyName) ? (
                      <span>
                        <Briefcase size={12} />
                        {app.companyName}
                      </span>
                    ) : null}
                    {isPresent(app.location) ? (
                      <span>
                        <MapPin size={12} />
                        {app.location}
                      </span>
                    ) : null}
                    {isPresent(app.type) ? <span>{app.type}</span> : null}
                    {when ? <em>{when}</em> : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
