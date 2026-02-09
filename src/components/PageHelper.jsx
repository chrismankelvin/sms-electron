// src/components/PageHelper.jsx
import { X } from "lucide-react";
import "../styles/page-helper.css";

export default function PageHelper({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="page-helper-backdrop">
      <div className="page-helper-modal">
        {/* Header */}
        <div className="page-helper-header">
          <h3>{title}</h3>
          <button className="page-helper-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="page-helper-content">
          {children}
        </div>
      </div>
    </div>
  );
}
