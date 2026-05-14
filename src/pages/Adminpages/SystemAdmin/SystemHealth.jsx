// import { useState } from 'react';
// import { Activity, Database, Mail, Smartphone, Shield,Info, Clock, HardDrive, Users, RefreshCw, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
// import '../../../styles/system-health.css';

// function SystemHealth() {
//   const [metrics, setMetrics] = useState({
//     database: { status: 'ok', responseTime: '45ms' },
//     email: { status: 'ok', message: 'Operational' },
//     sms: { status: 'warning', message: 'Rate limit: 80% used' },
//     backup: { status: 'ok', message: 'Last backup 2 hours ago' },
//     license: { status: 'ok', message: 'Valid (365 days remaining)' }
//   });

//   const systemMetrics = {
//     dbSize: '45 MB',
//     totalUsers: 128,
//     activeSessions: 12,
//     apiCallsToday: 1245,
//     avgResponseTime: '245ms',
//     diskFree: '4.2 GB'
//   };

//   const alerts = [
//     { type: 'warning', message: 'Disk space: 4.2 GB free (below 5GB threshold)' },
//     { type: 'info', message: 'Failed login attempts: 15 in last hour' }
//   ];

//   const handleRunDiagnostics = () => {
//     alert('Running diagnostics...');
//     setTimeout(() => alert('Diagnostics complete. All systems operational.'), 2000);
//   };

//   const handleClearCache = () => {
//     alert('Cache cleared successfully');
//   };

//   const getStatusIcon = (status) => {
//     if (status === 'ok') return <CheckCircle size={20} color="#10b981" />;
//     if (status === 'warning') return <AlertTriangle size={20} color="#f59e0b" />;
//     return <XCircle size={20} color="#ef4444" />;
//   };

//   return (
//     <div className="system-health-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Activity size={28} style={{ display: 'inline', marginRight: '12px' }} />System Health</h1>
//         <p style={{ color: 'var(--secondary)' }}>Monitor system performance and status</p></div>
//         <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={handleRunDiagnostics}><RefreshCw size={16} /> Run Diagnostics</button>
//         <button className="button button-secondary" onClick={handleClearCache}>Clear Cache</button></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
//         <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.database.status)}</div><div><strong>Database</strong></div><div>✓ Connected</div><div style={{ fontSize: '0.75rem' }}>Response: {metrics.database.responseTime}</div></div>
//         <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.email.status)}</div><div><strong>Email Service</strong></div><div>✓ Operational</div></div>
//         <div className="health-card"><div className="health-status-warning">{getStatusIcon(metrics.sms.status)}</div><div><strong>SMS Service</strong></div><div>⚠ {metrics.sms.message}</div></div>
//         <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.backup.status)}</div><div><strong>Backup Service</strong></div><div>✓ {metrics.backup.message}</div></div>
//         <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.license.status)}</div><div><strong>License</strong></div><div>✓ {metrics.license.message}</div></div>
//       </div>

//       <div className="card" style={{ marginBottom: '1rem' }}>
//         <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>System Metrics</h3>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
//           <div className="metric-card"><HardDrive size={24} /><div><strong>{systemMetrics.dbSize}</strong></div><div style={{ fontSize: '0.75rem' }}>Database Size</div></div>
//           <div className="metric-card"><Users size={24} /><div><strong>{systemMetrics.totalUsers}</strong></div><div style={{ fontSize: '0.75rem' }}>Total Users</div></div>
//           <div className="metric-card"><Activity size={24} /><div><strong>{systemMetrics.activeSessions}</strong></div><div style={{ fontSize: '0.75rem' }}>Active Sessions</div></div>
//           <div className="metric-card"><Clock size={24} /><div><strong>{systemMetrics.avgResponseTime}</strong></div><div style={{ fontSize: '0.75rem' }}>Avg Response Time</div></div>
//         </div>
//       </div>

//       <div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Alerts</h3>
//         {alerts.map((alert, i) => (<div key={i} className={`alert-item ${alert.type}`}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{alert.type === 'warning' ? <AlertTriangle size={16} color="#f59e0b" /> : <Info size={16} color="#3b82f6" />}<span>{alert.message}</span></div></div>))}
//       </div>
//     </div>
//   );
// }

// export default SystemHealth;

// src/components/Admin/SystemHealth.jsx

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Mail, 
  Smartphone, 
  Shield, 
  Info, 
  Clock, 
  HardDrive, 
  Users, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  X,
  Loader,
  Server,
  Cpu,
  MemoryStick
} from 'lucide-react';
import '../../../styles/system-health.css';
import { systemHealthService } from '../../../services/systemHealthService';

function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await systemHealthService.getHealth();
      setHealth(data);
    } catch (error) {
      showAlert('Failed to load system health: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleRunDiagnostics = async () => {
    try {
      setDiagnosticsRunning(true);
      const result = await systemHealthService.runDiagnostics();
      showAlert(`Diagnostics complete: ${result.message}`, result.overall === 'passed' ? 'success' : 'warning');
      await loadHealthData(); // Refresh data
    } catch (error) {
      showAlert('Diagnostics failed: ' + error.message, 'error');
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await systemHealthService.clearCache();
      showAlert('Cache cleared successfully', 'success');
    } catch (error) {
      showAlert('Failed to clear cache: ' + error.message, 'error');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return <CheckCircle size={20} color="#10b981" />;
    if (status === 'warning') return <AlertTriangle size={20} color="#f59e0b" />;
    return <XCircle size={20} color="#ef4444" />;
  };

  if (loading) {
    return (
      <div className="system-health-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-health-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      <div className="health-header">
        <div className="header-title">
          <h1>
            <Activity size={28} />
            System Health
          </h1>
          <p>Monitor system performance and status</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleRunDiagnostics} disabled={diagnosticsRunning}>
            {diagnosticsRunning ? <Loader size={16} className="spinner" /> : <RefreshCw size={16} />}
            {diagnosticsRunning ? 'Running...' : 'Run Diagnostics'}
          </button>
          <button className="btn-secondary" onClick={handleClearCache}>
            Clear Cache
          </button>
        </div>
      </div>
      <hr className="divider" />

      {/* Service Status Cards */}
      <div className="services-grid">
        <div className="health-card">
          <div className="health-status">{getStatusIcon(health?.database?.status)}</div>
          <div className="health-title">Database</div>
          <div className="health-value">✓ Connected</div>
          <div className="health-detail">Response: {health?.database?.response_time}</div>
          <div className="health-detail">Size: {health?.database?.size}</div>
        </div>

        <div className="health-card">
          <div className="health-status">{getStatusIcon(health?.email?.status)}</div>
          <div className="health-title">Email Service</div>
          <div className="health-value">✓ Operational</div>
          <div className="health-detail">Last check: {new Date(health?.email?.last_check).toLocaleTimeString()}</div>
        </div>

        <div className="health-card">
          <div className="health-status">{getStatusIcon(health?.sms?.status)}</div>
          <div className="health-title">SMS Service</div>
          <div className="health-value">{health?.sms?.message}</div>
          <div className="health-detail">Usage: {health?.sms?.usage_percent}%</div>
        </div>

        <div className="health-card">
          <div className="health-status">{getStatusIcon(health?.backup?.status)}</div>
          <div className="health-title">Backup Service</div>
          <div className="health-value">✓ {health?.backup?.message}</div>
          <div className="health-detail">Next backup: {new Date(health?.backup?.next_backup).toLocaleDateString()}</div>
        </div>

        <div className="health-card">
          <div className="health-status">{getStatusIcon(health?.license?.status)}</div>
          <div className="health-title">License</div>
          <div className="health-value">✓ {health?.license?.message}</div>
          <div className="health-detail">Type: {health?.license?.license_type}</div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <h3 className="card-title">System Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <HardDrive size={24} />
            <div className="metric-value">{health?.system_metrics?.db_size}</div>
            <div className="metric-label">Database Size</div>
          </div>
          <div className="metric-card">
            <Users size={24} />
            <div className="metric-value">{health?.system_metrics?.total_users}</div>
            <div className="metric-label">Total Users</div>
          </div>
          <div className="metric-card">
            <Activity size={24} />
            <div className="metric-value">{health?.system_metrics?.active_sessions}</div>
            <div className="metric-label">Active Sessions</div>
          </div>
          <div className="metric-card">
            <Clock size={24} />
            <div className="metric-value">{health?.system_metrics?.avg_response_time}</div>
            <div className="metric-label">Avg Response Time</div>
          </div>
          <div className="metric-card">
            <Server size={24} />
            <div className="metric-value">{health?.system_metrics?.cpu_usage}%</div>
            <div className="metric-label">CPU Usage</div>
          </div>
          <div className="metric-card">
            <MemoryStick size={24} />
            <div className="metric-value">{health?.system_metrics?.memory_usage}%</div>
            <div className="metric-label">Memory Usage</div>
          </div>
          <div className="metric-card">
            <HardDrive size={24} />
            <div className="metric-value">{health?.system_metrics?.disk_free}</div>
            <div className="metric-label">Disk Free</div>
          </div>
          <div className="metric-card">
            <Activity size={24} />
            <div className="metric-value">{health?.system_metrics?.api_calls_today}</div>
            <div className="metric-label">API Calls Today</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {health?.alerts?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Alerts</h3>
          <div className="alerts-list">
            {health.alerts.map((alert, i) => (
              <div key={i} className={`alert-item ${alert.type}`}>
                <div className="alert-content">
                  {alert.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                  <span>{alert.message}</span>
                </div>
                <div className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemHealth;