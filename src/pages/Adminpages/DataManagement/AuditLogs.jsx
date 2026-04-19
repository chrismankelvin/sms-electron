import { useState } from 'react';
import { FileText, Filter, Download, Search,Eye, Calendar, User, X } from 'lucide-react';
import '../../../styles/audit-logs.css';

function AuditLogs() {
  const [filters, setFilters] = useState({ dateRange: '', user: '', action: '', table: '' });
  const [selectedLog, setSelectedLog] = useState(null);

  const logs = [
    { id: 1, timestamp: '10:15:23', user: 'admin@school.com', action: 'UPDATE', table: 'student_scores', recordId: '1234', oldValue: '65', newValue: '72', ip: '192.168.1.1' },
    { id: 2, timestamp: '09:30:15', user: 'teacher@school.com', action: 'INSERT', table: 'attendance', recordId: '5678', oldValue: '-', newValue: 'Present', ip: '192.168.1.2' },
    { id: 3, timestamp: '08:45:22', user: 'admin@school.com', action: 'DELETE', table: 'users', recordId: '9012', oldValue: 'User: johndoe', newValue: '-', ip: '192.168.1.1' }
  ];

  const users = ['admin@school.com', 'teacher@school.com', 'principal@school.com'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'INSERT'];
  const tables = ['student_scores', 'attendance', 'users', 'students', 'staff'];

  const exportCSV = () => alert('Exporting filtered logs to CSV...');

  return (
    <div className="audit-logs-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />Audit Logs</h1>
        <p style={{ color: 'var(--secondary)' }}>View all system actions for compliance</p></div>
        <button className="button button-secondary" onClick={exportCSV}><Download size={16} /> Export CSV</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="date" className="form-input" placeholder="Date Range" style={{ width: '150px' }} />
        <select className="form-select" style={{ width: '150px' }}><option value="">All Users</option>{users.map(u => <option key={u} value={u}>{u}</option>)}</select>
        <select className="form-select" style={{ width: '130px' }}><option value="">All Actions</option>{actions.map(a => <option key={a} value={a}>{a}</option>)}</select>
        <select className="form-select" style={{ width: '150px' }}><option value="">All Tables</option>{tables.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <button className="button button-secondary"><Search size={16} /> Apply Filters</button>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Table</th><th>Record ID</th><th>Old Value</th><th>New Value</th><th>IP Address</th><th>Actions</th></tr></thead>
      <tbody>{logs.map(log => (<tr key={log.id}><td>{log.timestamp}</td>
      <td>{log.user}</td>
      <td><span className={`status-badge status-${log.action === 'DELETE' ? 'withdrawn' : log.action === 'UPDATE' ? 'warning' : 'active'}`}>{log.action}</span></td>
      <td>{log.table}</td>
      <td>{log.recordId}</td>
      <td><span className="change-badge change-old">{log.oldValue}</span></td>
      <td><span className="change-badge change-new">{log.newValue}</span></td>
      <td>{log.ip}</td><td className="action-buttons"><button className="action-btn edit-btn" onClick={() => setSelectedLog(log)}><Eye size={16} /></button></td></tr>))}</tbody></table></div>

      {selectedLog && (<div className="modal-overlay" onClick={() => setSelectedLog(null)}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Log Details</h2><X className="modal-close" size={20} onClick={() => setSelectedLog(null)} /></div>
        <div className="modal-body"><div><strong>Timestamp:</strong> {selectedLog.timestamp}</div><div><strong>User:</strong> {selectedLog.user}</div><div><strong>Action:</strong> {selectedLog.action}</div>
        <div><strong>Table:</strong> {selectedLog.table}</div><div><strong>Record ID:</strong> {selectedLog.recordId}</div><div><strong>Old Value:</strong> <span className="change-badge change-old">{selectedLog.oldValue}</span></div>
        <div><strong>New Value:</strong> <span className="change-badge change-new">{selectedLog.newValue}</span></div><div><strong>IP Address:</strong> {selectedLog.ip}</div></div>
      </div></div>)}
    </div>
  );
}

export default AuditLogs;