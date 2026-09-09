import {
  emptyJobLocation,
  formatJobLocation,
  validateJobLocations,
  MAX_JOB_LOCATIONS,
} from "./location-data";

export { LOCATION_PRESETS, MAX_JOB_LOCATIONS, validateJobLocations } from "./location-data";

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

export function buildJobPayload(form, locationEntry) {
  const loc = locationEntry || form.jobLocations?.[0] || emptyJobLocation();
  const city = (loc.city || "").trim();
  const state = (loc.state || "").trim();
  const country = (loc.country || "").trim() || "Australia";

  return {
    title: form.title.trim(),
    occupation: form.occupation.trim(),
    anzsco: form.anzsco.trim(),
    industry: form.industry.trim(),
    trainingArea: form.trainingArea.trim(),
    location: formatJobLocation({ city, state, country }),
    city,
    state,
    country,
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

/** One Firestore job per location row (same content, different city). */
export function buildJobPayloads(form) {
  const validation = validateJobLocations(form.jobLocations);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  return validation.locations.map((loc) => buildJobPayload(form, loc));
}

export const EMPTY_JOB_FORM = {
  title: "",
  occupation: "",
  anzsco: "",
  industry: "",
  trainingArea: "",
  jobLocations: [emptyJobLocation()],
  type: "Traineeship",
  salary: "Training placement",
  experience: "Entry level",
  skillsText: "",
  description: "",
  roles: "",
  status: "Active",
};
