import { useState } from 'react';
import { Database, Download, Upload, Clock, Calendar, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';
import '../../../styles/backup-restore.css';

function BackupRestore() {
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  const backups = [
    { id: 1, file: 'backup_20240320.sql', date: '2024-03-20', size: '45 MB', type: 'Full' },
    { id: 2, file: 'backup_20240319.sql', date: '2024-03-19', size: '44 MB', type: 'Full' },
    { id: 3, file: 'backup_20240318.sql', date: '2024-03-18', size: '44 MB', type: 'Full' }
  ];

  const handleCreateBackup = () => {
    alert('Creating backup...');
    setTimeout(() => alert('Backup created successfully!'), 2000);
  };

  const handleRestore = () => {
    if (window.confirm(`Restore from ${selectedBackup?.file}? This will overwrite all current data.`)) {
      alert(`Restoring from ${selectedBackup?.file}...`);
      setShowRestoreConfirm(false);
    }
  };

  const handleDownload = (backup) => {
    alert(`Downloading ${backup.file}...`);
  };

  return (
    <div className="backup-restore-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Database size={28} style={{ display: 'inline', marginRight: '12px' }} />Backup & Restore</h1>
        <p style={{ color: 'var(--secondary)' }}>Database backup management</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="backup-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div><div><strong>Last Backup:</strong> 2024-03-20 02:00 AM</div><div><strong>Database Size:</strong> 45 MB</div></div>
          <button className="button" style={{ background: 'white', color: 'var(--primary)' }} onClick={handleCreateBackup}><Database size={16} /> Create Backup Now</button>
        </div>
        <div className="schedule-toggle"><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} /> Schedule daily backups at 2:00 AM</label></div>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Backup File</th><th>Date</th><th>Size</th><th>Type</th><th>Actions</th></tr></thead>
      <tbody>{backups.map(b => (<tr key={b.id}><td><strong>{b.file}</strong></td>
      <td>{b.date}</td>
      <td>{b.size}</td>
      <td><span className="status-badge status-active">{b.type}</span></td>
      <td className="action-buttons"><button className="action-btn set-current-btn" onClick={() => { setSelectedBackup(b); setShowRestoreConfirm(true); }}><Upload size={16} /> Restore</button>
      <button className="action-btn edit-btn" onClick={() => handleDownload(b)}><Download size={16} /> Download</button></td></tr>))}</tbody></table></div>

      {showRestoreConfirm && selectedBackup && (<div className="modal-overlay" onClick={() => setShowRestoreConfirm(false)}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Confirm Restore</h2><X className="modal-close" size={20} onClick={() => setShowRestoreConfirm(false)} /></div>
        <div className="modal-body"><AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <p>Are you sure you want to restore from <strong>{selectedBackup.file}</strong>?</p><p style={{ color: '#ef4444' }}>This will overwrite ALL current data. This action cannot be undone.</p></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => setShowRestoreConfirm(false)}>Cancel</button><button className="button button-danger" onClick={handleRestore}>Confirm Restore</button></div>
      </div></div>)}
    </div>
  );
}

export default BackupRestore;