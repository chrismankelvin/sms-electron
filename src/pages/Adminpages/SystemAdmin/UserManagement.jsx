import { useState } from 'react';
import { Users, Plus, Edit, Key, Power, Trash2, Mail, Shield, X, CheckCircle, AlertCircle } from 'lucide-react';
import '../../../styles/user-management.css';

function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, username: 'john.doe', email: 'john@school.edu', role: 'Teacher', status: 'Active', lastLogin: '2024-03-20', createdAt: '2023-01-01' },
    { id: 2, username: 'admin', email: 'admin@school.com', role: 'Admin', status: 'Active', lastLogin: '2024-03-20', createdAt: '2022-01-01' },
    { id: 3, username: 'jane.smith', email: 'jane@school.edu', role: 'Teacher', status: 'Suspended', lastLogin: '2024-03-15', createdAt: '2023-06-01' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ linkToPerson: 'yes', personSearch: '', username: '', email: '', role: 'Teacher', sendWelcome: true });

  const roles = ['Admin', 'Teacher', 'TA', 'Accountant', 'Parent', 'Student'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddEditUser = () => {
    if (!formData.username || !formData.email) { alert('Please fill in required fields'); return; }
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser = { id: Date.now(), ...formData, status: 'Active', lastLogin: '-', createdAt: new Date().toISOString().split('T')[0] };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
    setEditingUser(null);
    setFormData({ linkToPerson: 'yes', personSearch: '', username: '', email: '', role: 'Teacher', sendWelcome: true });
  };

  const handleResetPassword = (user) => {
    alert(`Password reset link sent to ${user.email}`);
  };

  const handleSuspendUser = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Delete user ${user.username}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  return (
    <div className="user-management-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />User Management</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage system user accounts</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Create User</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>{users.map(u => (<tr key={u.id}><td><strong>{u.username}</strong></td>
      <td>{u.email}</td>
      <td><span className="status-badge status-active">{u.role}</span></td>
      <td><span className={`status-badge ${u.status === 'Active' ? 'user-status-active' : 'user-status-suspended'}`}>{u.status}</span></td>
      <td>{u.lastLogin}</td>
      <td>{u.createdAt}</td>
      <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingUser(u); setFormData(u); setShowModal(true); }}><Edit size={16} /></button>
      <button className="action-btn set-current-btn" onClick={() => handleResetPassword(u)}><Key size={16} /></button>
      <button className="action-btn archive-btn" onClick={() => handleSuspendUser(u)}><Power size={16} /> {u.status === 'Active' ? 'Suspend' : 'Activate'}</button>
      <button className="action-btn delete-btn" onClick={() => handleDeleteUser(u)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>

      {showModal && (<div className="modal-overlay" onClick={() => { setShowModal(false); setEditingUser(null); }}><div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{editingUser ? 'Edit User' : 'Create User'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingUser(null); }} /></div>
        <div className="modal-body"><div className="form-group"><label>Link to existing person?</label><select name="linkToPerson" className="form-select" value={formData.linkToPerson} onChange={handleInputChange}><option value="yes">Yes</option><option value="no">No (Create new person)</option></select></div>
        {formData.linkToPerson === 'yes' ? (<div className="form-group"><label>Search Person</label><input type="text" className="form-input" placeholder="Search by name or email" /></div>) : (<><div className="form-group"><label>First Name</label><input type="text" className="form-input" /></div><div className="form-group"><label>Last Name</label><input type="text" className="form-input" /></div></>)}
        <div className="form-group"><label>Username</label><input type="text" name="username" className="form-input" value={formData.username} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Role</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="form-group"><label><input type="checkbox" name="sendWelcome" checked={formData.sendWelcome} onChange={handleInputChange} /> Send welcome email with password setup link</label></div></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingUser(null); }}>Cancel</button><button className="button" onClick={handleAddEditUser}>{editingUser ? 'Save' : 'Create'}</button></div>
      </div></div>)}
    </div>
  );
}

export default UserManagement;