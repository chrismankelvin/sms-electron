import { Circle } from "lucide-react";

export default function Intro() {
  return (
    <div
      className="intro-screen flex-center"
      style={{
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden",
      }}
    >
      {/* SMS Handwriting Animation */}
      <svg
        width="300"
        height="100"
        viewBox="0 0 300 100"
        className="sms-handwriting"
        style={{ marginBottom: "1rem" }}
      >
        {/* S */}
        <path
          d="M10,30 C10,0 50,0 50,30 C50,60 10,60 10,90"
          stroke="var(--text)"
          strokeWidth="4"
          fill="transparent"
          className="draw-path"
          style={{ animationDelay: "0s" }}
        />
        {/* M */}
        <path
          d="M70,90 L70,10 L95,50 L120,10 L120,90"
          stroke="var(--text)"
          strokeWidth="4"
          fill="transparent"
          className="draw-path"
          style={{ animationDelay: "1s" }}
        />
        {/* S */}
        <path
          d="M140,30 C140,0 180,0 180,30 C180,60 140,60 140,90"
          stroke="var(--text)"
          strokeWidth="4"
          fill="transparent"
          className="draw-path"
          style={{ animationDelay: "2s" }}
        />
      </svg>

      {/* Full App Name */}
      <div
        className="full-text"
        style={{
          fontSize: "1.8rem",
          fontWeight: "500",
          opacity: 0,
          animation: "expandText 1.5s ease forwards 3.5s",
        }}
      >
        School Management System
      </div>

      {/* Subtle "from Phash-C" */}
      <div
        className="from-phashc flex-center"
        style={{
          marginTop: "2rem",
          fontSize: "0.9rem",
          gap: "0.5rem",
          opacity: 0,
          color: "var(--text)",
          animation: "fadeIn 1s ease forwards 5s",
          filter: "opacity(0.5)",
        }}
      >
        <Circle size={10} />
        from Phash-C
      </div>
    </div>
  );
}
