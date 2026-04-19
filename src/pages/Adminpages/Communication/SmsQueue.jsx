import { useState } from 'react';
import { Smartphone, RefreshCw, Eye, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import '../../../styles/sms-queue.css';

function SmsQueue() {
  const [smsList, setSmsList] = useState([
    { id: 1, notification: 'Results Available', phone: '+233 20 123 4567', message: 'Your child\'s Term 1 results are now available...', status: 'Sent', retryCount: 0, createdAt: '10:00', sentAt: '10:01' },
    { id: 2, notification: 'Fee Reminder', phone: '+233 20 123 4568', message: 'Fee payment of GHS 500 is due by March 30th...', status: 'Failed', retryCount: 2, createdAt: '09:00', sentAt: '-' },
    { id: 3, notification: 'Event Reminder', phone: '+233 20 123 4569', message: 'PTA Meeting tomorrow at 2PM...', status: 'Pending', retryCount: 0, createdAt: '11:30', sentAt: '-' }
  ]);

  const [selectedSms, setSelectedSms] = useState(null);

  const handleRetry = (id) => {
    setSmsList(prev => prev.map(s => s.id === id ? { ...s, status: 'Pending', retryCount: s.retryCount + 1 } : s));
    alert(`Retrying SMS ${id}`);
  };

  const handleCancel = (id) => {
    if (window.confirm('Cancel this pending SMS?')) {
      setSmsList(prev => prev.filter(s => s.id !== id));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Sent') return <CheckCircle size={16} color="#10b981" />;
    if (status === 'Failed') return <AlertCircle size={16} color="#ef4444" />;
    return <Clock size={16} color="#f59e0b" />;
  };

  return (
    <div className="sms-queue-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Smartphone size={28} style={{ display: 'inline', marginRight: '12px' }} />SMS Queue</h1>
        <p style={{ color: 'var(--secondary)' }}>Monitor SMS sending status</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Notification</th><th>Phone Number</th><th>Message Preview</th><th>Status</th><th>Retry Count</th><th>Created At</th><th>Sent At</th><th>Actions</th></tr></thead>
      <tbody>{smsList.map(s => (<tr key={s.id}><td><strong>{s.notification}</strong></td>
      <td>{s.phone}</td>
      <td><div className="message-preview" title={s.message}>{s.message}</div></td>
      <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{getStatusIcon(s.status)} {s.status}</span></td>
      <td><span className="retry-count">{s.retryCount}</span></td>
      <td>{s.createdAt}</td>
      <td>{s.sentAt}</td>
      <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => setSelectedSms(s)}><Eye size={16} /></button>
      {s.status === 'Failed' && <button className="action-btn set-current-btn" onClick={() => handleRetry(s.id)}><RefreshCw size={16} /> Retry</button>}
      {s.status === 'Pending' && <button className="action-btn delete-btn" onClick={() => handleCancel(s.id)}><X size={16} /> Cancel</button>}</td></tr>))}</tbody></table></div>

      {selectedSms && (<div className="modal-overlay" onClick={() => setSelectedSms(null)}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>SMS Details</h2><X className="modal-close" size={20} onClick={() => setSelectedSms(null)} /></div>
        <div className="modal-body"><p><strong>To:</strong> {selectedSms.phone}</p><p><strong>Message:</strong></p><p style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '0.375rem' }}>{selectedSms.message}</p>
        <p><strong>Status:</strong> {selectedSms.status}</p><p><strong>Created:</strong> {selectedSms.createdAt}</p><p><strong>Sent:</strong> {selectedSms.sentAt}</p><p><strong>Retries:</strong> {selectedSms.retryCount}</p></div></div></div>)}
    </div>
  );
}

export default SmsQueue;