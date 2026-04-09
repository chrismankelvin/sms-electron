// Notification.jsx - Simple Modern Version
import { useEffect } from "react";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";

export default function Notification({ message, type = "error", onClose = () => {}, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle size={20} />;
      case "error": return <AlertCircle size={20} />;
      case "warning": return <AlertTriangle size={20} />;
      case "info": return <Info size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success": return { bg: "#10b981", light: "rgba(16, 185, 129, 0.1)" };
      case "error": return { bg: "#ef4444", light: "rgba(239, 68, 68, 0.1)" };
      case "warning": return { bg: "#f59e0b", light: "rgba(245, 158, 11, 0.1)" };
      case "info": return { bg: "#3b82f6", light: "rgba(59, 130, 246, 0.1)" };
      default: return { bg: "#ef4444", light: "rgba(239, 68, 68, 0.1)" };
    }
  };

  const colors = getColors();

  return (
    <div
      className="notification"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        animation: "slideInRight 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1rem",
          minWidth: "300px",
          maxWidth: "400px",
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(var(--border-rgb), 0.3)",
        }}
      >
        <div
          style={{
            color: colors.bg,
            background: colors.light,
            padding: "6px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
            {type === "success" ? "Success" : type === "error" ? "Error" : type === "warning" ? "Warning" : "Info"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>{message}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--secondary)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(var(--primary-rgb), 0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .notification {
          animation: slideInRight 0.3s ease;
        }
        
        .notification.closing {
          animation: slideOutRight 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}