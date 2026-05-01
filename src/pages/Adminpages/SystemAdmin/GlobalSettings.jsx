// app/frontend/components/Adminpages/SystemAdmin/GlobalSettings.jsx
import { useState, useEffect } from "react";
import {
  Globe,
  Mail,
  Phone,
  Bell,
  Database,
  Cloud,
  Key,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Wifi,
  WifiOff
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

export default function GlobalSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      date_format: "DD/MM/YYYY",
      timezone: "Africa/Accra",
      default_language: "English",
      session_timeout: 30,
      password_expiry: 90,
      two_factor_required: true
    },
    email: {
      smtp_server: "smtp.gmail.com",
      smtp_port: 587,
      smtp_encryption: "TLS",
      email_from_address: "noreply@school.edu",
      email_from_name: "School System"
    },
    sms: {
      provider: "Twilio",
      api_key: "",
      sender_id: "SchoolSMS"
    },
    notifications: {
      quiet_hours_start: "21:00:00",
      quiet_hours_end: "07:00:00"
    },
    database: {
      sync_enabled: false,
      db_connection_string: "",
      db_api_key: "",
      db_name: "",
      db_type: "sqlitecloud"
    },
    features: {
      enable_sms: false,
      enable_push_notifications: true,
      enable_fee_module: false,
      enable_sync_module: false
    },
    sync_status: {
      last_attempt: null,
      last_success: null,
      last_error: null,
      status: "disabled"
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/global-settings/`);
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      } else {
        console.error("Failed to load settings:", result.message);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/global-settings/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Settings saved successfully!");
        await loadSettings();
      } else {
        alert("Failed to save settings: " + result.message);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const enableSyncModule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/global-settings/sync/enable`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        await loadSettings();
      } else {
        alert("Failed to enable sync: " + result.message);
      }
    } catch (error) {
      console.error("Error enabling sync:", error);
      alert("Failed to enable sync module");
    } finally {
      setLoading(false);
    }
  };

  const disableSyncModule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/global-settings/sync/disable`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        await loadSettings();
      } else {
        alert("Failed to disable sync: " + result.message);
      }
    } catch (error) {
      console.error("Error disabling sync:", error);
      alert("Failed to disable sync module");
    } finally {
      setLoading(false);
    }
  };

  const updateGeneral = (field, value) => {
    setSettings({
      ...settings,
      general: { ...settings.general, [field]: value }
    });
  };

  const updateEmail = (field, value) => {
    setSettings({
      ...settings,
      email: { ...settings.email, [field]: value }
    });
  };

  const updateSMS = (field, value) => {
    setSettings({
      ...settings,
      sms: { ...settings.sms, [field]: value }
    });
  };

  const updateNotification = (field, value) => {
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [field]: value }
    });
  };

  const updateDatabase = (field, value) => {
    setSettings({
      ...settings,
      database: { ...settings.database, [field]: value }
    });
  };

  const updateFeature = (field, value) => {
    setSettings({
      ...settings,
      features: { ...settings.features, [field]: value }
    });
  };

  const getSyncStatusIcon = () => {
    switch (settings.sync_status.status) {
      case 'active':
        return <CheckCircle size={16} className="status-active" />;
      case 'error':
        return <AlertCircle size={16} className="status-error" />;
      case 'disabled':
        return <XCircle size={16} className="status-disabled" />;
      default:
        return <AlertCircle size={16} className="status-unknown" />;
    }
  };

  const getSyncStatusText = () => {
    switch (settings.sync_status.status) {
      case 'active':
        return "Active";
      case 'error':
        return "Error";
      case 'disabled':
        return "Disabled";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="global-settings">
      <div className="settings-header">
        <h2>Global System Settings</h2>
        <p className="section-desc">Configure system-wide settings and integrations</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading settings...</div>
      ) : (
        <>
          {/* General Settings */}
          <div className="setting-card">
            <h3>
              <Globe size={20} />
              General Settings
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Date Format</label>
                <select 
                  value={settings.general.date_format}
                  onChange={(e) => updateGeneral('date_format', e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select 
                  value={settings.general.timezone}
                  onChange={(e) => updateGeneral('timezone', e.target.value)}
                >
                  <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Language</label>
                <select 
                  value={settings.general.default_language}
                  onChange={(e) => updateGeneral('default_language', e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>

              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input 
                  type="number"
                  value={settings.general.session_timeout}
                  onChange={(e) => updateGeneral('session_timeout', parseInt(e.target.value))}
                  min="5"
                  max="240"
                />
              </div>

              <div className="form-group">
                <label>Password Expiry (days)</label>
                <input 
                  type="number"
                  value={settings.general.password_expiry}
                  onChange={(e) => updateGeneral('password_expiry', parseInt(e.target.value))}
                  min="30"
                  max="365"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox"
                    checked={settings.general.two_factor_required}
                    onChange={(e) => updateGeneral('two_factor_required', e.target.checked)}
                  />
                  Require 2FA for Admin accounts
                </label>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="setting-card">
            <h3>
              <Mail size={20} />
              Email Configuration
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>SMTP Server</label>
                <input 
                  type="text"
                  value={settings.email.smtp_server}
                  onChange={(e) => updateEmail('smtp_server', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="form-group">
                <label>SMTP Port</label>
                <input 
                  type="number"
                  value={settings.email.smtp_port}
                  onChange={(e) => updateEmail('smtp_port', parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>

              <div className="form-group">
                <label>Encryption</label>
                <select 
                  value={settings.email.smtp_encryption}
                  onChange={(e) => updateEmail('smtp_encryption', e.target.value)}
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div className="form-group">
                <label>From Email</label>
                <input 
                  type="email"
                  value={settings.email.email_from_address}
                  onChange={(e) => updateEmail('email_from_address', e.target.value)}
                  placeholder="noreply@school.edu"
                />
              </div>

              <div className="form-group full-width">
                <label>From Name</label>
                <input 
                  type="text"
                  value={settings.email.email_from_name}
                  onChange={(e) => updateEmail('email_from_name', e.target.value)}
                  placeholder="School System"
                />
              </div>
            </div>
          </div>

          {/* SMS Configuration */}
          <div className="setting-card">
            <h3>
              <Phone size={20} />
              SMS Configuration
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Provider</label>
                <select 
                  value={settings.sms.provider}
                  onChange={(e) => updateSMS('provider', e.target.value)}
                >
                  <option value="Twilio">Twilio</option>
                  <option value="AfricaIsTalking">AfricaIsTalking</option>
                  <option value="Vonage">Vonage</option>
                </select>
              </div>

              <div className="form-group">
                <label>API Key</label>
                <div className="password-input">
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={settings.sms.api_key}
                    onChange={(e) => updateSMS('api_key', e.target.value)}
                    placeholder="Enter API key"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="toggle-password"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Sender ID</label>
                <input 
                  type="text"
                  value={settings.sms.sender_id}
                  onChange={(e) => updateSMS('sender_id', e.target.value)}
                  placeholder="SchoolSMS"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="setting-card">
            <h3>
              <Bell size={20} />
              Notification Settings
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Quiet Hours Start</label>
                <input 
                  type="time"
                  value={settings.notifications.quiet_hours_start}
                  onChange={(e) => updateNotification('quiet_hours_start', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Quiet Hours End</label>
                <input 
                  type="time"
                  value={settings.notifications.quiet_hours_end}
                  onChange={(e) => updateNotification('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Database Sync Configuration */}
          <div className="setting-card">
            <h3>
              <Database size={20} />
              Database Sync Configuration
            </h3>
            <div className="sync-status-bar">
              <div className="sync-status-info">
                {getSyncStatusIcon()}
                <span>Sync Status: {getSyncStatusText()}</span>
              </div>
              {settings.sync_status.last_success && (
                <div className="sync-time">
                  Last successful sync: {new Date(settings.sync_status.last_success).toLocaleString()}
                </div>
              )}
              {settings.sync_status.last_error && (
                <div className="sync-error">
                  Last error: {settings.sync_status.last_error}
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Database Type</label>
                <select 
                  value={settings.database.db_type}
                  onChange={(e) => updateDatabase('db_type', e.target.value)}
                >
                  <option value="sqlitecloud">SQLite Cloud</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Connection String</label>
                <input 
                  type="text"
                  value={settings.database.db_connection_string}
                  onChange={(e) => updateDatabase('db_connection_string', e.target.value)}
                  placeholder="sqlitecloud://host:port/database"
                />
              </div>

              <div className="form-group full-width">
                <label>API Key</label>
                <input 
                  type="password"
                  value={settings.database.db_api_key}
                  onChange={(e) => updateDatabase('db_api_key', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>

              <div className="form-group">
                <label>Database Name</label>
                <input 
                  type="text"
                  value={settings.database.db_name}
                  onChange={(e) => updateDatabase('db_name', e.target.value)}
                  placeholder="school_database"
                />
              </div>
            </div>

            <div className="sync-actions">
              {settings.database.sync_enabled ? (
                <button 
                  className="btn-danger"
                  onClick={disableSyncModule}
                  disabled={loading}
                >
                  <WifiOff size={16} />
                  Disable Sync Module
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={enableSyncModule}
                  disabled={loading || !settings.database.db_connection_string}
                >
                  <Cloud size={16} />
                  Enable Sync Module
                </button>
              )}
            </div>
          </div>

          {/* Features & Integrations */}
          <div className="setting-card">
            <h3>Features & Integrations</h3>
            <div className="features-grid">
              <div className="feature-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={settings.features.enable_sms}
                    onChange={(e) => updateFeature('enable_sms', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="feature-info">
                  <h4>SMS Notifications</h4>
                  <p>Enable SMS notifications for alerts</p>
                </div>
              </div>

              <div className="feature-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={settings.features.enable_push_notifications}
                    onChange={(e) => updateFeature('enable_push_notifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="feature-info">
                  <h4>Push Notifications</h4>
                  <p>Enable in-app push notifications</p>
                </div>
              </div>

              <div className="feature-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={settings.features.enable_fee_module}
                    onChange={(e) => updateFeature('enable_fee_module', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="feature-info">
                  <h4>Fee Module</h4>
                  <p>Enable school fee management</p>
                </div>
              </div>

              <div className="feature-item">
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={settings.features.enable_sync_module}
                    onChange={(e) => updateFeature('enable_sync_module', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="feature-info">
                  <h4>Sync Module</h4>
                  <p>Enable database synchronization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button 
              className="btn-primary save-btn"
              onClick={saveSettings}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save All Settings"}
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .global-settings {
          padding: 1rem;
        }

        .settings-header {
          margin-bottom: 1.5rem;
        }

        .settings-header h2 {
          margin: 0 0 0.5rem 0;
        }

        .section-desc {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .setting-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .setting-card h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .form-group input,
        .form-group select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          ring: 2px solid rgba(59, 130, 246, 0.1);
        }

        .form-group.checkbox {
          flex-direction: row;
          align-items: center;
        }

        .password-input {
          display: flex;
          gap: 0.5rem;
          position: relative;
        }

        .password-input input {
          flex: 1;
        }

        .toggle-password {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .sync-status-bar {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .sync-status-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .status-active {
          color: #22c55e;
        }

        .status-error {
          color: #ef4444;
        }

        .status-disabled {
          color: #64748b;
        }

        .sync-time, .sync-error {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .sync-error {
          color: #ef4444;
        }

        .sync-actions {
          margin-top: 1rem;
        }

        .features-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .feature-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
        }

        .feature-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #3b82f6;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-primary, .btn-danger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn-primary:disabled, .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-btn {
          background: #22c55e;
        }

        .save-btn:hover {
          background: #16a34a;
        }

        .loading-spinner {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}