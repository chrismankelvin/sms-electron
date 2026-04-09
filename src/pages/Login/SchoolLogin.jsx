// SchoolLogin.jsx - Panels Switched (Form Left, Brand Right)
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { LogIn, User, Lock, Sun, Moon, Shield, ChevronRight, Sparkles } from "lucide-react";
import Notification from "../../components/Notification";
import "../../styles/school-login.css";

const FRONTEND_ROLES = ["Admin", "Teacher", "Student", "Teaching Assistant", "Accountant"];

export default function SchoolLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Admin");
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    if (isDark) document.body.classList.add("dark-mode");
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleLogin = async () => {
    setNotification({ message: "", type: "" });

    if (!username.trim() || !password.trim()) {
      setNotification({ message: "Enter username and password", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await login({ username, password, role: selectedRole });

      if (!res.user) throw new Error(res.message || "Invalid credentials");

      setNotification({ message: `Welcome ${res.user.username}!`, type: "success" });

      setTimeout(() => {
        const userRole = res.user.role;
        if (["SUPER_ADMIN", "ADMIN"].includes(userRole)) navigate("/dashboard");
        else if (userRole === "STAFF") navigate("/staff");
        else if (userRole === "STUDENT") navigate("/students");
        else navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setNotification({ message: err.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  // Auto-clear notification
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  return (
    <div className="app app-login p-0">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      <div className="row g-0 app-auth-wrapper">
        {/* LEFT PANEL - Login Form (was right) */}
        <div className="col-12 col-md-7 col-lg-6 auth-main-col p-4">
          <div className="app-auth-body mx-auto" style={{ maxWidth: "400px" }}>
            {/* Theme Toggle */}
            <div className="d-flex justify-content-end mb-4">
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="auth-heading">Welcome Back</h2>
              <p className="text-muted">Sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Email or Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-group-text password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="me-2" />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Need help? Contact your system administrator
              </small>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Brand/Info Side (was left) */}
        <div className="col-12 col-md-5 col-lg-6 auth-background-col text-white d-flex align-items-center justify-content-center">
          <div className="auth-background-overlay text-center p-5">
            <div className="mb-4">
              {/* <div className="brand-icon-wrapper">
                <Sparkles size={48} className="mb-3" />
              </div> */}
              <h2 className="fw-bold text-light mb-3">Cornerstone</h2>
              <p className="lead text-light mb-4">International School Portal</p>
            </div>

            <div className="role-info mt-4">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <Shield size={20} />
                <span>Login as</span>
                <strong className="text-primary fs-5">{selectedRole}</strong>
              </div>
              <div className="role-list">
                {FRONTEND_ROLES.map((role) => (
                  <button
                    key={role}
                    className={`role-pill ${selectedRole === role ? "active" : ""}`}
                    onClick={() => setSelectedRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3">
              <small className="opacity-50">From CraftyGraphics ®</small>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .role-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .role-pill {
          padding: 0.4rem 1rem;
          border-radius: 40px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .role-pill:hover {
          background: var(--primary);
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .role-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(59,130,246,0.3);
        }
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .theme-toggle-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .brand-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          backdrop-filter: blur(10px);
        }
        .password-toggle {
          cursor: pointer;
          background: transparent;
          border-left: none;
        }
        .password-toggle:hover {
          background: rgba(59,130,246,0.1);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}