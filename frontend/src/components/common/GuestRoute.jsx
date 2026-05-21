import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Prevent redirect flicker while auth is loading
  if (loading) return null;

  // If authenticated, redirect away from guest-only pages
  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
