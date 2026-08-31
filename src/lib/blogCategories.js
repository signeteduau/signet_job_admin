import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function firestoreErrorMessage(err, fallback) {
  const code = err?.code || "";
  if (code === "permission-denied") {
    return "Permission denied. Sign in as an admin or update Firestore rules for blogCategories.";
  }
  return fallback;
}

export async function fetchBlogCategories() {
  const snap = await getDocs(collection(db, "blogCategories"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export async function createBlogCategory(name) {
  const ref = await addDoc(collection(db, "blogCategories"), {
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, name: name.trim() };
}

export async function updateBlogCategory(id, name) {
  await updateDoc(doc(db, "blogCategories", id), { name: name.trim() });
}

export async function deleteBlogCategory(id) {
  await deleteDoc(doc(db, "blogCategories", id));
}

export { firestoreErrorMessage };
