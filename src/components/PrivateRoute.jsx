import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/Login/useAuth.jsx";

export default function PrivateRoute({ children, roles, permissions }) {
  const { user, loading, can } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loader">Loading...</div>;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ✅ Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔥 Permission check
  if (permissions) {
    const hasPermission = permissions.every(p => can(p));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}