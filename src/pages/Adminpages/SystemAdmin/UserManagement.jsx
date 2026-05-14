// import { useState } from 'react';
// import { Users, Plus, Edit, Key, Power, Trash2, Mail, Shield, X, CheckCircle, AlertCircle } from 'lucide-react';
// import '../../../styles/user-management.css';

// function UserManagement() {
//   const [users, setUsers] = useState([
//     { id: 1, username: 'john.doe', email: 'john@school.edu', role: 'Teacher', status: 'Active', lastLogin: '2024-03-20', createdAt: '2023-01-01' },
//     { id: 2, username: 'admin', email: 'admin@school.com', role: 'Admin', status: 'Active', lastLogin: '2024-03-20', createdAt: '2022-01-01' },
//     { id: 3, username: 'jane.smith', email: 'jane@school.edu', role: 'Teacher', status: 'Suspended', lastLogin: '2024-03-15', createdAt: '2023-06-01' }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [formData, setFormData] = useState({ linkToPerson: 'yes', personSearch: '', username: '', email: '', role: 'Teacher', sendWelcome: true });

//   const roles = ['Admin', 'Teacher', 'TA', 'Accountant', 'Parent', 'Student'];

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const handleAddEditUser = () => {
//     if (!formData.username || !formData.email) { alert('Please fill in required fields'); return; }
//     if (editingUser) {
//       setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
//     } else {
//       const newUser = { id: Date.now(), ...formData, status: 'Active', lastLogin: '-', createdAt: new Date().toISOString().split('T')[0] };
//       setUsers(prev => [...prev, newUser]);
//     }
//     setShowModal(false);
//     setEditingUser(null);
//     setFormData({ linkToPerson: 'yes', personSearch: '', username: '', email: '', role: 'Teacher', sendWelcome: true });
//   };

//   const handleResetPassword = (user) => {
//     alert(`Password reset link sent to ${user.email}`);
//   };

//   const handleSuspendUser = (user) => {
//     setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
//   };

//   const handleDeleteUser = (user) => {
//     if (window.confirm(`Delete user ${user.username}?`)) {
//       setUsers(prev => prev.filter(u => u.id !== user.id));
//     }
//   };

//   return (
//     <div className="user-management-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />User Management</h1>
//         <p style={{ color: 'var(--secondary)' }}>Manage system user accounts</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Create User</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="table-container"><table className="academic-years-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Created</th><th>Actions</th></tr></thead>
//       <tbody>{users.map(u => (<tr key={u.id}><td><strong>{u.username}</strong></td>
//       <td>{u.email}</td>
//       <td><span className="status-badge status-active">{u.role}</span></td>
//       <td><span className={`status-badge ${u.status === 'Active' ? 'user-status-active' : 'user-status-suspended'}`}>{u.status}</span></td>
//       <td>{u.lastLogin}</td>
//       <td>{u.createdAt}</td>
//       <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingUser(u); setFormData(u); setShowModal(true); }}><Edit size={16} /></button>
//       <button className="action-btn set-current-btn" onClick={() => handleResetPassword(u)}><Key size={16} /></button>
//       <button className="action-btn archive-btn" onClick={() => handleSuspendUser(u)}><Power size={16} /> {u.status === 'Active' ? 'Suspend' : 'Activate'}</button>
//       <button className="action-btn delete-btn" onClick={() => handleDeleteUser(u)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>

//       {showModal && (<div className="modal-overlay" onClick={() => { setShowModal(false); setEditingUser(null); }}><div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
//         <div className="modal-header"><h2>{editingUser ? 'Edit User' : 'Create User'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingUser(null); }} /></div>
//         <div className="modal-body"><div className="form-group"><label>Link to existing person?</label><select name="linkToPerson" className="form-select" value={formData.linkToPerson} onChange={handleInputChange}><option value="yes">Yes</option><option value="no">No (Create new person)</option></select></div>
//         {formData.linkToPerson === 'yes' ? (<div className="form-group"><label>Search Person</label><input type="text" className="form-input" placeholder="Search by name or email" /></div>) : (<><div className="form-group"><label>First Name</label><input type="text" className="form-input" /></div><div className="form-group"><label>Last Name</label><input type="text" className="form-input" /></div></>)}
//         <div className="form-group"><label>Username</label><input type="text" name="username" className="form-input" value={formData.username} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} /></div>
//         <div className="form-group"><label>Role</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
//         <div className="form-group"><label><input type="checkbox" name="sendWelcome" checked={formData.sendWelcome} onChange={handleInputChange} /> Send welcome email with password setup link</label></div></div>
//         <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingUser(null); }}>Cancel</button><button className="button" onClick={handleAddEditUser}>{editingUser ? 'Save' : 'Create'}</button></div>
//       </div></div>)}
//     </div>
//   );
// }

// export default UserManagement;


// src/components/Admin/UserManagement.jsx

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Key, 
  Power, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../../../styles/user-management.css';
import { userService } from '../../../services/userService';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, total_pages: 0 });
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    role: 'teacher', 
    send_welcome: true 
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [roles, setRoles] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadRoles();
    loadUsers();
  }, [pagination.page, pagination.page_size, filters]);

  const loadRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.getAll(
        filters.role || null,
        filters.status || null,
        filters.search || null,
        pagination.page,
        pagination.page_size
      );
      setUsers(result.data);
      setPagination({
        page: result.page,
        page_size: result.page_size,
        total: result.total,
        total_pages: result.total_pages
      });
    } catch (error) {
      showAlert('Failed to load users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const result = await userService.create({
        username: formData.username.trim(),
        email: formData.email,
        role: formData.role,
        send_welcome: formData.send_welcome
      });
      
      showAlert(`User created successfully! Temporary password: ${result.temporary_password}`, 'success');
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      if (error.message.includes('Username already exists')) {
        setErrors({ username: error.message });
      } else if (error.message.includes('Email already exists')) {
        setErrors({ email: error.message });
      } else {
        showAlert('Failed to create user: ' + error.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await userService.update(editingUser.id, {
        username: formData.username.trim(),
        email: formData.email,
        role: formData.role
      });
      
      showAlert('User updated successfully!', 'success');
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      showAlert('Failed to update user: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`Reset password for ${user.username}? A new temporary password will be generated.`)) {
      try {
        setSaving(true);
        const result = await userService.resetPassword(user.id);
        showAlert(`Password reset successful! New temporary password: ${result.temporary_password}`, 'success');
      } catch (error) {
        showAlert('Failed to reset password: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user ${user.username}?`)) {
      try {
        setSaving(true);
        await userService.toggleStatus(user.id);
        showAlert(`User ${action}ed successfully!`, 'success');
        loadUsers();
      } catch (error) {
        showAlert(`Failed to ${action} user: ` + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await userService.delete(user.id);
        showAlert('User deleted successfully!', 'success');
        loadUsers();
      } catch (error) {
        showAlert('Failed to delete user: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      send_welcome: false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      username: '', 
      email: '', 
      role: 'teacher', 
      send_welcome: true 
    });
    setErrors({});
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'role-admin';
      case 'teacher': return 'role-teacher';
      case 'ta': return 'role-ta';
      case 'accountant': return 'role-accountant';
      case 'student': return 'role-student';
      default: return 'role-default';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      case 'ta': return 'Teaching Assistant';
      case 'accountant': return 'Accountant';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'on_leave': return 'status-on-leave';
      case 'disabled': return 'status-disabled';
      default: return 'status-active';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      <div className="user-header">
        <div className="header-title">
          <h1>
            <Users size={28} />
            User Management
          </h1>
          <p>Manage system user accounts</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} disabled={saving}>
          <Plus size={16} /> Create User
        </button>
      </div>
      <hr className="divider" />

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <Search size={16} />
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search by username or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
        <div className="filter-group">
          <select 
            className="filter-select"
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleLabel(role)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="on_leave">On Leave</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        {(filters.role || filters.status || filters.search) && (
          <button 
            className="filter-clear"
            onClick={() => setFilters({ role: '', status: '', search: '' })}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => openEditModal(user)}
                      disabled={saving}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn reset-btn" 
                      onClick={() => handleResetPassword(user)}
                      disabled={saving}
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      className={`action-btn ${user.status === 'active' ? 'suspend-btn' : 'activate-btn'}`} 
                      onClick={() => handleToggleStatus(user)}
                      disabled={saving}
                      title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                    >
                      <Power size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteUser(user)}
                      disabled={saving}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state-cell">
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No users found</p>
                    <button className="btn-primary" onClick={openCreateModal}>
                      <Plus size={16} /> Create First User
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1 || saving}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button 
            className="page-btn"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.total_pages || saving}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); resetForm(); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username <span className="required">*</span></label>
                <input
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  disabled={saving}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  disabled={saving}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  className={`form-select ${errors.role ? 'error' : ''}`}
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{getRoleLabel(role)}</option>
                  ))}
                </select>
                {errors.role && <span className="error-message">{errors.role}</span>}
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="send_welcome"
                      checked={formData.send_welcome}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                    <span>Send welcome email with password setup link</span>
                  </label>
                  <small className="field-hint">
                    User will receive an email with instructions to set up their password
                  </small>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                disabled={saving}
              >
                {saving ? <Loader size={16} className="spinner" /> : (editingUser ? 'Save Changes' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;