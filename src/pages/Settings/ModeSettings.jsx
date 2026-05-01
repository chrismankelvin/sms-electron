// app/frontend/components/Settings/ModeSettings.jsx
import { useState, useEffect } from "react";
import "../../styles/modesettings.css";
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Cloud,
  HardDrive,
  Zap,
  Activity,
  Signal
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function ModeSettings({ 
  mode, 
  liveMode, 
  lastSync, 
  onModeChange, 
  onSyncComplete,
  showNotification 
}) {
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    pendingChanges: 0,
    cloudStatus: "unknown",
    lastSync: lastSync
  });
  const [networkStatus, setNetworkStatus] = useState({
    is_online: true,
    system_mode: "online",
    live_mode: true,
    auto_switching_enabled: true
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState([]);
  const [showQueue, setShowQueue] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load sync status and network status on mount and periodically
  useEffect(() => {
    loadSyncStatus();
    loadNetworkStatus();
    
    const interval = setInterval(() => {
      loadSyncStatus();
      loadNetworkStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus({
          isRunning: result.data.is_running,
          pendingChanges: result.data.pending_changes,
          cloudStatus: result.data.cloud_status,
          lastSync: result.data.last_sync
        });
        
        if (result.data.last_sync && result.data.last_sync !== syncStatus.lastSync) {
          onSyncComplete?.(result.data.last_sync);
        }
      }
    } catch (error) {
      console.error("Error loading sync status:", error);
    }
  };

  const loadNetworkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/network/status`);
      const result = await response.json();
      
      if (result.success) {
        const newNetworkStatus = result.data;
        setNetworkStatus(newNetworkStatus);
        
        // Auto-switch mode based on is_online status
        if (newNetworkStatus.auto_switching_enabled) {
          let targetMode = null;
          
          if (!newNetworkStatus.is_online && mode === "online") {
            targetMode = "offline";
          } else if (newNetworkStatus.is_online && mode === "offline") {
            targetMode = "online";
          }
          
          if (targetMode) {
            onModeChange(targetMode);
            showNotification?.({
              message: targetMode === "online" 
                ? "🌐 Internet connected - Switching to Online Mode" 
                : "📡 No internet connection - Switching to Offline Mode",
              type: "info"
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading network status:", error);
    }
  };

  const loadSyncQueue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/queue?limit=100`);
      const result = await response.json();
      
      if (result.success) {
        setSyncQueue(result.data.items);
      }
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  };

  const triggerSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync/trigger?sync_type=full`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification?.({ message: result.message, type: "success" });
        pollSyncCompletion();
      } else {
        showNotification?.({ message: result.message, type: "error" });
      }
    } catch (error) {
      console.error("Error triggering sync:", error);
      showNotification?.({ message: "Failed to trigger sync", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const pollSyncCompletion = () => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`${API_BASE_URL}/sync/status`);
        const result = await response.json();
        
        if (result.data.pending_changes === 0 || attempts > 30) {
          clearInterval(interval);
          setIsSyncing(false);
          await loadSyncStatus();
          showNotification?.({ message: "Sync completed!", type: "success" });
        }
      } catch (error) {
        clearInterval(interval);
        setIsSyncing(false);
      }
    }, 1000);
  };

  const clearSyncQueue = async () => {
    if (!confirm("Are you sure you want to clear all pending sync operations? This may cause data inconsistency.")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync/queue/clear`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification?.({ message: result.message, type: "success" });
        await loadSyncStatus();
        await loadSyncQueue();
      } else {
        showNotification?.({ message: "Failed to clear queue", type: "error" });
      }
    } catch (error) {
      console.error("Error clearing queue:", error);
      showNotification?.({ message: "Failed to clear queue", type: "error" });
    }
  };

  const handleToggleQueue = async () => {
    setShowQueue(!showQueue);
    if (!showQueue) {
      await loadSyncQueue();
    }
  };

  const getCloudStatusIcon = () => {
    switch (syncStatus.cloudStatus) {
      case "connected":
        return <CheckCircle size={16} className="status-connected" />;
      case "disconnected":
        return <XCircle size={16} className="status-disconnected" />;
      default:
        return <AlertCircle size={16} className="status-unknown" />;
    }
  };

  const getCloudStatusText = () => {
    switch (syncStatus.cloudStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="settings-section mode-settings">
      <div className="section-header">
        <h2>System Mode & Sync Settings</h2>
        <p className="section-desc">System automatically switches between online and offline mode based on internet connectivity</p>
      </div>

      {/* Current Status Indicator */}
      <div className="auto-mode-indicator">
        <div className="indicator-left">
          <RefreshCw size={14} className="auto-icon" />
          <span>Auto mode switching is active</span>
        </div>
        <div className="indicator-right">
          {!networkStatus.is_online && (
            <span className="offline-badge">
              <WifiOff size={12} />
              Offline Mode
            </span>
          )}
          {networkStatus.is_online && (
            <span className="online-badge">
              <Signal size={12} />
              Online Mode
            </span>
          )}
        </div>
      </div>

      {/* Network Status Banner */}
      {!networkStatus.is_online && (
        <div className="network-status-banner offline">
          <WifiOff size={18} />
          <span>No internet connection - Working in offline mode. Data will sync when connection is restored.</span>
        </div>
      )}
      {networkStatus.is_online && mode === "online" && (
        <div className="network-status-banner online">
          <Wifi size={18} />
          <span>Internet connected - Real-time sync active</span>
        </div>
      )}

      {/* Live Mode Indicator (non-editable) */}
      <div className="setting-card live-mode-card">
        <div className="setting-item">
          <div className="setting-info">
            <Zap size={20} className="live-icon" />
            <div>
              <h4>Live Mode</h4>
              <p>Real-time synchronization is always enabled when online</p>
            </div>
          </div>
          <div className="live-mode-badge">
            <CheckCircle size={16} />
            <span>Always Active</span>
          </div>
        </div>
      </div>

      {/* Sync Status Card - Only show when online */}
      {mode === "online" && networkStatus.is_online && (
        <div className="setting-card sync-status-card">
          <div className="card-header">
            <h3>
              <Activity size={18} />
              Sync Status
            </h3>
            {syncStatus.isRunning && (
              <span className="sync-active-badge">
                <Loader size={12} className="spinning" />
                Sync Active
              </span>
            )}
          </div>
          
          <div className="status-grid">
            <div className="status-item">
              <div className="status-label">
                <Cloud size={16} />
                <span>Cloud Connection</span>
              </div>
              <div className="status-value">
                {getCloudStatusIcon()}
                <span className={syncStatus.cloudStatus}>{getCloudStatusText()}</span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">
                <HardDrive size={16} />
                <span>Pending Changes</span>
              </div>
              <div className="status-value">
                <span className={`pending-count ${syncStatus.pendingChanges > 0 ? "has-pending" : ""}`}>
                  {syncStatus.pendingChanges}
                </span>
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">
                <Clock size={16} />
                <span>Last Sync</span>
              </div>
              <div className="status-value">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : "Never"}
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">
                <RefreshCw size={16} />
                <span>Sync Status</span>
              </div>
              <div className="status-value">
                {isSyncing ? (
                  <span className="syncing">
                    <Loader size={14} className="spinning" /> Syncing...
                  </span>
                ) : (
                  <span className="idle">Idle</span>
                )}
              </div>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="sync-actions">
            <button 
              className="btn-primary sync-btn"
              onClick={triggerSync}
              disabled={isSyncing || loading || !networkStatus.is_online}
            >
              {isSyncing ? (
                <>
                  <Loader size={16} className="spinning" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sync Now
                </>
              )}
            </button>

            <button 
              className="btn-secondary"
              onClick={handleToggleQueue}
            >
              <Database size={16} />
              {showQueue ? "Hide Queue" : "View Queue"}
            </button>

            {syncStatus.pendingChanges > 0 && (
              <button 
                className="btn-danger"
                onClick={clearSyncQueue}
              >
                Clear Queue
              </button>
            )}
          </div>

          {/* Sync Queue Display */}
          {showQueue && (
            <div className="sync-queue">
              <h4>Pending Sync Queue ({syncQueue.length} items)</h4>
              {syncQueue.length === 0 ? (
                <p className="empty-queue">No pending sync operations</p>
              ) : (
                <div className="queue-items">
                  {syncQueue.map(item => (
                    <div key={item.id} className="queue-item">
                      <div className="queue-item-info">
                        <span className={`operation-badge ${item.operation}`}>
                          {item.operation}
                        </span>
                        <span className="queue-table">{item.table_name}</span>
                        <span className="queue-record-id">ID: {item.record_id}</span>
                      </div>
                      <div className="queue-item-meta">
                        <span className="retry-count">
                          Retries: {item.retry_count || 0}
                        </span>
                        <span className="created-at">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Offline Mode Info */}
      {mode === "offline" && (
        <div className="setting-card offline-info">
          <div className="info-banner warning">
            <AlertCircle size={20} />
            <div>
              <h4>Working Offline</h4>
              <p>All changes are saved locally. Data will automatically sync when internet connection is restored.</p>
              {syncStatus.pendingChanges > 0 && (
                <div className="pending-offline-warning">
                  <HardDrive size={14} />
                  <span>{syncStatus.pendingChanges} change(s) pending sync</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
}