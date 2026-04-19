import { useState } from 'react';
import { Send, Save, Calendar, Users, Mail, Smartphone, Bell, MessageSquare, Eye, X, Clock } from 'lucide-react';
import '../../../styles/send-notification.css';

function SendNotification() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    types: { email: true, sms: false, push: true, inApp: true },
    priority: 'Medium',
    recipientType: 'All Students',
    specificClass: '',
    specificUser: '',
    scheduleLater: false,
    scheduleDate: '',
    scheduleTime: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'SHS 1 Arts'];
  const users = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'email' || name === 'sms' || name === 'push' || name === 'inApp') {
        setFormData(prev => ({ ...prev, types: { ...prev.types, [name]: checked } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSend = () => {
    if (!formData.title || !formData.body) {
      alert('Please fill in title and message body');
      return;
    }
    if (window.confirm(`Send notification to ${formData.recipientType}?`)) {
      alert(`Notification "${formData.title}" sent successfully!`);
      console.log('Notification sent:', formData);
    }
  };

  const handleSaveDraft = () => {
    alert('Notification saved as draft');
  };

  const selectedTypes = Object.entries(formData.types).filter(([_, v]) => v).map(([k]) => k);

  return (
    <div className="send-notification-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Send size={28} style={{ display: 'inline', marginRight: '12px' }} />Send Notification</h1>
        <p style={{ color: 'var(--secondary)' }}>Compose and send notifications to users</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card">
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Step 1: Compose Message</h3>
        <div className="form-group"><label>Title *</label><input type="text" name="title" className="form-input" value={formData.title} onChange={handleInputChange} placeholder="Notification title" /></div>
        <div className="form-group"><label>Message Body *</label><textarea name="body" className="form-textarea" rows="5" value={formData.body} onChange={handleInputChange} placeholder="Write your message here..."></textarea></div>
        
        <div className="form-group"><label>Notification Type</label><div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label><input type="checkbox" name="email" checked={formData.types.email} onChange={handleInputChange} /> <Mail size={14} /> Email</label>
          <label><input type="checkbox" name="sms" checked={formData.types.sms} onChange={handleInputChange} /> <Smartphone size={14} /> SMS</label>
          <label><input type="checkbox" name="push" checked={formData.types.push} onChange={handleInputChange} /> <Bell size={14} /> Push</label>
          <label><input type="checkbox" name="inApp" checked={formData.types.inApp} onChange={handleInputChange} /> <MessageSquare size={14} /> In-App</label>
        </div></div>

        <div className="form-group"><label>Priority</label><select name="priority" className="form-select" value={formData.priority} onChange={handleInputChange}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>

        <h3 style={{ fontWeight: '600', margin: '1rem 0' }}>Step 2: Select Recipients</h3>
        <div className="recipient-selector">
          <div className="form-group"><label>Send to</label><select name="recipientType" className="form-select" value={formData.recipientType} onChange={handleInputChange}>
            <option>All Students</option><option>All Parents</option><option>All Teachers</option><option>Specific Class</option><option>Specific Role</option><option>Specific User</option>
          </select></div>
          {formData.recipientType === 'Specific Class' && (<div className="form-group"><label>Select Class</label><select name="specificClass" className="form-select" value={formData.specificClass} onChange={handleInputChange}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>)}
          {formData.recipientType === 'Specific User' && (<div className="form-group"><label>Select User</label><select name="specificUser" className="form-select" value={formData.specificUser} onChange={handleInputChange}><option value="">Select User</option>{users.map(u => <option key={u} value={u}>{u}</option>)}</select></div>)}
        </div>

        <h3 style={{ fontWeight: '600', margin: '1rem 0' }}>Step 3: Schedule (Optional)</h3>
        <div className="form-group"><label><input type="checkbox" name="scheduleLater" checked={formData.scheduleLater} onChange={handleInputChange} /> Schedule for Later</label></div>
        {formData.scheduleLater && (<div style={{ display: 'flex', gap: '1rem' }}><input type="date" name="scheduleDate" className="form-input" value={formData.scheduleDate} onChange={handleInputChange} />
        <input type="time" name="scheduleTime" className="form-input" value={formData.scheduleTime} onChange={handleInputChange} /></div>)}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="button button-secondary" onClick={() => setShowPreview(!showPreview)}><Eye size={16} /> Preview</button>
          <button className="button button-secondary" onClick={handleSaveDraft}><Save size={16} /> Save as Draft</button>
          <button className="button" onClick={handleSend}><Send size={16} /> Send</button>
        </div>

        {showPreview && (<div className="preview-card"><h4>Preview</h4><p><strong>Title:</strong> {formData.title || '[No Title]'}</p>
        <p><strong>Message:</strong> {formData.body || '[No Message]'}</p><p><strong>Via:</strong> {selectedTypes.map(t => <span key={t} className={`type-badge type-${t}`} style={{ marginLeft: '0.25rem' }}>{t}</span>)}</p>
        <p><strong>Recipients:</strong> {formData.recipientType}</p></div>)}
      </div>
    </div>
  );
}

export default SendNotification;