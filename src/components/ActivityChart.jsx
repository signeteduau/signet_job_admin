import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SERIES, chartAxisStyle } from "../lib/chartTheme";
import { ChartTooltipContent } from "../components/charts/ChartTooltipContent";
import { toDate, dedupeApplicationDocs } from "../lib/firestore";

export default function ActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const users = await getDocs(collection(db, "users"));
      const jobs = await getDocs(collection(db, "jobs"));
      const apps = await getDocs(collectionGroup(db, "applications"));
      const uniqueApps = dedupeApplicationDocs(apps.docs);

      const toAppDate = (v) => toDate(v) || (typeof v === "string" ? new Date(v) : null);
      const arr = [];

      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);

        arr.push({
          day: start.toLocaleDateString("en-US", { weekday: "short" }),
          companies: users.docs.filter(
            (x) =>
              x.data().userType === "company" &&
              toDate(x.data().createdAt) >= start &&
              toDate(x.data().createdAt) <= end
          ).length,
          candidates: users.docs.filter(
            (x) =>
              x.data().userType === "candidate" &&
              toDate(x.data().createdAt) >= start &&
              toDate(x.data().createdAt) <= end
          ).length,
          jobs: jobs.docs.filter(
            (x) => toDate(x.data().createdAt) >= start && toDate(x.data().createdAt) <= end
          ).length,
          applications: uniqueApps.filter(
            ({ appliedAt, data }) => {
              const d = appliedAt || toAppDate(data.appliedAt);
              return d && d >= start && d <= end;
            }
          ).length,
        });
      }

      setData(arr);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="signet-chart-skeleton h-[320px]" />;
  }

  return (
    <div className="signet-chart-panel">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">Weekly activity</h3>
          <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-0.5">
            Registrations, jobs, and applications over the last 7 days
          </p>
        </div>
        <div className="signet-chart-legend">
          {Object.entries(SERIES).map(([key, cfg]) => (
            <span key={key} className="signet-chart-legend-item">
              <span className="signet-chart-legend-dot" style={{ background: cfg.stroke }} />
              <span className="capitalize">{key}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <defs>
              {Object.entries(SERIES).map(([key, cfg]) => (
                <linearGradient key={key} id={`grad${key.charAt(0).toUpperCase()}${key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.stroke} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={cfg.stroke} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgb(var(--foreground) / 0.08)" />
            <XAxis dataKey="day" {...chartAxisStyle()} dy={8} />
            <YAxis allowDecimals={false} {...chartAxisStyle()} dx={-4} />
            <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: "rgba(0,76,240,0.15)", strokeWidth: 1 }} />

            {Object.entries(SERIES).map(([key, cfg]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={cfg.stroke}
                fill={cfg.fill}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "rgb(var(--card))" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
