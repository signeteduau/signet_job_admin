import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

async function safeSubcollectionDocs(...pathSegments) {
  try {
    const snap = await getDocs(collection(db, ...pathSegments));
    return snap.docs;
  } catch (err) {
    console.warn("Firestore subcollection read failed:", pathSegments.join("/"), err);
    return [];
  }
}

/** Read applications without collectionGroup (works without a Firestore index). */
export async function fetchApplicationDocs() {
  const [jobsSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, "jobs")),
    getDocs(collection(db, "users")),
  ]);

  const jobAppLists = await Promise.all(
    jobsSnap.docs.map((jobDoc) =>
      safeSubcollectionDocs("jobs", jobDoc.id, "applications")
    )
  );

  const candidateIds = usersSnap.docs
    .filter((d) => d.data().userType === "candidate")
    .map((d) => d.id);

  const userAppLists = await Promise.all(
    candidateIds.map((uid) =>
      safeSubcollectionDocs("applications", uid, "userApplications")
    )
  );

  return [...jobAppLists.flat(), ...userAppLists.flat()];
}

export async function fetchAllJobs() {
  const snap = await getDocs(collection(db, "jobs"));
  return snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function fetchJobById(id) {
  const snap = await getDoc(doc(db, "jobs", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function applicationDedupeKey(data, docId = "") {
  return `${data.jobId || ""}_${data.userId || docId}`;
}

/** Collapse triple-written application docs (user / job / company paths). */
export function dedupeApplicationDocs(docs) {
  const byKey = new Map();

  for (const d of docs) {
    const data = d.data();
    const key = applicationDedupeKey(data, d.id);
    const appliedAt = toDate(data.appliedAt);
    const existing = byKey.get(key);

    if (!existing || (appliedAt && (!existing.appliedAt || appliedAt > existing.appliedAt))) {
      byKey.set(key, { doc: d, data, key, appliedAt });
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => (b.appliedAt || 0) - (a.appliedAt || 0)
  );
}

export async function fetchUniqueApplications() {
  const docs = await fetchApplicationDocs();
  return dedupeApplicationDocs(docs).map(({ key, data, appliedAt }) => ({
    id: key,
    ...data,
    appliedAt,
  }));
}

export async function fetchUsersByType(userType) {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .filter((d) => d.data().userType === userType)
    .map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function enrichApplicationsWithCandidates(applications) {
  const cache = new Map();
  const enriched = [];

  for (const app of applications) {
    let candidateName = app.candidateName || "";
    if (!candidateName && app.userId) {
      if (!cache.has(app.userId)) {
        const snap = await getDoc(doc(db, "users", app.userId));
        cache.set(
          app.userId,
          snap.exists() ? snap.data().fullName || snap.data().email || "Unknown" : "Unknown"
        );
      }
      candidateName = cache.get(app.userId);
    }
    enriched.push({ ...app, candidateName });
  }

  return enriched;
}
