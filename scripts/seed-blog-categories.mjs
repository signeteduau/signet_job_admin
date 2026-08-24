import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvm70luWkiPWe46eErtkLZsQzf0sgQgpI",
  authDomain: "job-portal-app-72db3.firebaseapp.com",
  projectId: "job-portal-app-72db3",
  storageBucket: "job-portal-app-72db3.firebasestorage.app",
  messagingSenderId: "1028801677157",
  appId: "1:1028801677157:web:a9870032fc4791c3b0438c",
};

const CATEGORIES = [
  "Career Tips",
  "Interview Advice",
  "Resume & CV",
  "Job Search",
  "Workplace Skills",
  "Industry Insights",
  "Employer News",
];

const email = process.env.ADMIN_EMAIL || "admin@signet.com";
const password = process.env.ADMIN_PASSWORD || "Admin@Signet";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log("Signing in as admin…");
  await signInWithEmailAndPassword(auth, email, password);

  const snap = await getDocs(collection(db, "blogCategories"));
  const existing = new Set(
    snap.docs.map((d) => (d.data().name || "").trim().toLowerCase())
  );

  let added = 0;
  for (const name of CATEGORIES) {
    if (existing.has(name.toLowerCase())) {
      console.log(`Skip (exists): ${name}`);
      continue;
    }
    const ref = await addDoc(collection(db, "blogCategories"), {
      name,
      createdAt: serverTimestamp(),
    });
    console.log(`Added: ${name} (${ref.id})`);
    added += 1;
  }

  console.log(`\nDone. ${added} new categor${added === 1 ? "y" : "ies"} added.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
