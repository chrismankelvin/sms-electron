// Updates.jsx - Standalone Updates Component
import { useState } from "react";
import { Download, RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";
import Notification from "../../components/Notification";

export default function Updates({ onUpdateComplete }) {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateNotes, setUpdateNotes] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [currentVersion, setCurrentVersion] = useState("1.0.0");

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    setNotification({ message: "Checking for updates...", type: "info" });
    
    // Simulate API call to check for updates
    setTimeout(() => {
      // Mock response - in real app, fetch from your backend
      const hasUpdate = true;
      const latestVersion = "2.0.0";
      const releaseNotes = [
        "New dashboard with analytics",
        "Enhanced security features",
        "Performance improvements",
        "Bug fixes and stability updates"
      ];
      
      if (hasUpdate) {
        setUpdateAvailable(true);
        setUpdateVersion(latestVersion);
        setUpdateNotes(releaseNotes);
        setNotification({ message: `Version ${latestVersion} is available!`, type: "success" });
      } else {
        setNotification({ message: "You're on the latest version!", type: "success" });
      }
      setCheckingUpdate(false);
    }, 2000);
  };

  const downloadUpdate = async () => {
    setDownloading(true);
    setNotification({ message: "Downloading update...", type: "info" });
    
    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDownloadProgress(i);
    }
    
    setTimeout(() => {
      setNotification({ message: "Update downloaded! Restart to install.", type: "success" });
      setDownloading(false);
      if (onUpdateComplete) onUpdateComplete();
    }, 500);
  };

  const installUpdate = () => {
    setNotification({ message: "Installing update...", type: "info" });
    setTimeout(() => {
      setNotification({ message: "Update installed successfully! Restarting...", type: "success" });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 2000);
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    setNotification({ message: "Update reminder dismissed", type: "info" });
  };

  return (
    <div className="updates-component">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      {/* Current Version Info */}
      <div className="version-info">
        <div className="version-badge">
          <CheckCircle size={16} />
          <span>Current Version: {currentVersion}</span>
        </div>
        <p className="version-desc">You're running the latest stable release</p>
      </div>

      {/* Check for Updates Button */}
      <button 
        className="check-update-btn" 
        onClick={checkForUpdates} 
        disabled={checkingUpdate || downloading}
      >
        {checkingUpdate ? (
          <RefreshCw size={18} className="spinning" />
        ) : (
          <RefreshCw size={18} />
        )}
        {checkingUpdate ? "Checking for Updates..." : "Check for Updates"}
      </button>

      {/* Update Available Section */}
      {updateAvailable && (
        <div className="update-available-card">
          <div className="update-header">
            <div className="update-icon">
              <Download size={32} />
            </div>
            <div className="update-title">
              <h3>Version {updateVersion} Available</h3>
              <p>New features and improvements are ready for you</p>
            </div>
          </div>

          {/* Release Notes */}
          <div className="release-notes">
            <h4>What's New:</h4>
            <ul>
              {updateNotes.map((note, index) => (
                <li key={index}>
                  <CheckCircle size={14} />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download Progress */}
          {downloading && (
            <div className="download-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <span className="progress-text">{downloadProgress}% Downloaded</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="update-actions">
            {!downloading && downloadProgress === 0 && (
              <button className="download-btn" onClick={downloadUpdate}>
                <Download size={16} />
                Download Now
              </button>
            )}
            {downloadProgress === 100 && (
              <button className="install-btn" onClick={installUpdate}>
                Install Now
              </button>
            )}
            <button className="dismiss-btn" onClick={dismissUpdate}>
              Remind Me Later
            </button>
          </div>
        </div>
      )}

      {/* Update History */}
      <div className="update-history">
        <h4>Previous Updates</h4>
        <div className="history-list">
          <div className="history-item">
            <div className="history-version">v1.9.0</div>
            <div className="history-date">Dec 15, 2024</div>
            <div className="history-desc">Added student attendance module</div>
          </div>
          <div className="history-item">
            <div className="history-version">v1.8.0</div>
            <div className="history-date">Nov 20, 2024</div>
            <div className="history-desc">Performance improvements and bug fixes</div>
          </div>
          <div className="history-item">
            <div className="history-version">v1.7.0</div>
            <div className="history-date">Oct 10, 2024</div>
            <div className="history-desc">New reporting features</div>
          </div>
        </div>
      </div>

      <style>{`
        .updates-component {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .version-info {
          text-align: center;
          padding: 1rem;
          background: var(--bg);
          border-radius: 16px;
        }

        .version-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .version-desc {
          font-size: 0.8rem;
          color: var(--secondary);
          margin: 0;
        }

        .check-update-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          background: linear-gradient(135deg, var(--primary), #60a5fa);
          color: white;
          border: none;
          border-radius: 60px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .check-update-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .check-update-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .update-available-card {
          background: var(--bg);
          border-radius: 20px;
          padding: 1.5rem;
          border: 2px solid var(--primary);
        }

        .update-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .update-icon {
          width: 56px;
          height: 56px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .update-title h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .update-title p {
          font-size: 0.8rem;
          color: var(--secondary);
          margin: 0;
        }

        .release-notes {
          margin: 1rem 0;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 12px;
        }

        .release-notes h4 {
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .release-notes ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .release-notes li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--secondary);
          margin-bottom: 0.5rem;
        }

        .release-notes li svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .download-progress {
          margin: 1rem 0;
        }

        .progress-bar-container {
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), #60a5fa);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          display: block;
          font-size: 0.75rem;
          color: var(--secondary);
          margin-top: 0.5rem;
          text-align: center;
        }

        .update-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .download-btn, .install-btn, .dismiss-btn {
          flex: 1;
          padding: 0.6rem;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
        }

        .download-btn, .install-btn {
          background: var(--primary);
          color: white;
        }

        .download-btn:hover, .install-btn:hover {
          transform: translateY(-2px);
        }

        .dismiss-btn {
          background: var(--border);
          color: var(--text);
        }

        .dismiss-btn:hover {
          background: var(--secondary);
          color: white;
        }

        .update-history {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .update-history h4 {
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--bg);
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .history-version {
          font-weight: 600;
          color: var(--primary);
          min-width: 70px;
        }

        .history-date {
          color: var(--secondary);
          min-width: 100px;
          font-size: 0.7rem;
        }

        .history-desc {
          color: var(--text);
          flex: 1;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .update-header {
            flex-direction: column;
            text-align: center;
          }
          
          .update-actions {
            flex-direction: column;
          }
          
          .history-item {
            flex-direction: column;
            text-align: center;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}