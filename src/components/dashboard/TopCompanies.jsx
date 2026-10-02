import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import { CHART_COLORS } from "../../lib/chartTheme";
import { fetchUniqueApplications } from "../../lib/firestore";

export default function TopCompanies() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apps = await fetchUniqueApplications();
        const counts = {};

        apps.forEach((app) => {
          const name = app.companyName;
          if (!name) return;
          if (!counts[name]) counts[name] = { name, count: 0, companyId: app.companyId || "" };
          counts[name].count += 1;
          if (app.companyId) counts[name].companyId = app.companyId;
        });

        setData(
          Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        );
      } catch (err) {
        console.error("TopCompanies load failed:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const max = data[0]?.count || 1;

  return (
    <DashboardWidget title="Top companies" subtitle="Most applications received" to="/admin/companies">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="signet-chart-skeleton h-12" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No data yet" description="Applications will appear here." />
      ) : (
        <div className="space-y-4">
          {data.map((item, i) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <button
                key={item.name}
                type="button"
                className="signet-rank-row is-link"
                onClick={() =>
                  navigate(item.companyId ? `/admin/companies/${item.companyId}` : "/admin/companies")
                }
              >
                <span className={`signet-rank-badge ${i === 0 ? "is-gold" : ""}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <strong className="text-sm truncate flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#004CF0] shrink-0" />
                      {item.name}
                    </strong>
                    <span className="text-sm font-bold text-[#004CF0] shrink-0">{item.count}</span>
                  </div>
                  <div className="signet-rank-bar">
                    <div
                      className="signet-rank-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${CHART_COLORS.primary}, ${CHART_COLORS.blue})`,
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
