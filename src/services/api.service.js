

// // ---------------- CHATGPT ----------------
// // ---------------- CHATGPT ----------------
// // ---------------- CHATGPT ----------------
// // ---------------- CHATGPT ----------------

// const API_URL = "http://localhost:8000"; // Must match FastAPI CORS origins

// // ---------------- Activation ----------------
// export async function checkActivationStatus() {
//   try {
//     const res = await fetch(`${API_URL}/activation/status`, {
//       credentials: "include",
//     });
//     const data = await res.json();
//     return data.activated === true;
//   } catch {
//     return false;
//   }
// }

// export async function activateSystem(code) {
//   try {
//     const res = await fetch(`${API_URL}/activation/activate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ code }),
//       credentials: "include",
//     });
//     return await res.json();
//   } catch {
//     return { success: false, message: "Backend not reachable" };
//   }
// }

// // ---------------- Auth / Login ----------------
// export async function bootstrapSuperAdmin(username, password) {
//   try {
//     const res = await fetch(`${API_URL}/auth/bootstrap`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//       credentials: "include",
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Bootstrap failed");
//     }
//     return await res.json();
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// }

// export async function login(username, password) {
//   try {
//     const res = await fetch(`${API_URL}/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//       credentials: "include", // ✅ Important for cookies
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Login failed");
//     }

//     return await res.json();
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// }

// export async function logout() {
//   try {
//     const res = await fetch(`${API_URL}/auth/logout`, {
//       method: "POST",
//       credentials: "include",
//     });
//     return await res.json();
//   } catch {
//     return { success: false, message: "Logout failed" };
//   }
// }

// export async function checkSession() {
//   try {
//     const res = await fetch(`${API_URL}/auth/session`, {
//       credentials: "include",
//     });

//     if (!res.ok) return null;
//     const data = await res.json();
//     return data.user || null;
//   } catch {
//     return null;
//   }
// }

// export default {
//   checkActivationStatus,
//   activateSystem,
//   bootstrapSuperAdmin,
//   login,
//   logout,
//   checkSession,
// };



// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------
// ---------------- DEEPSEEK ----------------



// // service/api.service.js
// // ---------------- DEEPSEEK ----------------
// const API_URL = "http://localhost:8000";

// // ---------------- Activation ----------------
// export async function checkActivationStatus() {
//   try {
//     const res = await fetch(`${API_URL}/activation/status`, {
//       credentials: "include",
//     });
//     const data = await res.json();
//     return data.activated === true;
//   } catch {
//     return false;
//   }
// }

// export async function activateSystem(code) {
//   try {
//     const res = await fetch(`${API_URL}/activation/activate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ code }),
//       credentials: "include",
//     });
//     return await res.json();
//   } catch {
//     return { success: false, message: "Backend not reachable" };
//   }
// }

// // ---------------- Auth / Login ----------------
// export async function bootstrapSuperAdmin(username, password) {
//   try {
//     const res = await fetch(`${API_URL}/auth/bootstrap`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//       credentials: "include",
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Bootstrap failed");
//     }
//     return await res.json();
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// }

// export async function login(username, password, role = null) {
//   try {
//     const payload = { username, password };
//     if (role) {
//       payload.role = role;
//     }
    
//     const res = await fetch(`${API_URL}/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//       credentials: "include",
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Login failed");
//     }

//     return await res.json();
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// }

// export async function logout() {
//   try {
//     const res = await fetch(`${API_URL}/auth/logout`, {
//       method: "POST",
//       credentials: "include",
//     });
//     return await res.json();
//   } catch {
//     return { success: false, message: "Logout failed" };
//   }
// }

// export async function checkSession() {
//   try {
//     const res = await fetch(`${API_URL}/auth/session`, {
//       credentials: "include",
//     });

//     if (!res.ok) return null;
//     const data = await res.json();
//     return data.user || null;
//   } catch {
//     return null;
//   }
// }

// export default {
//   checkActivationStatus,
//   activateSystem,
//   bootstrapSuperAdmin,
//   login,
//   logout,
//   checkSession,
// };


// electron support

// service/api.service.ipc.js
// ---------------- DEEPSEEK / Electron IPC ----------------

/**
 * NOTE:
 * This replaces all HTTP calls with IPC calls to the Python backend.
 * Requires preload.js exposing `window.electron.backend.fetchData` and `window.electron.activation.request`
 */

export async function checkActivationStatus() {
  try {
    const data = await window.electron.activation.request({ action: "status" });
    return data.activated === true;
  } catch (err) {
    console.error("IPC checkActivationStatus failed:", err);
    return false;
  }
}

export async function activateSystem(code, schoolName = null) {
  try {
    const payload = { action: "activate", code };
    if (schoolName) payload.school_name = schoolName;

    const data = await window.electron.activation.request(payload);
    return data;
  } catch (err) {
    console.error("IPC activateSystem failed:", err);
    return { success: false, message: "Backend not reachable" };
  }
}

// ---------------- Auth / Login ----------------
export async function bootstrapSuperAdmin(username, password) {
  try {
    const data = await window.electron.backend.fetchData("auth/bootstrap", { username, password });
    return data;
  } catch (err) {
    console.error("IPC bootstrapSuperAdmin failed:", err);
    return { success: false, message: err.message || "Bootstrap failed" };
  }
}

export async function login(username, password, role = null) {
  try {
    const payload = { username, password };
    if (role) payload.role = role;

    const data = await window.electron.backend.fetchData("auth/login", payload);
    return data;
  } catch (err) {
    console.error("IPC login failed:", err);
    return { success: false, message: err.message || "Login failed" };
  }
}

export async function logout() {
  try {
    const data = await window.electron.backend.fetchData("auth/logout", {});
    return data;
  } catch (err) {
    console.error("IPC logout failed:", err);
    return { success: false, message: "Logout failed" };
  }
}

export async function checkSession() {
  try {
    const data = await window.electron.backend.fetchData("auth/session", {});
    return data?.user || null;
  } catch (err) {
    console.error("IPC checkSession failed:", err);
    return null;
  }
}

export default {
  checkActivationStatus,
  activateSystem,
  bootstrapSuperAdmin,
  login,
  logout,
  checkSession,
};
