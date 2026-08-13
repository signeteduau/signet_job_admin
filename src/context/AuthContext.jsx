import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  // Generate Unique Session ID per browser/device
  const getSessionId = () => {
    return btoa(navigator.userAgent + navigator.platform).replace(/=/g, "");
  };

  const recordSession = async (user) => {
    if (!user) return;

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
      doc(db, "users", user.uid, "sessions", sessionId),
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
      setUser(currentUser);
      if (currentUser) await recordSession(currentUser);
    });

    return () => unsub();
  }, []);

  // ✅ Prevent blank screen during auth check
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
        <div className="animate-spin w-8 h-8 border-4 border-[rgb(var(--purple))] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
