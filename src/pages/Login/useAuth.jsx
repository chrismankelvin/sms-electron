


// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------


import { createContext, useContext, useState, useEffect } from "react";
import API from "../../services/api.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const currentUser = await API.checkSession();
      setUser(currentUser);
      setLoading(false);
    }
    fetchSession();
  }, []);

  const login = async ({ username, password, role = null }) => {
    const res = await API.login(username, password, role);
    if (res.user) setUser(res.user);
    return res;
  };

  const logout = async () => {
    await API.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};