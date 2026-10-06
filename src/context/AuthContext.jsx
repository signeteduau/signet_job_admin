import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { isManagementEmail } from "../lib/managementAccess";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);

  const getSessionId = () => {
    return btoa(navigator.userAgent + navigator.platform).replace(/=/g, "");
  };

  const recordSession = async (currentUser) => {
    if (!currentUser) return;

    const sessionId = getSessionId();
    let locationData = {};
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        locationData = {
          ip: data.ip || "",
          city: data.city || "",
          region: data.region || "",
          country: data.country_name || "",
          org: data.org || "",
        };
      }
    } catch (err) {
      console.warn("Location lookup failed:", err);
    }

    await setDoc(
      doc(db, "users", currentUser.uid, "sessions", sessionId),
      {
        sessionId,
        userAgent: navigator.userAgent,
        device: navigator.platform,
        loginAt: serverTimestamp(),
        ...locationData,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setProfile(null);
        setUser(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } catch {
        setProfile(null);
      }

      setUser(currentUser);
      recordSession(currentUser);
    });

    return () => unsub();
  }, []);

  const value = useMemo(() => {
    const isViewer = isManagementEmail(user?.email);
    const canWrite = Boolean(user) && !isViewer;
    const canAccessAdmin = Boolean(user) && (isViewer || profile?.userType === "admin");
    return { user, profile, isViewer, canWrite, canAccessAdmin };
  }, [user, profile]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
        <div className="animate-spin w-8 h-8 border-4 border-[rgb(var(--purple))] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
