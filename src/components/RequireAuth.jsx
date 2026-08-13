import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--background))]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--purple))] border-t-transparent" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
