export function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="signet-chart-tooltip">
      <p className="signet-chart-tooltip-label">{label}</p>
      <div className="space-y-1.5 mt-2">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: entry.color || entry.payload?.fill }}
              />
              <span className="capitalize text-[rgb(var(--foreground)/70%)]">
                {entry.name || entry.dataKey}
              </span>
            </span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
