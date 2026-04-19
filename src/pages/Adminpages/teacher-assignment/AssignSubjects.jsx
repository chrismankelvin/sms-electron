import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, UserCheck, AlertCircle, X } from 'lucide-react';
import '../../../styles/assign-subjects.css';

function AssignSubjects() {
  const [assignments, setAssignments] = useState([
    { id: 1, class: 'JHS 1 Science', subject: 'Mathematics', teacher: 'Mr. John Doe', status: 'Active' },
    { id: 2, class: 'JHS 1 Science', subject: 'English', teacher: 'Mrs. Jane Smith', status: 'Active' },
    { id: 3, class: 'JHS 1 Science', subject: 'Science', teacher: 'Dr. James Wilson', status: 'Active' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filters, setFilters] = useState({ academicYear: '2024-2025', class: '', subject: '' });
  const [formData, setFormData] = useState({ class: '', subject: '', teacher: '', isActive: true });

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];
  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];
  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddEditAssignment = () => {
    if (!formData.class || !formData.subject || !formData.teacher) {
      alert('Please fill in all fields');
      return;
    }

    // Check for conflicts (teacher already assigned to another class at same time)
    const conflict = assignments.find(a => a.teacher === formData.teacher && a.class !== formData.class);
    if (conflict && !editingAssignment) {
      alert(`Warning: ${formData.teacher} is already assigned to ${conflict.class}. This may cause timetable conflicts.`);
    }

    if (editingAssignment) {
      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? { ...a, ...formData } : a));
    } else {
      const newAssignment = { id: Date.now(), ...formData };
      setAssignments(prev => [...prev, newAssignment]);
    }
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({ class: '', subject: '', teacher: '', isActive: true });
  };

  const handleDeleteAssignment = (assignment) => {
    if (window.confirm(`Remove ${assignment.subject} assignment from ${assignment.class}?`)) {
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filters.class && a.class !== filters.class) return false;
    if (filters.subject && a.subject !== filters.subject) return false;
    return true;
  });

  return (
    <div className="assign-subjects-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />Assign Subjects</h1>
        <p style={{ color: 'var(--secondary)' }}>Assign teachers to teach specific subjects in specific classes</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Assignment</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}><option value="">All Classes</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select className="form-select" value={filters.subject} onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}><option value="">All Subjects</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Class</th><th>Subject</th><th>Teacher</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{filteredAssignments.map(a => (<tr key={a.id}><td>{a.class}</td><td><strong>{a.subject}</strong></td><td>{a.teacher}</td><td><span className="status-badge status-active">{a.status}</span></td>
      <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingAssignment(a); setFormData(a); setShowModal(true); }}><Edit size={16} /></button>
      <button className="action-btn delete-btn" onClick={() => handleDeleteAssignment(a)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>

      {showModal && (<div className="modal-overlay" onClick={() => { setShowModal(false); setEditingAssignment(null); }}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingAssignment(null); }} /></div>
        <div className="modal-body"><div className="form-group"><label>Class</label><select name="class" className="form-select" value={formData.class} onChange={handleInputChange}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>Subject</label><select name="subject" className="form-select" value={formData.subject} onChange={handleInputChange}><option value="">Select Subject</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="form-group"><label>Teacher</label><select name="teacher" className="form-select" value={formData.teacher} onChange={handleInputChange}><option value="">Select Teacher</option>{teachers.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div className="form-group"><label><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} /> Is Active?</label></div>
        <div className="alert-info" style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.375rem', fontSize: '0.875rem' }}><AlertCircle size={14} /> Note: Teacher cannot be assigned to two classes at the same time slot</div></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingAssignment(null); }}>Cancel</button><button className="button" onClick={handleAddEditAssignment}>{editingAssignment ? 'Save' : 'Assign'}</button></div>
      </div></div>)}
    </div>
  );
}

export default AssignSubjects;