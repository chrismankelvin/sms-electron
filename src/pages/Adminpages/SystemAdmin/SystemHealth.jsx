import { useState } from 'react';
import { Activity, Database, Mail, Smartphone, Shield,Info, Clock, HardDrive, Users, RefreshCw, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import '../../../styles/system-health.css';

function SystemHealth() {
  const [metrics, setMetrics] = useState({
    database: { status: 'ok', responseTime: '45ms' },
    email: { status: 'ok', message: 'Operational' },
    sms: { status: 'warning', message: 'Rate limit: 80% used' },
    backup: { status: 'ok', message: 'Last backup 2 hours ago' },
    license: { status: 'ok', message: 'Valid (365 days remaining)' }
  });

  const systemMetrics = {
    dbSize: '45 MB',
    totalUsers: 128,
    activeSessions: 12,
    apiCallsToday: 1245,
    avgResponseTime: '245ms',
    diskFree: '4.2 GB'
  };

  const alerts = [
    { type: 'warning', message: 'Disk space: 4.2 GB free (below 5GB threshold)' },
    { type: 'info', message: 'Failed login attempts: 15 in last hour' }
  ];

  const handleRunDiagnostics = () => {
    alert('Running diagnostics...');
    setTimeout(() => alert('Diagnostics complete. All systems operational.'), 2000);
  };

  const handleClearCache = () => {
    alert('Cache cleared successfully');
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return <CheckCircle size={20} color="#10b981" />;
    if (status === 'warning') return <AlertTriangle size={20} color="#f59e0b" />;
    return <XCircle size={20} color="#ef4444" />;
  };

  return (
    <div className="system-health-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Activity size={28} style={{ display: 'inline', marginRight: '12px' }} />System Health</h1>
        <p style={{ color: 'var(--secondary)' }}>Monitor system performance and status</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={handleRunDiagnostics}><RefreshCw size={16} /> Run Diagnostics</button>
        <button className="button button-secondary" onClick={handleClearCache}>Clear Cache</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.database.status)}</div><div><strong>Database</strong></div><div>✓ Connected</div><div style={{ fontSize: '0.75rem' }}>Response: {metrics.database.responseTime}</div></div>
        <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.email.status)}</div><div><strong>Email Service</strong></div><div>✓ Operational</div></div>
        <div className="health-card"><div className="health-status-warning">{getStatusIcon(metrics.sms.status)}</div><div><strong>SMS Service</strong></div><div>⚠ {metrics.sms.message}</div></div>
        <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.backup.status)}</div><div><strong>Backup Service</strong></div><div>✓ {metrics.backup.message}</div></div>
        <div className="health-card"><div className="health-status-ok">{getStatusIcon(metrics.license.status)}</div><div><strong>License</strong></div><div>✓ {metrics.license.message}</div></div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>System Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div className="metric-card"><HardDrive size={24} /><div><strong>{systemMetrics.dbSize}</strong></div><div style={{ fontSize: '0.75rem' }}>Database Size</div></div>
          <div className="metric-card"><Users size={24} /><div><strong>{systemMetrics.totalUsers}</strong></div><div style={{ fontSize: '0.75rem' }}>Total Users</div></div>
          <div className="metric-card"><Activity size={24} /><div><strong>{systemMetrics.activeSessions}</strong></div><div style={{ fontSize: '0.75rem' }}>Active Sessions</div></div>
          <div className="metric-card"><Clock size={24} /><div><strong>{systemMetrics.avgResponseTime}</strong></div><div style={{ fontSize: '0.75rem' }}>Avg Response Time</div></div>
        </div>
      </div>

      <div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Alerts</h3>
        {alerts.map((alert, i) => (<div key={i} className={`alert-item ${alert.type}`}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{alert.type === 'warning' ? <AlertTriangle size={16} color="#f59e0b" /> : <Info size={16} color="#3b82f6" />}<span>{alert.message}</span></div></div>))}
      </div>
    </div>
  );
}

export default SystemHealth;