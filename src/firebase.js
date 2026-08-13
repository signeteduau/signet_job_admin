import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Same Firebase project as Signet web app (jobi) + mobile app
const firebaseConfig = {
  apiKey: "AIzaSyCvm70luWkiPWe46eErtkLZsQzf0sgQgpI",
  authDomain: "job-portal-app-72db3.firebaseapp.com",
  projectId: "job-portal-app-72db3",
  storageBucket: "job-portal-app-72db3.firebasestorage.app",
  messagingSenderId: "1028801677157",
  appId: "1:1028801677157:web:a9870032fc4791c3b0438c",
  measurementId: "G-X0WTWEBKDQ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
