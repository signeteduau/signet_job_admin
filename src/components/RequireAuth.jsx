import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";

export default function RequireAuth({ children }) {
  const { user, canAccessAdmin } = useAuth();

  useEffect(() => {
    if (user && !canAccessAdmin) {
      signOut(auth);
    }
  }, [user, canAccessAdmin]);

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--background))]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--purple))] border-t-transparent" />
      </div>
    );
  }

  if (!user || !canAccessAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
