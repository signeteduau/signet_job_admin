import { useEffect, useState } from "react";
import { fetchUniqueApplications } from "../lib/firestore";
import DashboardWidget from "./ui/DashboardWidget";
import EmptyState from "./ui/EmptyState";
import StatusBadge from "./ui/StatusBadge";

export default function RecentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniqueApplications().then((all) => {
      setApps(all.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <DashboardWidget title="Recent applications" subtitle="Latest candidate submissions">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="signet-chart-skeleton h-20" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState title="No applications yet" description="New applications will show up here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div key={app.id} className="signet-app-card">
              <div className="signet-app-card-top">
                <div className="signet-avatar-fallback rounded-xl text-xs">
                  {(app.candidateName || "C").charAt(0).toUpperCase()}
                </div>
                <StatusBadge status={app.status || "Under Review"} />
              </div>
              <strong className="block truncate mt-3">{app.title || "Untitled role"}</strong>
              <p className="text-xs text-[rgb(var(--foreground)/55%)] mt-1 truncate">
                {app.companyName || "—"}
              </p>
              <p className="text-[11px] text-[rgb(var(--foreground)/45%)] mt-3">
                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }) : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
