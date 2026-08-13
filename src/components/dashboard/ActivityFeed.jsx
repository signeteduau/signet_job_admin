import { useEffect, useState } from "react";
import { collectionGroup, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase";
import {
  dedupeApplicationDocs,
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

async function loadFromDocs(docs) {
  const apps = dedupeApplicationDocs(docs)
    .slice(0, 8)
    .map(({ key, data, appliedAt }) => ({
      id: key,
      ...data,
      appliedAt,
    }));
  const enriched = await enrichApplicationsWithCandidates(apps);
  return toFeedRows(enriched);
}

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFallback() {
      try {
        const apps = (await fetchUniqueApplications()).slice(0, 8);
        const enriched = await enrichApplicationsWithCandidates(apps);
        if (!active) return;
        setFeed(toFeedRows(enriched));
        setError("");
      } catch (err) {
        console.error("ActivityFeed fallback failed:", err);
        if (active) {
          setFeed([]);
          setError("Could not load activity.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const q = query(collectionGroup(db, "applications"));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const rows = await loadFromDocs(snap.docs);
          if (!active) return;
          setFeed(rows);
          setError("");
          setLoading(false);
        } catch (err) {
          console.error("ActivityFeed snapshot processing failed:", err);
          if (active) loadFallback();
        }
      },
      (err) => {
        console.error("ActivityFeed snapshot error:", err);
        if (active) loadFallback();
      }
    );

    return () => {
      active = false;
      unsub();
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
