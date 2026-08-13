import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // still checking user state?
  if (user === undefined) return null;

  // not logged in?
  if (!user) return <Navigate to="/" replace />;

  return children;
}
