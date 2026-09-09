import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { toDate } from "./firestore";

export const SIGNET_JOB_LOGO = "/assets/images/logo/seh-icon.png";

export function isAdminJob(job) {
  return !!(job?.isSignetJob || job?.postedBy === "admin");
}

export function adminJobLabel(job) {
  if (isAdminJob(job)) return "Signet training role";
  return job?.companyName || "—";
}

function normalizeAdminJobInput(input) {
  return {
    postedBy: "admin",
    isSignetJob: true,
    hideCompany: true,
    companyId: "",
    companyName: "",
    logoUrl: input.logoUrl || SIGNET_JOB_LOGO,
    title: (input.title || "").trim(),
    salary: (input.salary || "Training placement").trim(),
    location: (input.location || "").trim(),
    street: input.street || "",
    city: input.city || "",
    state: input.state || "",
    postcode: input.postcode || "",
    country: input.country || "Australia",
    type: input.type || "Traineeship",
    priority: input.priority || "High",
    category: input.category || "Australian Workplace Training",
    currency: input.currency || "AUD",
    experience: input.experience || "Entry level",
    skills: input.skills || [],
    description: input.description || "",
    rolesAndResponsibilities: input.rolesAndResponsibilities || "",
    occupation: input.occupation || "",
    anzsco: input.anzsco || "",
    positionType:
      input.positionType || "Structured Workplace-Based Occupational Training",
    industry: input.industry || "",
    trainingArea: input.trainingArea || "",
    attachmentUrl: input.attachmentUrl || "",
    status: input.status || "Active",
  };
}

export async function createAdminJob(input) {
  const payload = {
    ...normalizeAdminJobInput(input),
    applicantsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "jobs"), payload);
  await updateDoc(ref, { jobId: ref.id });
  return ref.id;
}

export async function updateAdminJob(jobId, input) {
  const payload = {
    ...normalizeAdminJobInput(input),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "jobs", jobId), payload);
}

export async function fetchAdminJob(jobId) {
  const snap = await getDoc(doc(db, "jobs", jobId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

async function deleteSubcollection(pathSegments, max = 200) {
  const snap = await getDocs(query(collection(db, ...pathSegments), limit(max)));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function deleteAdminJob(jobId) {
  try {
    await deleteSubcollection(["jobs", jobId, "applications"]);
  } catch {
    /* ignore */
  }
  await deleteDoc(doc(db, "jobs", jobId));
}
