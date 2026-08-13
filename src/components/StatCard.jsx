import { useEffect, useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export default function StatCard({ label, value, previous = 0, trend = [], color, icon: Icon }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const increment = Math.max(end / 30, 1);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  const weekCount = previous || 0;
  const pct = value > 0 ? Math.round((weekCount / value) * 100) : 0;

  return (
    <div className="signet-stat-card-v2">
      <div
        className="signet-stat-card-v2-accent"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <p className="signet-stat-card-v2-label">{label}</p>
          <h2 className="signet-stat-card-v2-value">{displayValue.toLocaleString()}</h2>
          <p className="signet-stat-card-v2-meta">
            <TrendingUp size={13} />
            {weekCount} this week
            {value > 0 && <span className="opacity-70"> · {pct}% of total</span>}
          </p>
        </div>

        {Icon && (
          <div className="signet-stat-card-v2-icon" style={{ color, background: `${color}14` }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="signet-stat-card-v2-chart px-2 pb-3">
        <ResponsiveContainer width="100%" height={56}>
          <AreaChart data={trend.length ? trend : [{ value: 0 }]}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#spark-${label})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {weekCount > 0 && (
        <div className="signet-stat-card-v2-footer">
          <span className="signet-stat-card-v2-delta">
            <ArrowUpRight size={12} />
            +{weekCount} new
          </span>
        </div>
      )}
    </div>
  );
}
