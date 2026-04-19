import { useState } from 'react';
import { Mail, RefreshCw, Eye, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import '../../../styles/email-queue.css';

function EmailQueue() {
  const [emails, setEmails] = useState([
    { id: 1, notification: 'Results Available', recipient: 'parent@email.com', subject: 'Term 1 Results', status: 'Sent', retryCount: 0, createdAt: '10:00', sentAt: '10:01' },
    { id: 2, notification: 'Fee Reminder', recipient: 'john@email.com', subject: 'Fee Payment', status: 'Failed', retryCount: 3, createdAt: '09:00', sentAt: '-' },
    { id: 3, notification: 'Staff Meeting', recipient: 'staff@school.com', subject: 'Meeting Tomorrow', status: 'Pending', retryCount: 0, createdAt: '11:30', sentAt: '-' }
  ]);

  const [selectedEmail, setSelectedEmail] = useState(null);

  const handleRetry = (id) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'Pending', retryCount: e.retryCount + 1 } : e));
    alert(`Retrying email ${id}`);
  };

  const handleCancel = (id) => {
    if (window.confirm('Cancel this pending email?')) {
      setEmails(prev => prev.filter(e => e.id !== id));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Sent') return <CheckCircle size={16} color="#10b981" />;
    if (status === 'Failed') return <AlertCircle size={16} color="#ef4444" />;
    return <Clock size={16} color="#f59e0b" />;
  };

  return (
    <div className="email-queue-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Mail size={28} style={{ display: 'inline', marginRight: '12px' }} />Email Queue</h1>
        <p style={{ color: 'var(--secondary)' }}>Monitor email sending status</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Notification</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Retry Count</th><th>Created At</th><th>Sent At</th><th>Actions</th></tr></thead>
      <tbody>{emails.map(e => (<tr key={e.id}><td><strong>{e.notification}</strong></td>
      <td>{e.recipient}</td>
      <td>{e.subject}</td>
      <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{getStatusIcon(e.status)} {e.status}</span></td>
      <td><span className="retry-count">{e.retryCount}</span></td>
      <td>{e.createdAt}</td>
      <td>{e.sentAt}</td>
      <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => setSelectedEmail(e)}><Eye size={16} /></button>
      {e.status === 'Failed' && <button className="action-btn set-current-btn" onClick={() => handleRetry(e.id)}><RefreshCw size={16} /> Retry</button>}
      {e.status === 'Pending' && <button className="action-btn delete-btn" onClick={() => handleCancel(e.id)}><X size={16} /> Cancel</button>}</td></tr>))}</tbody></table></div>

      {selectedEmail && (<div className="modal-overlay" onClick={() => setSelectedEmail(null)}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Email Details</h2><X className="modal-close" size={20} onClick={() => setSelectedEmail(null)} /></div>
        <div className="modal-body"><p><strong>To:</strong> {selectedEmail.recipient}</p><p><strong>Subject:</strong> {selectedEmail.subject}</p>
        <p><strong>Status:</strong> {selectedEmail.status}</p><p><strong>Created:</strong> {selectedEmail.createdAt}</p><p><strong>Sent:</strong> {selectedEmail.sentAt}</p>
        <p><strong>Retries:</strong> {selectedEmail.retryCount}</p></div></div></div>)}
    </div>
  );
}

export default EmailQueue;