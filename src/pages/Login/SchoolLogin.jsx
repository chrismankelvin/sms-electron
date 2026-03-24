

// more feacture
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.jsx";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/Notification"; // Add this import
import "../../styles/school-login.css";

const FRONTEND_ROLES = [
  "Admin",
  "Teacher",
  "Student",
  "Teaching Assistant",
  "Accountant",
];

const ROLE_MAPPING = {
  "Admin": ["SUPER_ADMIN", "ADMIN"],
  "Teacher": ["STAFF"],
  "Teaching Assistant": ["STAFF"],
  "Accountant": ["STAFF"],
  "Student": ["STUDENT"]
};

export default function SchoolLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Admin");
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "error" }); // Add this state
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    setDarkMode(!darkMode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleLogin = async () => {
    setNotification({ message: "", type: "error" }); // Clear notification
    
    if (!username.trim() || !password.trim()) {
      setNotification({
        message: "Please enter both username and password",
        type: "error"
      });
      return;
    }
    
    setLoading(true);

    try {
      const res = await login({ username, password, role: selectedRole });
      
      if (!res.user) {
        throw new Error(res.message || "Invalid credentials or role mismatch");
      }

      // Show success notification
      setNotification({
        message: `Welcome back, ${res.user.username}!`,
        type: "success"
      });

      // Navigate after a short delay
      setTimeout(() => {
        const userRole = res.user.role;
        
        if (["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
          navigate("/dashboard");
        } else if (userRole === "STAFF") {
          navigate("/staff");
        } else if (userRole === "STUDENT") {
          navigate("/students");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
      
    } catch (err) {
      setNotification({
        message: err.message || "Login failed. Please check your credentials and selected role.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear notification after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "error" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  return (
    <div className="school-login-wrapper full-screen flex-center">
      {/* Add Notification component here */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "error" })}
      />

      <div className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </div>

      <div className="school-login-content seed-drop">
        <h1 className="school-name">PHASH-C INTERNATIONAL SCHOOL</h1>

        <p className="login-as">
          Login as <span>{selectedRole}</span>
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Keep original error display as fallback */}
          {notification.message && notification.type === "error" && (
            <p className="login-error">{notification.message}</p>
          )}
          <button
            type="submit"
            className="button login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="role-buttons">
          {FRONTEND_ROLES.filter(r => r !== selectedRole).map(r => (
            <button
              key={r}
              className="role-btn"
              onClick={() => setSelectedRole(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}