export const JOB_LOCATIONS = [
  { label: "Adelaide, SA", city: "Adelaide", state: "SA" },
  { label: "Sydney, NSW", city: "Sydney", state: "NSW" },
  { label: "Melbourne, VIC", city: "Melbourne", state: "VIC" },
];

export const JOB_TYPES = [
  "Traineeship",
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
];

export const PUBLIC_JOBS_BASE = "https://signetemploymenthub.com/jobs";

export function fmtJobDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : value?.toDate?.();
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export function cityLabel(location) {
  if (!location) return "—";
  return location.split(",")[0]?.trim() || location;
}

export function buildJobPayload(form) {
  const loc =
    JOB_LOCATIONS.find((l) => l.label === form.locationKey) || JOB_LOCATIONS[0];

  return {
    title: form.title.trim(),
    occupation: form.occupation.trim(),
    anzsco: form.anzsco.trim(),
    industry: form.industry.trim(),
    trainingArea: form.trainingArea.trim(),
    location: `${loc.city}, ${loc.state}, Australia`,
    city: loc.city,
    state: loc.state,
    country: "Australia",
    type: form.type,
    salary: form.salary.trim(),
    experience: form.experience.trim(),
    skills: form.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    description: form.description,
    rolesAndResponsibilities: form.roles,
    category: "Australian Workplace Training",
    ...(form.status ? { status: form.status } : {}),
  };
}

export const EMPTY_JOB_FORM = {
  title: "",
  occupation: "",
  anzsco: "",
  industry: "",
  trainingArea: "",
  locationKey: "Adelaide, SA",
  type: "Traineeship",
  salary: "Training placement",
  experience: "Entry level",
  skillsText: "",
  description: "",
  roles: "",
  status: "Active",
};
