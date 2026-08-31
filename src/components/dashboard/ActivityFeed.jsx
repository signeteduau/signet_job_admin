import { useEffect, useState } from "react";
import {
  enrichApplicationsWithCandidates,
  fetchUniqueApplications,
} from "../../lib/firestore";
import { Briefcase } from "lucide-react";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";

function timeAgo(date) {
  if (!date || Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const map = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];

  for (const [label, secs] of map) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "Just now";
}

function toFeedRows(apps) {
  return apps.map((app) => ({
    id: app.id,
    name: app.candidateName || "Candidate",
    job: app.title || "a role",
    company: app.companyName || "",
    time: timeAgo(app.appliedAt),
  }));
}

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const apps = (await fetchUniqueApplications()).slice(0, 8);
        const enriched = await enrichApplicationsWithCandidates(apps);
        if (!active) return;
        setFeed(toFeedRows(enriched));
        setError("");
      } catch (err) {
        console.error("ActivityFeed load failed:", err);
        if (active) {
          setFeed([]);
          setError("Could not load activity.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <DashboardWidget title="Live activity" subtitle="Real-time application stream">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="signet-chart-skeleton h-14" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState
          title={error || "No activity yet"}
          description={
            error
              ? "Check your connection and refresh the page."
              : "Applications will stream here live."
          }
        />
      ) : (
        <div className="signet-timeline">
          {feed.map((item) => (
            <div key={item.id} className="signet-timeline-item">
              <div className="signet-timeline-rail">
                <span className="signet-timeline-dot" />
              </div>
              <div className="signet-timeline-content">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed">
                      <strong>{item.name}</strong> applied to{" "}
                      <span className="text-[#004CF0] font-semibold">{item.job}</span>
                    </p>
                    {item.company && (
                      <p className="text-xs text-[rgb(var(--foreground)/50%)] mt-1 flex items-center gap-1">
                        <Briefcase size={12} />
                        {item.company}
                      </p>
                    )}
                  </div>
                  <span className="signet-timeline-time shrink-0">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
