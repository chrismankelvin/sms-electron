import { useState } from 'react';
import { Users, Plus, Eye, Edit, UserX, Key, Calendar, BookOpen, Clock, Award, Mail, Phone, MapPin, X } from 'lucide-react';
import '../../../styles/staff.css';

function Staff() {
  const [staff, setStaff] = useState([
    { id: 1, staffNumber: 'TCH-001', name: 'Mr. John Doe', role: 'Teacher', department: 'Science', status: 'Active', qualification: "Master's in Mathematics", specialization: 'Mathematics', hiredDate: '2015-08-15' },
    { id: 2, staffNumber: 'TCH-002', name: 'Mrs. Jane Smith', role: 'Teacher', department: 'Languages', status: 'Active', qualification: "Master's in English", specialization: 'English', hiredDate: '2016-09-10' },
    { id: 3, staffNumber: 'ADM-001', name: 'Dr. James Wilson', role: 'Admin', department: 'Administration', status: 'Active', qualification: 'PhD in Education', specialization: 'School Leadership', hiredDate: '2010-01-20' },
    { id: 4, staffNumber: 'TCH-003', name: 'Ms. Sarah Johnson', role: 'Teacher', department: 'Science', status: 'On Leave', qualification: "Bachelor's in Biology", specialization: 'Biology', hiredDate: '2019-08-20' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ staffNumber: '', name: '', role: '', department: '', status: 'Active', qualification: '', specialization: '', hiredDate: '' });

  const roles = ['Admin', 'Teacher', 'TA', 'Accountant', 'Librarian', 'Guidance'];
  const departments = ['Science', 'Languages', 'Mathematics', 'Social Studies', 'Administration', 'Finance'];
  const statuses = ['Active', 'Suspended', 'Terminated', 'On Leave'];

  const qualifications = [
    { subject: 'Mathematics', level: "Master's", certifiedSince: '2015' },
    { subject: 'Physics', level: "Bachelor's", certifiedSince: '2015' }
  ];

  const assignments = [
    { subject: 'Mathematics', class: 'JHS 1 Science', periodsPerWeek: 6 },
    { subject: 'Mathematics', class: 'JHS 2 Science', periodsPerWeek: 6 }
  ];

  const timetable = [
    { time: '8:00-9:00', monday: 'Math - JHS1', tuesday: 'Math - JHS2', wednesday: 'Free', thursday: 'Math - JHS1', friday: 'Math - JHS2' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditStaff = () => {
    if (!formData.name || !formData.role) { alert('Please fill in required fields'); return; }
    if (editingStaff) { setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s)); }
    else { const newStaff = { id: Date.now(), ...formData, staffNumber: `STAFF-${String(staff.length + 1).padStart(3, '0')}` }; setStaff(prev => [...prev, newStaff]); }
    setShowModal(false); setEditingStaff(null); setFormData({ staffNumber: '', name: '', role: '', department: '', status: 'Active', qualification: '', specialization: '', hiredDate: '' });
  };

  const handleTerminate = (staffMember) => {
    if (window.confirm(`Terminate ${staffMember.name}?`)) { setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, status: 'Terminated' } : s)); }
  };

  const handleResetPassword = (staffMember) => {
    alert(`Password reset link sent to ${staffMember.name}'s email`);
  };

  const filteredStaff = staff;

  return (
    <div className="staff-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Staff (Teachers)</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage teaching and administrative staff</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Staff</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Staff #</th><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Qualification</th><th>Specialization</th><th>Hired Date</th><th>Actions</th></tr></thead>
      <tbody>{filteredStaff.map(s => (<tr key={s.id}><td>{s.staffNumber}</td><td><strong>{s.name}</strong></td><td>{s.role}</td><td>{s.department}</td><td><span className={`status-badge status-${s.status.toLowerCase().replace(' ', '-')}`}>{s.status}</span></td><td>{s.qualification}</td><td>{s.specialization}</td><td>{new Date(s.hiredDate).toLocaleDateString()}</td>
      <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setSelectedStaff(s); setShowDetailModal(true); }}><Eye size={16} /></button>
      <button className="action-btn edit-btn" onClick={() => { setEditingStaff(s); setFormData(s); setShowModal(true); }}><Edit size={16} /></button>
      <button className="action-btn delete-btn" onClick={() => handleTerminate(s)}><UserX size={16} /></button>
      <button className="action-btn set-current-btn" onClick={() => handleResetPassword(s)}><Key size={16} /></button></td></tr>))}</tbody></table></div>

      {/* Detail Modal */}
      {showDetailModal && selectedStaff && <div className="modal-overlay" onClick={() => setShowDetailModal(false)}><div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{selectedStaff.name}</h2><X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} /></div>
        <div className="detail-tabs">{['profile', 'employment', 'qualifications', 'assignments', 'timetable', 'workload'].map(tab => (<div key={tab} className={`detail-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>))}</div>
        <div className="modal-body">{activeTab === 'profile' && (<div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}><div><strong>Staff #:</strong> {selectedStaff.staffNumber}</div><div><strong>Name:</strong> {selectedStaff.name}</div><div><strong>Role:</strong> {selectedStaff.role}</div><div><strong>Department:</strong> {selectedStaff.department}</div><div><strong>Status:</strong> {selectedStaff.status}</div><div><strong>Qualification:</strong> {selectedStaff.qualification}</div><div><strong>Specialization:</strong> {selectedStaff.specialization}</div><div><strong>Hired:</strong> {selectedStaff.hiredDate}</div></div></div>)}
        {activeTab === 'qualifications' && (<div>{qualifications.map((q, i) => (<div key={i} className="student-item"><span><strong>{q.subject}</strong> - {q.level}</span><span>Certified: {q.certifiedSince}</span></div>))}</div>)}
        {activeTab === 'assignments' && (<div>{assignments.map((a, i) => (<div key={i} className="student-item"><span>{a.subject} - {a.class}</span><span>{a.periodsPerWeek} periods/week</span></div>))}</div>)}
        {activeTab === 'timetable' && (<div><table className="academic-years-table"><thead><tr><th>Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th></tr></thead><tbody>{timetable.map((t, i) => (<tr key={i}><td>{t.time}</td><td>{t.monday}</td><td>{t.tuesday}</td><td>{t.wednesday}</td><td>{t.thursday}</td><td>{t.friday}</td></tr>))}</tbody></table></div>)}
        {activeTab === 'workload' && (<div><div><strong>Total Periods/Week:</strong> 24</div><div className="workload-bar" style={{ marginTop: '0.5rem' }}><div className="workload-fill" style={{ width: '60%' }}></div></div><div>60% of max capacity (40 periods)</div></div>)}</div>
      </div></div>}

      {/* Staff Modal */}
      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStaff(null); }}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingStaff(null); }} /></div>
        <div className="modal-body"><div className="form-group"><label>Full Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Role *</label><select name="role" className="form-select" value={formData.role} onChange={handleInputChange}><option value="">Select</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="form-group"><label>Department</label><select name="department" className="form-select" value={formData.department} onChange={handleInputChange}><option value="">Select</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div className="form-group"><label>Qualification</label><input type="text" name="qualification" className="form-input" value={formData.qualification} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Specialization</label><input type="text" name="specialization" className="form-input" value={formData.specialization} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Hired Date</label><input type="date" name="hiredDate" className="form-input" value={formData.hiredDate} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Status</label><select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingStaff(null); }}>Cancel</button><button className="button" onClick={handleAddEditStaff}>{editingStaff ? 'Save' : 'Add'}</button></div>
      </div></div>}
    </div>
  );
}

export default Staff;