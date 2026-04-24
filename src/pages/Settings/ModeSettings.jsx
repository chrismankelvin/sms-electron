// ModeSettings.jsx - System Mode Configuration Component
import { useState } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Cloud,
  XCircle,
  Database
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function ModeSettings({ 
  mode: externalMode, 
  liveMode: externalLiveMode,
  lastSync: externalLastSync,
  onModeChange, 
  onLiveModeChange,
  onSyncComplete,
  showNotification 
}) {
  const [mode, setMode] = useState(externalMode || "online");
  const [liveMode, setLiveMode] = useState(externalLiveMode !== undefined ? externalLiveMode : true);
  const [lastSync, setLastSync] = useState(externalLastSync || "");
  const [loading, setLoading] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleLiveModeChange = (newLiveMode) => {
    setLiveMode(newLiveMode);
    if (onLiveModeChange) {
      onLiveModeChange(newLiveMode);
    }
  };

  const syncData = async () => {
    setLoading(true);
    if (showNotification) {
      showNotification({ message: "Syncing data...", type: "info" });
    }
    
    // Simulate sync - replace with actual API call
    setTimeout(() => {
      const now = new Date().toLocaleString();
      setLastSync(now);
      if (onSyncComplete) {
        onSyncComplete(now);
      }
      if (showNotification) {
        showNotification({ message: "Sync completed!", type: "success" });
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="settings-section">
      <h2>System Mode</h2>

      <div className="mode-cards">
        {/* Online Mode */}
        <div className={`mode-card ${mode === "online" ? "active" : ""}`}>
          <div className="mode-icon online">
            <Wifi size={32} />
          </div>
          <h3>Online Mode</h3>
          <p>Real-time cloud sync, live data access</p>
          <button
            className={`mode-btn ${mode === "online" ? "active" : ""}`}
            onClick={() => handleModeChange("online")}
          >
            {mode === "online" ? "Active" : "Switch to Online"}
          </button>
          {mode === "online" && (
            <div className="mode-actions">
              <button className="btn-sm" onClick={syncData} disabled={loading}>
                <RefreshCw size={14} /> Backup
              </button>
              <button 
                className={`btn-sm primary ${liveMode ? "active" : ""}`} 
                onClick={() => handleLiveModeChange(true)}
              >
                <Cloud size={14} /> Turn on live mode
              </button>
            </div>
          )}
        </div>

        {/* Offline Mode */}
        <div className={`mode-card ${mode === "offline" ? "active" : ""}`}>
          <div className="mode-icon offline">
            <WifiOff size={32} />
          </div>
          <h3>Offline Mode</h3>
          <p>Local storage, sync when online</p>
          <button
            className={`mode-btn ${mode === "offline" ? "active" : ""}`}
            onClick={() => handleModeChange("offline")}
          >
            {mode === "offline" ? "Active" : "Switch to Offline"}
          </button>
          {mode === "offline" && (
            <div className="mode-actions">
              <button className="btn-sm" onClick={syncData} disabled={loading}>
                <Download size={14} /> Pull latest update
              </button>
              <button 
                className={`btn-sm warning ${!liveMode ? "active" : ""}`} 
                onClick={() => handleLiveModeChange(false)}
              >
                <XCircle size={14} /> Turn off live mode
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sync-info">
        <Database size={16} />
        <span>Last sync: {lastSync || "Never"}</span>
        {loading && <span className="syncing">Syncing...</span>}
      </div>

      <style>{`
        .mode-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin: 1.5rem 0;
        }
        .mode-card {
          background: var(--card-bg);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        .mode-card.active {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--card-bg), rgba(59,130,246,0.05));
        }
        .mode-icon {
          display: inline-flex;
          padding: 1rem;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .mode-icon.online {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }
        .mode-icon.offline {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .mode-card h3 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }
        .mode-card p {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .mode-btn {
          width: 100%;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0.75rem;
        }
        .mode-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .mode-btn:hover:not(.active) {
          background: var(--hover-bg);
        }
        .mode-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-sm {
          flex: 1;
          padding: 0.4rem;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s ease;
        }
        .btn-sm:hover {
          background: var(--hover-bg);
        }
        .btn-sm.primary {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .btn-sm.warning {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
        }
        .sync-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .syncing {
          color: var(--primary);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}