import { useState } from 'react';
import { Settings, Search, Save, Bell, Mail, Smartphone, MessageSquare, X } from 'lucide-react';
import '../../../styles/user-preferences.css';

function UserPreferences() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const users = ['John Doe (Teacher)', 'Jane Smith (Parent)', 'Bob Johnson (Student)'];
  
  const [preferences, setPreferences] = useState({
    'John Doe (Teacher)': {
      'Academic': { email: true, sms: false, push: true, inApp: true },
      'Attendance': { email: true, sms: true, push: true, inApp: true },
      'Fee': { email: true, sms: true, push: false, inApp: true },
      'Event': { email: false, sms: false, push: true, inApp: true },
      'System': { email: true, sms: false, push: false, inApp: true }
    }
  });

  const categories = ['Academic', 'Attendance', 'Fee', 'Event', 'System'];
  const channels = ['email', 'sms', 'push', 'inApp'];
  const channelIcons = { email: Mail, sms: Smartphone, push: Bell, inApp: MessageSquare };

  const handleSearch = () => {
    const found = users.find(u => u.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) { setSelectedUser(found); }
    else { alert('User not found'); }
  };

  const handleToggle = (category, channel) => {
    setPreferences(prev => ({
      ...prev,
      [selectedUser]: {
        ...prev[selectedUser],
        [category]: {
          ...prev[selectedUser]?.[category],
          [channel]: !prev[selectedUser]?.[category]?.[channel]
        }
      }
    }));
  };

  const handleSave = () => {
    alert(`Preferences saved for ${selectedUser}`);
  };

  const userPrefs = selectedUser ? preferences[selectedUser] : null;

  return (
    <div className="user-preferences-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Settings size={28} style={{ display: 'inline', marginRight: '12px' }} />User Preferences</h1>
        <p style={{ color: 'var(--secondary)' }}>Let users control which notifications they receive</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', gap: '1rem' }}><input type="text" className="form-input" placeholder="Search user by name" style={{ flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <button className="button" onClick={handleSearch}><Search size={16} /> Search</button></div></div>

      {selectedUser && userPrefs && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Notification Preferences for {selectedUser}</h3>
      <table className="preference-table"><thead><tr><th>Category</th><th><Mail size={14} /> Email</th><th><Smartphone size={14} /> SMS</th><th><Bell size={14} /> Push</th><th><MessageSquare size={14} /> In-App</th></tr></thead>
      <tbody>{categories.map(cat => (<tr key={cat}><td><strong>{cat}</strong></td>
      {channels.map(ch => (<td key={ch}><input type="checkbox" checked={userPrefs[cat]?.[ch] || false} onChange={() => handleToggle(cat, ch)} /></td>))}</tr>))}</tbody></table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}><button className="button" onClick={handleSave}><Save size={16} /> Save Preferences</button></div></div>)}
    </div>
  );
}

export default UserPreferences;