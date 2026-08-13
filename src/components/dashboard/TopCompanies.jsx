import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collectionGroup, getDocs } from "firebase/firestore";
import { Building2 } from "lucide-react";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import { CHART_COLORS } from "../../lib/chartTheme";

export default function TopCompanies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collectionGroup(db, "applications"));
      const counts = {};

      snap.forEach((doc) => {
        const company = doc.data().companyName;
        if (company) counts[company] = (counts[company] || 0) + 1;
      });

      setData(
        Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
      setLoading(false);
    }
    load();
  }, []);

  const max = data[0]?.count || 1;

  return (
    <DashboardWidget title="Top companies" subtitle="Most applications received">
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
              <div key={item.name} className="signet-rank-row">
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
              </div>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
