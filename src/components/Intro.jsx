import { GraduationCap, Sparkles } from "lucide-react";

export default function Intro() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Animated Gradient Border Box */}
      <div
        style={{
          position: "relative",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "30px",
            background: "linear-gradient(90deg, var(--primary), #60a5fa, var(--primary))",
            animation: "rotate 3s linear infinite",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "70px",
            height: "70px",
            borderRadius: "28px",
            background: "var(--card-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <GraduationCap size={32} color="var(--primary)" />
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          fontWeight: "600",
          margin: 0,
          letterSpacing: "-0.02em",
          animation: "reveal 0.6s ease forwards",
          opacity: 0,
          transform: "translateY(10px)",
        }}
      >
        SMS
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--secondary)",
          marginTop: "0.5rem",
          letterSpacing: "0.3px",
          animation: "reveal 0.6s ease 0.15s forwards",
          opacity: 0,
          transform: "translateY(10px)",
        }}
      >
        School Management System
      </p>

      {/* Loading Bar */}
      <div
        style={{
          width: "120px",
          height: "2px",
          background: "rgba(59, 130, 246, 0.2)",
          borderRadius: "2px",
          marginTop: "2rem",
          overflow: "hidden",
          animation: "fadeIn 0.6s ease 0.3s forwards",
          opacity: 0,
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            background: "linear-gradient(90deg, var(--primary), #60a5fa)",
            borderRadius: "2px",
            animation: "loading 1.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Footer - Updated with CraftyGraphics */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          animation: "fadeIn 0.6s ease 0.45s forwards",
          opacity: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.7rem",
            color: "var(--secondary)",
            opacity: 0.4,
          }}
        >
          <Sparkles size={10} />
          <span>Crafted with precision</span>
        </div>
        
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.75rem",
            color: "var(--secondary)",
            opacity: 0.6,
          }}
        >
          <span>from</span>
          <span style={{
            fontWeight: "600",
            background: "linear-gradient(135deg, var(--primary), #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            CraftyGraphics
          </span>
          <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>®</span>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          0% { opacity: 0.5; transform: rotate(0deg); }
          50% { opacity: 1; transform: rotate(180deg); }
          100% { opacity: 0.5; transform: rotate(360deg); }
        }
        
        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}