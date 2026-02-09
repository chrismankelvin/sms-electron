import { Navigate } from "react-router-dom";
import { useAuth } from "../pages/Login/useAuth.jsx";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}
