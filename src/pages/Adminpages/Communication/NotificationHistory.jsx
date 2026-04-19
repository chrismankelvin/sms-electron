import { useState } from 'react';
import { History, Eye, Mail, Smartphone, Bell, MessageSquare, Users, X } from 'lucide-react';
import '../../../styles/notification-history.css';

function NotificationHistory() {
  const [notifications, setNotifications] = useState([
    { id: 1, date: '2024-03-20', title: 'Term 1 Results', recipients: 245, type: 'Email', status: 'Sent', sentBy: 'admin@school.com' },
    { id: 2, date: '2024-03-19', title: 'Staff Meeting', recipients: 50, type: 'SMS', status: 'Sent', sentBy: 'principal@school.com' },
    { id: 3, date: '2024-03-18', title: 'Fee Payment Reminder', recipients: 300, type: 'Push', status: 'Sent', sentBy: 'accounts@school.com' }
  ]);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const getTypeIcon = (type) => {
    if (type === 'Email') return <Mail size={14} />;
    if (type === 'SMS') return <Smartphone size={14} />;
    if (type === 'Push') return <Bell size={14} />;
    return <MessageSquare size={14} />;
  };

  const recipientDetails = [
    { name: 'John Doe', email: 'john@email.com', status: 'Delivered', deliveredAt: '10:01' },
    { name: 'Jane Smith', email: 'jane@email.com', status: 'Delivered', deliveredAt: '10:01' },
    { name: 'Bob Johnson', email: 'bob@email.com', status: 'Failed', deliveredAt: '-' }
  ];

  return (
    <div className="notification-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><History size={28} style={{ display: 'inline', marginRight: '12px' }} />Notification History</h1>
        <p style={{ color: 'var(--secondary)' }}>Audit log of all sent notifications</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Date</th><th>Notification Title</th><th>Recipients</th><th>Type</th><th>Status</th><th>Sent By</th><th>Actions</th></tr></thead>
      <tbody>{notifications.map(n => (<tr key={n.id}><td>{n.date}</td>
      <td><strong>{n.title}</strong></td>
      <td><Users size={14} /> {n.recipients}</td>
      <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{getTypeIcon(n.type)} {n.type}</span></td>
      <td><span className="status-badge status-active">{n.status}</span></td>
      <td>{n.sentBy}</td><td className="action-buttons"><button className="action-btn edit-btn" onClick={() => setSelectedNotification(n)}><Eye size={16} /> Details</button></td></tr>))}</tbody></table></div>

      {selectedNotification && (<div className="modal-overlay" onClick={() => setSelectedNotification(null)}><div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Notification Details</h2><X className="modal-close" size={20} onClick={() => setSelectedNotification(null)} /></div>
        <div className="modal-body"><p><strong>Title:</strong> {selectedNotification.title}</p><p><strong>Date:</strong> {selectedNotification.date}</p><p><strong>Type:</strong> {selectedNotification.type}</p><p><strong>Sent By:</strong> {selectedNotification.sentBy}</p>
        <h4 style={{ marginTop: '1rem' }}>Recipient Delivery Status</h4><div className="recipient-list"><table className="academic-years-table"><thead><tr><th>Recipient</th><th>Contact</th><th>Status</th><th>Delivered At</th></tr></thead>
        <tbody>{recipientDetails.map((r, i) => (<tr key={i}><td>{r.name}</td><td>{r.email}</td><td className={r.status === 'Delivered' ? 'text-success' : 'text-danger'}>{r.status}</td>
        <td>{r.deliveredAt}</td></tr>))}</tbody></table></div></div></div></div>)}
    </div>
  );
}

export default NotificationHistory;