import { COUNTRY_LOCATION_DATA } from "./location-registry";

export const MAX_JOB_LOCATIONS = 4;

export const COUNTRIES = [
  "Australia",
  "India",
  "New Zealand",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
];

export const LOCATION_PRESETS = [
  { label: "Adelaide, SA", country: "Australia", state: "SA", city: "Adelaide" },
  { label: "Sydney, NSW", country: "Australia", state: "NSW", city: "Sydney" },
  { label: "Melbourne, VIC", country: "Australia", state: "VIC", city: "Melbourne" },
  { label: "Mumbai, MH", country: "India", state: "MH", city: "Mumbai" },
  { label: "Bengaluru, KA", country: "India", state: "KA", city: "Bengaluru" },
  { label: "New Delhi", country: "India", state: "DL", city: "New Delhi" },
];

export function hasStructuredLocations(country) {
  return !!(country && COUNTRY_LOCATION_DATA[country]);
}

export function statesForCountry(country) {
  return COUNTRY_LOCATION_DATA[country]?.states || [];
}

export function defaultStateForCountry(country) {
  return COUNTRY_LOCATION_DATA[country]?.defaultState || "";
}

export function citiesForState(country, stateCode) {
  if (!country || !stateCode) return [];
  return COUNTRY_LOCATION_DATA[country]?.citiesByState?.[stateCode] || [];
}

/** @deprecated use citiesForState(country, stateCode) */
export function citySuggestions(stateCode) {
  return citiesForState("Australia", stateCode);
}

export function stateForCity(country, cityName) {
  const city = (cityName || "").trim();
  if (!city || !country) return "";
  const lower = city.toLowerCase();
  const map = COUNTRY_LOCATION_DATA[country]?.citiesByState || {};
  for (const [state, cities] of Object.entries(map)) {
    if (cities.some((c) => c.toLowerCase() === lower)) return state;
  }
  return "";
}

export function isKnownCity(country, stateCode, cityName) {
  const city = (cityName || "").trim();
  if (!city || !stateCode || !country) return false;
  return citiesForState(country, stateCode).some(
    (c) => c.toLowerCase() === city.toLowerCase()
  );
}

export function emptyJobLocation(overrides = {}) {
  return {
    country: "Australia",
    state: "SA",
    city: "Adelaide",
    customCity: false,
    ...overrides,
  };
}

export function locationKey(loc) {
  return [loc.country, loc.state, loc.city]
    .map((s) => (s || "").trim().toLowerCase())
    .join("|");
}

export function formatJobLocation(loc) {
  const city = (loc.city || "").trim();
  const state = (loc.state || "").trim();
  const country = (loc.country || "").trim() || "Australia";
  return [city, state, country].filter(Boolean).join(", ");
}

/** @deprecated use hasStructuredLocations */
export function isAustralia(country) {
  return (country || "").trim().toLowerCase() === "australia";
}

export function isDuplicateLocation(loc, all, skipIndex = -1) {
  if (!(loc.city || "").trim()) return false;
  const key = locationKey(loc);
  return all.some((r, i) => i !== skipIndex && locationKey(r) === key);
}

export function validateJobLocations(jobLocations) {
  const rows = (jobLocations || []).map((loc) => ({
    country: (loc.country || "").trim() || "Australia",
    state: (loc.state || "").trim(),
    city: (loc.city || "").trim(),
  }));

  const complete = rows.filter((loc) => loc.city);
  const pendingCustom = rows.some(
    (loc) => loc.customCity && !(loc.city || "").trim()
  );
  if (pendingCustom) {
    return { ok: false, error: "Enter the other city name for each custom location" };
  }
  if (complete.length === 0) {
    return { ok: false, error: "Enter a city name for each location" };
  }
  if (complete.length > MAX_JOB_LOCATIONS) {
    return { ok: false, error: `Maximum ${MAX_JOB_LOCATIONS} locations allowed` };
  }

  const seen = new Set();
  for (const loc of complete) {
    if (hasStructuredLocations(loc.country) && !loc.state) {
      return {
        ok: false,
        error: `Select a state / region for each ${loc.country} location`,
      };
    }
    const key = locationKey(loc);
    if (seen.has(key)) {
      return { ok: false, error: "Two locations cannot be the same" };
    }
    seen.add(key);
  }

  return { ok: true, locations: complete };
}

export function jobLocationFromRecord(job) {
  const country = job.country || "Australia";
  const state = job.state || "";
  const city = job.city || job.location?.split(",")[0]?.trim() || "";
  const known = city && state && isKnownCity(country, state, city);
  return emptyJobLocation({
    country,
    state,
    city,
    customCity: !!city && !known,
  });
}
