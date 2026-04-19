import { useState } from 'react';
import { Shield, Save, CheckCircle, XCircle, X, Users, BookOpen, Calendar, FileText, Settings } from 'lucide-react';
import '../../../styles/roles-permissions.css';

function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('Teacher');

  const roles = ['Admin', 'Teacher', 'TA', 'Accountant', 'Parent', 'Student'];

  const modules = ['Students', 'Staff', 'Subjects', 'Assessments', 'Scores (own classes)', 'Scores (all)', 'Results', 'Attendance', 'Promotions', 'Users'];

  const [permissions, setPermissions] = useState({
    Admin: { Students: { view: true, create: true, edit: true, delete: true, publish: false, export: true } },
    Teacher: { Students: { view: true, create: false, edit: true, delete: false, publish: false, export: true } }
  });

  const handlePermissionChange = (module, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: { ...prev[selectedRole]?.[module], [action]: value }
      }
    }));
  };

  const handleSave = () => {
    alert(`Permissions for ${selectedRole} saved successfully!`);
  };

  return (
    <div className="roles-permissions-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Shield size={28} style={{ display: 'inline', marginRight: '12px' }} />Roles & Permissions</h1>
        <p style={{ color: 'var(--secondary)' }}>Define what each role can access</p></div>
        <button className="button" onClick={handleSave}><Save size={16} /> Save Changes</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <label>Select Role:</label>
        <select className="form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ width: '150px' }}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select>
      </div>

      <div className="permission-matrix"><table className="academic-years-table"><thead><tr><th>Module</th><th>View</th><th>Create</th><th>Edit</th><th>Delete</th><th>Publish</th><th>Export</th></tr></thead>
      <tbody>{modules.map(module => (<tr key={module}><td><strong>{module}</strong></td>
      {['view', 'create', 'edit', 'delete', 'publish', 'export'].map(action => (<td key={action} className="permission-cell"><input type="checkbox" className="permission-checkbox" checked={permissions[selectedRole]?.[module]?.[action] || false} onChange={(e) => handlePermissionChange(module, action, e.target.checked)} disabled={selectedRole === 'Student' && action === 'delete'} /></td>))}</tr>))}</tbody></table></div>
    </div>
  );
}

export default RolesPermissions;