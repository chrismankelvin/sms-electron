import { useState } from 'react';
import { Users, Plus, Eye, Edit, UserX, Calendar, Briefcase, X } from 'lucide-react';
import '../../../styles/non-staff.css';
import { useNavigate } from 'react-router-dom';

function NonStaff() {
  const [nonStaff, setNonStaff] = useState([
    { id: 1, nonStaffNumber: 'NS-001', name: 'Robert Adjei', role: 'Accountant', department: 'Finance', designation: 'Senior Accountant', hiredDate: '2018-03-10', status: 'Active', nextOfKin: 'Mrs. Adjei - 0244123456' },
    { id: 2, nonStaffNumber: 'NS-002', name: 'Grace Mensah', role: 'Librarian', department: 'Library', designation: 'Head Librarian', hiredDate: '2019-08-15', status: 'Active', nextOfKin: 'Mr. Mensah - 0244123457' }
  ]);

  const navigate =useNavigate();
   const handleNavigation = (path) => {
    navigate(path);
  };
  const [showModal, setShowModal] = useState(false);
  const [editingNonStaff, setEditingNonStaff] = useState(null);
  const [formData, setFormData] = useState({ nonStaffNumber: '', name: '', role: '', department: '', designation: '', hiredDate: '', status: 'Active', nextOfKin: '' });

  const roles = ['Accountant', 'Librarian', 'Administrative Assistant', 'Cleaner', 'Security', 'Driver', 'Cafeteria Staff'];
  const departments = ['Finance', 'Library', 'Administration', 'Facilities', 'Security', 'Catering'];
  const statuses = ['Active', 'Terminated', 'Resigned'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditNonStaff = () => {
    if (!formData.name || !formData.role) { 
      alert('Please fill in required fields'); 
      return; 
    }
    if (editingNonStaff) { 
      setNonStaff(prev => prev.map(n => n.id === editingNonStaff.id ? { ...n, ...formData } : n)); 
    } else { 
      const newNonStaff = { id: Date.now(), ...formData, nonStaffNumber: `NS-${String(nonStaff.length + 1).padStart(3, '0')}` }; 
      setNonStaff(prev => [...prev, newNonStaff]); 
    }
    setShowModal(false); 
    setEditingNonStaff(null); 
    setFormData({ nonStaffNumber: '', name: '', role: '', department: '', designation: '', hiredDate: '', status: 'Active', nextOfKin: '' });
  };

  const handleTerminate = (ns) => {
    if (window.confirm(`Terminate ${ns.name}?`)) { 
      setNonStaff(prev => prev.map(n => n.id === ns.id ? { ...n, status: 'Terminated' } : n)); 
    }
  };

  return (
    <div className="non-staff-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Non-Staff
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Manage non-teaching staff (accountants, librarians, administrative, etc.)</p>
        </div>
        <button className="button" onClick={() => handleNavigation("/registration/non-staff")}>
          <Plus size={16} /> Add Staff
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Non-Staff #</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Hired Date</th>
              <th>Status</th>
              <th>Next of Kin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nonStaff.map(ns => (
              <tr key={ns.id}>
                <td>{ns.nonStaffNumber}</td>
                <td><strong>{ns.name}</strong></td>
                <td><span className="role-badge">{ns.role}</span></td>
                <td>{ns.department}</td>
                <td>{ns.designation}</td>
                <td>{new Date(ns.hiredDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${ns.status.toLowerCase()}`}>{ns.status}</span>
                </td>
                <td>{ns.nextOfKin}</td>
                <td className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => { setEditingNonStaff(ns); setFormData(ns); setShowModal(true); }}>
                    <Edit size={16} />
                  </button>
                  {ns.status === 'Active' && (
                    <button className="action-btn delete-btn" onClick={() => handleTerminate(ns)}>
                      <UserX size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNonStaff ? 'Edit Staff' : 'Add Non-Staff'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingNonStaff(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" className="form-select" value={formData.department} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input type="text" name="designation" className="form-input" value={formData.designation} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Hired Date</label>
                <input type="date" name="hiredDate" className="form-input" value={formData.hiredDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Next of Kin Contact</label>
                <input type="text" name="nextOfKin" className="form-input" value={formData.nextOfKin} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingNonStaff(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditNonStaff}>
                {editingNonStaff ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NonStaff;