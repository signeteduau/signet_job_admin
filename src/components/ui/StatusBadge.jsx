const STYLES = {
  active: "signet-badge signet-badge--success",
  complete: "signet-badge signet-badge--success",
  incomplete: "signet-badge signet-badge--warning",
  closed: "signet-badge signet-badge--neutral",
  review: "signet-badge signet-badge--info",
  interview: "signet-badge signet-badge--info",
  hired: "signet-badge signet-badge--success",
  rejected: "signet-badge signet-badge--danger",
  neutral: "signet-badge signet-badge--neutral",
};

export default function StatusBadge({ status }) {
  const value = status || "—";
  const key = String(value).toLowerCase().replace(/\s+/g, "");
  let variant = STYLES.neutral;

  if (key === "active" || key === "complete") variant = STYLES.active;
  else if (key === "incomplete") variant = STYLES.incomplete;
  else if (key === "closed") variant = STYLES.closed;
  else if (key.includes("review")) variant = STYLES.review;
  else if (key.includes("interview")) variant = STYLES.interview;
  else if (key === "hired") variant = STYLES.hired;
  else if (key === "rejected") variant = STYLES.rejected;

  return <span className={variant}>{value}</span>;
}
