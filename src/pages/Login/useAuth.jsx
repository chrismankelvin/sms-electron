// // import { createContext, useContext, useState, useEffect, useMemo } from "react";
// // import API from "../../services/api.service";
// // import { ROLE_PERMISSIONS } from "./permissions.js";

// // const AuthContext = createContext(null);

// // export function AuthProvider({ children }) {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // ✅ Restore session on refresh
// //   useEffect(() => {
// //     const storedUser = localStorage.getItem("auth_user");

// //     if (storedUser) {
// //       setUser(JSON.parse(storedUser));
// //     }

// //     setLoading(false);
// //   }, []);

// //   // ✅ LOGIN
// //   const login = async ({ username, password, role }) => {
// //     try {
// //       const res = await API.login(username, password, role);

// //       if (res?.user) {
// //         setUser(res.user);
// //         localStorage.setItem("auth_user", JSON.stringify(res.user));
// //       }

// //       return res;
// //     } catch (err) {
// //       throw err;
// //     }
// //   };

// //   // ✅ LOGOUT
// //   const logout = async () => {
// //     try {
// //       await API.logout();
// //     } catch (err) {
// //       console.warn("Logout failed");
// //     } finally {
// //       localStorage.removeItem("auth_user");
// //       setUser(null);
// //     }
// //   };

// //   // 🔥 PERMISSION CHECKER
// //   const can = (permission) => {
// //     if (!user) return false;

// //     const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
// //     return rolePermissions.includes(permission);
// //   };

// //   const isAuthenticated = !!user;

// //   const value = useMemo(() => ({
// //     user,
// //     login,
// //     logout,
// //     loading,
// //     isAuthenticated,
// //     can
// //   }), [user, loading]);

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) throw new Error("useAuth must be used within AuthProvider");
// //   return context;
// // };







// // src/pages/Login/useAuth.jsx
// import { createContext, useContext, useState, useEffect, useMemo } from "react";
// import API from "../../services/api.service";

// const AuthContext = createContext(null);

// // Normalize role to lowercase for consistent comparison
// const normalizeRole = (role) => {
//   if (!role) return null;
//   const roleLower = role.toLowerCase();
  
//   // Map common role variations
//   const roleMap = {
//     'admin': 'administrator',
//     'administrator': 'administrator',
//     'teacher': 'teacher',
//     'student': 'student',
//     'teaching_assistant': 'teaching_assistant',
//     'teaching assistant': 'teaching_assistant',
//     'non_teaching_staff': 'non_teaching_staff',
//     'non_staff': 'non_teaching_staff',
//     'non teaching staff': 'non_teaching_staff',
//     'accountant': 'accountant',
//     'accounts': 'accountant',  
//   };
  
//   return roleMap[roleLower] || roleLower;
// };

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Restore session on refresh
//   useEffect(() => {
//     const storedUser = localStorage.getItem("auth_user");

//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         // Normalize role when restoring
//         if (parsedUser.role) {
//           parsedUser.original_role = parsedUser.role;
//           parsedUser.role = normalizeRole(parsedUser.role);
//         }
//         setUser(parsedUser);
//         console.log('✅ Restored user session:', parsedUser.role, '(original:', parsedUser.original_role, ')');
//       } catch (err) {
//         console.error('Failed to parse stored user:', err);
//         localStorage.removeItem("auth_user");
//       }
//     }

//     setLoading(false);
//   }, []);

//   // LOGIN
//   const login = async ({ username, password, role }) => {
//     try {
//       const res = await API.login(username, password, role);

//       if (res?.user) {
//         // Normalize role from backend
//         const originalRole = res.user.role;
//         const normalizedRole = normalizeRole(originalRole);
        
//         const normalizedUser = {
//           ...res.user,
//           original_role: originalRole,
//           role: normalizedRole
//         };
        
//         console.log('✅ Login successful, user role:', normalizedRole, '(original:', originalRole, ')');
//         setUser(normalizedUser);
//         localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
//       }

//       return res;
//     } catch (err) {
//       console.error('Login error:', err);
//       throw err;
//     }
//   };

//   // LOGOUT
//   const logout = async () => {
//     try {
//       await API.logout();
//     } catch (err) {
//       console.warn("Logout failed:", err);
//     } finally {
//       localStorage.removeItem("auth_user");
//       setUser(null);
//       console.log('👋 User logged out');
//     }
//   };

//   const isAuthenticated = !!user;

//   const value = useMemo(() => ({
//     user,
//     login,
//     logout,
//     loading,
//     isAuthenticated,
//   }), [user, loading]);

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };
// src/pages/Login/useAuth.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import API from "../../services/api.service";
import useInactivityTimer from "../../hooks/useInactivityTimer";
import Screensaver from "../../components/Screensaver";

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  if (!role) return null;
  const roleLower = role.toLowerCase();

  const roleMap = {
    admin: "administrator",
    administrator: "administrator",
    teacher: "teacher",
    student: "student",
    teaching_assistant: "teaching_assistant",
    "teaching assistant": "teaching_assistant",
    non_teaching_staff: "non_teaching_staff",
    accountant: "accountant",
  };

  return roleMap[roleLower] || roleLower;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screensaverVisible, setScreensaverVisible] = useState(false);

  // LOGOUT
  const logout = async () => {
    try {
      await API.logout();
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("last_activity");
      setUser(null);
      setScreensaverVisible(false);
    }
  };

  // INACTIVITY TIMER
  const {
    isScreensaverActive,
    handleResume,
    resetTimers,
    getLogoutTimeRemaining
  } = useInactivityTimer({
    screensaverTimeout: 30 * 1000,
    countdownStartTimeout: 1 * 60 * 1000,
    logoutTimeout: 2 * 60 * 1000,
    onScreensaverShow: () => setScreensaverVisible(true),
    onScreensaverHide: () => setScreensaverVisible(false),
    onLogout: logout
  });

  // Sync state
  useEffect(() => {
    setScreensaverVisible(isScreensaverActive);
  }, [isScreensaverActive]);

  // Activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "click"];

    const handleActivity = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [user, resetTimers]);

  // Restore session
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.original_role = parsed.role;
        parsed.role = normalizeRole(parsed.role);
        setUser(parsed);
      } catch {
        localStorage.removeItem("auth_user");
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async ({ username, password, role }) => {
    const res = await API.login(username, password, role);

    if (res?.user) {
      const normalizedUser = {
        ...res.user,
        original_role: res.user.role,
        role: normalizeRole(res.user.role)
      };

      setUser(normalizedUser);
      localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
      resetTimers();
    }

    return res;
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    screensaverVisible,
    handleResume,
    getLogoutTimeRemaining
  }), [user, loading, screensaverVisible, handleResume]);

  return (
    <AuthContext.Provider value={value}>
      {children}

      {user && screensaverVisible && (
        <Screensaver
          isActive={screensaverVisible}
          onResume={handleResume}
          logoutTimeRemaining={getLogoutTimeRemaining}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};