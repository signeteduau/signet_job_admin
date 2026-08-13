export const CHART_COLORS = {
  primary: "#004CF0",
  blue: "#2F6BFF",
  cyan: "#00B4D8",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#8B5CF6",
};

export const SERIES = {
  applications: { stroke: "#10B981", fill: "url(#gradApplications)" },
  candidates: { stroke: "#00B4D8", fill: "url(#gradCandidates)" },
  companies: { stroke: "#004CF0", fill: "url(#gradCompanies)" },
  jobs: { stroke: "#F59E0B", fill: "url(#gradJobs)" },
};

export const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.blue,
  CHART_COLORS.cyan,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
];

export function chartTooltipStyle() {
  return {
    background: "rgba(var(--card), 0.98)",
    border: "1px solid rgb(var(--card-border))",
    borderRadius: "14px",
    boxShadow: "0 16px 40px rgba(11, 18, 32, 0.12)",
    padding: "10px 12px",
    fontSize: "13px",
  };
}

export function chartAxisStyle() {
  return {
    stroke: "rgb(var(--foreground) / 0.25)",
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  };
}
