import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import { CHART_COLORS } from "../../lib/chartTheme";
import { fetchUniqueApplications } from "../../lib/firestore";

export default function MostAppliedJobs() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apps = await fetchUniqueApplications();
        const counts = {};

        apps.forEach((app) => {
          const title = app.title;
          if (!title) return;
          if (!counts[title]) counts[title] = { title, count: 0, jobId: app.jobId || "" };
          counts[title].count += 1;
          if (app.jobId) counts[title].jobId = app.jobId;
        });

        setData(
          Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );
      } catch (err) {
        console.error("MostAppliedJobs load failed:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const max = data[0]?.count || 1;

  return (
    <DashboardWidget title="Hot jobs" subtitle="Highest applicant volume" to="/admin/jobs">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="signet-chart-skeleton h-12" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No data yet" description="Job application stats will appear here." />
      ) : (
        <div className="space-y-4">
          {data.map((item, i) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <button
                key={item.title}
                type="button"
                className="signet-rank-row is-link"
                onClick={() => navigate(item.jobId ? `/admin/jobs/${item.jobId}` : "/admin/jobs")}
              >
                <span className={`signet-rank-badge ${i === 0 ? "is-gold" : ""}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <strong className="text-sm truncate flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[#10B981] shrink-0" />
                      {item.title}
                    </strong>
                    <span className="text-sm font-bold text-[#10B981] shrink-0">{item.count}</span>
                  </div>
                  <div className="signet-rank-bar">
                    <div
                      className="signet-rank-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${CHART_COLORS.green}, ${CHART_COLORS.cyan})`,
                      }}
                    />
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
