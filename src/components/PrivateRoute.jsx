// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../pages/Login/useAuth";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  // Normalize allowedRoles for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  const userRole = user.role?.toLowerCase();

  // Check if user has required role
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    console.log(`Access denied. User role: ${userRole}, Required roles: ${normalizedAllowedRoles.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;