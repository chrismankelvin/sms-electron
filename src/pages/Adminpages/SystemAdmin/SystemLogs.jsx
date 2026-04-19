import { useState } from 'react';
import { Terminal, Filter, Download, Trash2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import '../../../styles/system-logs.css';

function SystemLogs() {
  const [filterLevel, setFilterLevel] = useState('all');
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2024-03-20 10:00:23', level: 'ERROR', message: 'Database connection timeout', source: 'score_entry.php', user: '-' },
    { id: 2, timestamp: '2024-03-20 09:15:10', level: 'WARNING', message: 'Slow query (2.3s)', source: 'reports.php', user: 'admin' },
    { id: 3, timestamp: '2024-03-20 08:30:05', level: 'INFO', message: 'User login successful', source: 'auth.php', user: 'john.doe' },
    { id: 4, timestamp: '2024-03-20 07:45:22', level: 'ERROR', message: 'Failed to send email', source: 'notifications.php', user: 'system' }
  ]);

  const getLevelIcon = (level) => {
    if (level === 'ERROR') return <AlertCircle size={14} color="#ef4444" />;
    if (level === 'WARNING') return <AlertTriangle size={14} color="#f59e0b" />;
    return <Info size={14} color="#3b82f6" />;
  };

  const handleClearLogs = () => {
    if (window.confirm('Clear all system logs? This action cannot be undone.')) {
      setLogs([]);
      alert('Logs cleared');
    }
  };

  const handleDownload = () => {
    alert('Downloading logs as .txt file...');
  };

  const filteredLogs = filterLevel === 'all' ? logs : logs.filter(l => l.level === filterLevel);

  return (
    <div className="system-logs-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Terminal size={28} style={{ display: 'inline', marginRight: '12px' }} />System Logs</h1>
        <p style={{ color: 'var(--secondary)' }}>Technical logs for debugging</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={handleDownload}><Download size={16} /> Download Logs</button>
        <button className="button button-danger" onClick={handleClearLogs}><Trash2 size={16} /> Clear Logs</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span>Filter by Level:</span>
        <div className="filter-chips" style={{ marginTop: 0 }}>
          <span className={`filter-chip ${filterLevel === 'all' ? 'active' : ''}`} onClick={() => setFilterLevel('all')}>All</span>
          <span className={`filter-chip ${filterLevel === 'ERROR' ? 'active' : ''}`} onClick={() => setFilterLevel('ERROR')}>Error</span>
          <span className={`filter-chip ${filterLevel === 'WARNING' ? 'active' : ''}`} onClick={() => setFilterLevel('WARNING')}>Warning</span>
          <span className={`filter-chip ${filterLevel === 'INFO' ? 'active' : ''}`} onClick={() => setFilterLevel('INFO')}>Info</span>
        </div>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Timestamp</th><th>Level</th><th>Message</th><th>Source</th><th>User</th></tr></thead>
      <tbody>{filteredLogs.map(log => (<tr key={log.id}><td>{log.timestamp}</td>
      <td><span className={`log-level-${log.level}`}>{getLevelIcon(log.level)} {log.level}</span></td>
      <td>{log.message}</td>
      <td>{log.source}</td>
      <td>{log.user}</td></tr>))}</tbody></table></div>
    </div>
  );
}

export default SystemLogs;