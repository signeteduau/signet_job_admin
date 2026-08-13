import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import { PIE_COLORS } from "../../lib/chartTheme";
import { ChartTooltipContent } from "../charts/ChartTooltipContent";

export default function JobTypeChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTypes() {
      const snap = await getDocs(collection(db, "jobs"));
      const typeCount = {};

      snap.forEach((doc) => {
        const type = doc.data().type?.trim() || "Other";
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      setData(
        Object.entries(typeCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );
      setLoading(false);
    }

    loadTypes();
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <DashboardWidget title="Jobs by type" subtitle="Distribution of active listings">
      {loading ? (
        <div className="signet-chart-skeleton h-[280px]" />
      ) : data.length === 0 ? (
        <EmptyState title="No jobs yet" description="Job type breakdown will appear here." />
      ) : (
        <>
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="signet-donut-center">
              <strong>{total}</strong>
              <span>Total jobs</span>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {data.map((item, i) => {
              const pct = total ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="signet-chart-legend-row">
                  <span
                    className="signet-chart-legend-dot shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-semibold truncate">{item.name}</span>
                      <span className="text-[rgb(var(--foreground)/55%)] shrink-0">
                        {item.value} · {pct}%
                      </span>
                    </div>
                    <div className="signet-rank-bar mt-1.5">
                      <div
                        className="signet-rank-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardWidget>
  );
}
