import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import { CHART_COLORS } from "../../lib/chartTheme";
import { fetchUniqueApplications } from "../../lib/firestore";

export default function MostAppliedJobs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apps = await fetchUniqueApplications();
        const counts = {};

        apps.forEach((app) => {
          const title = app.title;
          if (title) counts[title] = (counts[title] || 0) + 1;
        });

        setData(
          Object.entries(counts)
            .map(([title, count]) => ({ title, count }))
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
    <DashboardWidget title="Hot jobs" subtitle="Highest applicant volume">
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
              <div key={item.title} className="signet-rank-row">
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
              </div>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
