// import { useEffect } from "react";

// export default function Notification({ message, type, onClose }) {
//   useEffect(() => {
//     if (!message) return;

//     // Auto close after 5 seconds
//     const timer = setTimeout(() => {
//       onClose();
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [message, onClose]);

//   if (!message) return null;

//   return (
//     <div
//       className={`notification ${type}`}
//       style={{
//         position: "fixed",
//         top: "1rem",
//         right: "1rem",
//         padding: "1rem 1.5rem",
//         borderRadius: "0.5rem",
//         backgroundColor: type === "success" ? "var(--success-bg)" : "var(--error-bg)",
//         color: "var(--text)",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//         zIndex: 9999,
//         animation: "slideDown 0.5s ease",
//       }}
//     >
//       {message}
//     </div>
//   );
// }


import { useEffect } from "react";

export default function Notification({ message, type = "error", onClose = () => {} }) {
  useEffect(() => {
    if (!message) return;

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`notification ${type}`}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        padding: "1rem 1.5rem",
        borderRadius: "0.5rem",
        backgroundColor: type === "success" ? "var(--success-bg)" : "var(--error-bg)",
        color: "var(--text)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 9999,
        animation: "slideDown 0.5s ease",
      }}
    >
      {message}
    </div>
  );
}
