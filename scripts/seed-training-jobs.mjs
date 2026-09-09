import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { buildTrainingJobs } from "./training-jobs-data.mjs";

const firebaseConfig = {
  apiKey: "AIzaSyCvm70luWkiPWe46eErtkLZsQzf0sgQgpI",
  authDomain: "job-portal-app-72db3.firebaseapp.com",
  projectId: "job-portal-app-72db3",
  storageBucket: "job-portal-app-72db3.firebasestorage.app",
  messagingSenderId: "1028801677157",
  appId: "1:1028801677157:web:a9870032fc4791c3b0438c",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@signet.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Signet";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seedKeyExists(seedKey) {
  const q = query(collection(db, "jobs"), where("seedKey", "==", seedKey));
  const snap = await getDocs(q);
  return !snap.empty;
}

async function main() {
  console.log("Signing in as admin…");
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

  const jobs = buildTrainingJobs();
  let created = 0;
  let skipped = 0;

  for (const job of jobs) {
    if (await seedKeyExists(job.seedKey)) {
      console.log(`Skip (exists): ${job.seedKey}`);
      skipped += 1;
      continue;
    }

    const { seedKey, ...payload } = job;
    const ref = await addDoc(collection(db, "jobs"), {
      ...payload,
      seedKey,
      applicantsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(ref, { jobId: ref.id });
    console.log(`Created: ${job.title} — ${job.city} (${ref.id})`);
    created += 1;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}, total ${jobs.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
