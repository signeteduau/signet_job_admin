import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const REVIEW_KINDS = [
  { value: "Candidate", label: "Candidate" },
  { value: "Employer", label: "Employer" },
];

export const REVIEW_ACCENTS = [
  { value: "#2550eb", label: "Signet blue" },
  { value: "#ff7555", label: "Coral" },
  { value: "#0ea5a4", label: "Teal" },
  { value: "#7c5cfc", label: "Violet" },
  { value: "#e11d74", label: "Magenta" },
];

export const EMPTY_REVIEW = {
  quote: "",
  name: "",
  title: "",
  place: "",
  kind: "Candidate",
  accent: "#2550eb",
  rating: 5,
  order: 1,
  published: true,
};

export const WEBSITE_REVIEWS = [
  {
    quote:
      "I applied to three roles on a Sunday night and had an interview booked by Tuesday. Signet made the whole process feel simple — profile, apply, chat, done.",
    name: "Priya Sharma",
    title: "Registered Nurse",
    place: "Melbourne",
    kind: "Candidate",
    accent: "#2550eb",
    rating: 5,
  },
  {
    quote:
      "We posted a site supervisor role and shortlisted strong candidates in days, not weeks. The in-app chat saved us from a messy email trail.",
    name: "James O’Connor",
    title: "Hiring Manager",
    place: "Brisbane",
    kind: "Employer",
    accent: "#ff7555",
    rating: 4,
  },
  {
    quote:
      "Clear job details, real companies, and I could track every application. It felt built for people actually looking for work — not just browsing ads.",
    name: "Aisha Khan",
    title: "Business Administrator",
    place: "Sydney",
    kind: "Candidate",
    accent: "#0ea5a4",
    rating: 5,
  },
  {
    quote:
      "Finding qualified trade talent used to take forever. Signet brought us applicants who already had the right tickets and experience.",
    name: "Daniel Reeves",
    title: "Workshop Supervisor",
    place: "Perth",
    kind: "Employer",
    accent: "#7c5cfc",
    rating: 5,
  },
  {
    quote:
      "The career tips and job alerts kept me moving. I landed a community support role that actually matched what I wanted to do.",
    name: "Mei Lin",
    title: "Community Support Worker",
    place: "Adelaide",
    kind: "Candidate",
    accent: "#e11d74",
    rating: 5,
  },
];

const REVIEW_DOC = () => doc(db, "legal", "homepageReviews");

export function reviewInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "S";
}

export function clampRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export function normalizeReview(id, data = {}) {
  const kind = data.kind === "Employer" ? "Employer" : "Candidate";
  return {
    id,
    quote: String(data.quote || "").trim(),
    name: String(data.name || "").trim(),
    title: String(data.title || "").trim(),
    place: String(data.place || "").trim(),
    kind,
    accent: data.accent || "#2550eb",
    rating: clampRating(data.rating),
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
    published: data.published !== false,
  };
}

export function reviewPayload(form, id) {
  return {
    id,
    quote: String(form.quote || "").trim(),
    name: String(form.name || "").trim(),
    title: String(form.title || "").trim(),
    place: String(form.place || "").trim(),
    kind: form.kind === "Employer" ? "Employer" : "Candidate",
    accent: form.accent || "#2550eb",
    rating: clampRating(form.rating),
    order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
    published: form.published !== false,
  };
}

export function validateReview(form) {
  const errors = {};
  if (!String(form.name || "").trim()) errors.name = "Name is required";
  if (!String(form.title || "").trim()) errors.title = "Role is required";
  if (!String(form.place || "").trim()) errors.place = "Location is required";
  if (!String(form.quote || "").trim()) errors.quote = "Review text is required";
  return errors;
}

export function averageRating(reviews = []) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, item) => sum + clampRating(item.rating), 0);
  return Number((total / reviews.length).toFixed(1));
}

function sortReviews(items) {
  return [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.name).localeCompare(String(b.name));
  });
}

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readStore() {
  const snap = await getDoc(REVIEW_DOC());
  const items = snap.exists() && Array.isArray(snap.data().items) ? snap.data().items : [];
  return sortReviews(items.map((item) => normalizeReview(item.id || makeId(), item)));
}

async function writeStore(items) {
  await setDoc(
    REVIEW_DOC(),
    {
      items: sortReviews(items).map((item) => reviewPayload(item, item.id)),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchReviews() {
  return readStore();
}

export async function fetchReview(id) {
  const items = await readStore();
  return items.find((item) => item.id === id) || null;
}

export async function createReview(form) {
  const items = await readStore();
  const id = makeId();
  await writeStore([...items, { ...reviewPayload(form, id), id }]);
  return id;
}

export async function updateReview(id, form) {
  const items = await readStore();
  if (!items.some((item) => item.id === id)) {
    throw new Error("Review not found");
  }
  await writeStore(items.map((item) => (item.id === id ? { ...reviewPayload(form, id), id } : item)));
}

export async function removeReview(id) {
  const items = await readStore();
  await writeStore(items.filter((item) => item.id !== id));
}

export async function importWebsiteReviews() {
  const existing = await readStore();
  if (existing.length) return existing;

  const imported = WEBSITE_REVIEWS.map((review, index) => ({
    ...review,
    id: makeId(),
    order: index + 1,
    published: true,
  }));
  await writeStore(imported);
  return imported;
}
