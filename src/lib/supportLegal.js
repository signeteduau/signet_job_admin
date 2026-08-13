export const FAQ_TYPES = [
  { value: "general", label: "General", description: "Shown to all users" },
  { value: "candidate", label: "Candidate", description: "Job seeker help center" },
  { value: "company", label: "Company", description: "Employer help center" },
];

export const LEGAL_AUDIENCES = [
  { value: "general", label: "General", description: "All Signet users" },
  { value: "candidate", label: "Candidates", description: "Candidate-facing pages" },
  { value: "company", label: "Companies", description: "Employer-facing pages" },
];

export const TYPE_LABELS = Object.fromEntries(FAQ_TYPES.map((t) => [t.value, t.label]));

export function isHtmlEmpty(html) {
  if (!html) return true;
  const stripped = html
    .replace(/<p><br><\/p>/gi, "")
    .replace(/<p>&nbsp;<\/p>/gi, "")
    .replace(/&nbsp;/g, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
  return stripped === "";
}

export function htmlPreview(html, maxLength = 140) {
  if (!html) return "No answer yet";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "No answer yet";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function formatSupportDate(value) {
  if (!value) return "—";
  const d = typeof value?.toDate === "function" ? value.toDate() : value instanceof Date ? value : null;
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}
