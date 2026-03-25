import { createContext, useContext, useState, useEffect, useMemo } from "react";
import API from "../../services/api.service";
import { ROLE_PERMISSIONS } from "./permissions.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // ✅ LOGIN
  const login = async ({ username, password, role }) => {
    try {
      const res = await API.login(username, password, role);

      if (res?.user) {
        setUser(res.user);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
      }

      return res;
    } catch (err) {
      throw err;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await API.logout();
    } catch (err) {
      console.warn("Logout failed");
    } finally {
      localStorage.removeItem("auth_user");
      setUser(null);
    }
  };

  // 🔥 PERMISSION CHECKER
  const can = (permission) => {
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  };

  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    can
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};