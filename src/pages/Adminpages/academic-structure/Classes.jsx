import { useState } from 'react';
import { Users, Plus, Edit, Eye, Trash2, UserCheck, AlertTriangle, X, BookOpen,CheckCircle, School, TrendingUp } from 'lucide-react';
import '../../../styles/classes.css';

function Classes() {
  const [classes, setClasses] = useState([
    { id: 1, className: 'JHS 1 Science A', classCode: 'JHS1-SCI-A', level: 'JHS 1', programme: null, academicYear: '2024-2025', formMaster: 'Mr. John Doe', capacity: 40, currentEnrollment: 38, isActive: true },
    { id: 2, className: 'JHS 1 Science B', classCode: 'JHS1-SCI-B', level: 'JHS 1', programme: null, academicYear: '2024-2025', formMaster: 'Mrs. Jane Smith', capacity: 40, currentEnrollment: 37, isActive: true },
    { id: 3, className: 'SHS 1 Science A', classCode: 'SHS1-SCI-A', level: 'SHS 1', programme: 'General Science', academicYear: '2024-2025', formMaster: 'Dr. James Wilson', capacity: 45, currentEnrollment: 44, isActive: true },
    { id: 4, className: 'SHS 1 Arts A', classCode: 'SHS1-ART-A', level: 'SHS 1', programme: 'General Arts', academicYear: '2024-2025', formMaster: 'Ms. Sarah Johnson', capacity: 45, currentEnrollment: 30, isActive: true },
    { id: 5, className: 'JHS 2 Science A', classCode: 'JHS2-SCI-A', level: 'JHS 2', programme: null, academicYear: '2024-2025', formMaster: 'Mr. Michael Brown', capacity: 40, currentEnrollment: 25, isActive: false }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showFormMasterModal, setShowFormMasterModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    level: '',
    programme: '',
    academicYear: '2024-2025',
    formMaster: '',
    capacity: '',
    isActive: true
  });

  const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
  const programmes = ['General Science', 'General Arts', 'Business', 'Visual Arts', 'Home Economics'];
  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson', 'Mr. Michael Brown', 'Mrs. Emily Davis'];
  const academicYears = ['2022-2023', '2023-2024', '2024-2025'];

  const students = [
    { id: 1, name: 'Alice Johnson', admissionNo: '2024-001', gender: 'Female', parentContact: '+1234567890' },
    { id: 2, name: 'Bob Smith', admissionNo: '2024-002', gender: 'Male', parentContact: '+1234567891' },
    { id: 3, name: 'Charlie Brown', admissionNo: '2024-003', gender: 'Male', parentContact: '+1234567892' },
    { id: 4, name: 'Diana Prince', admissionNo: '2024-004', gender: 'Female', parentContact: '+1234567893' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditClass = () => {
    if (!formData.className || !formData.classCode || !formData.level || !formData.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...formData, currentEnrollment: c.currentEnrollment } : c));
    } else {
      const newClass = { id: Date.now(), ...formData, currentEnrollment: 0 };
      setClasses(prev => [...prev, newClass]);
    }
    setShowModal(false);
    setEditingClass(null);
    setFormData({ className: '', classCode: '', level: '', programme: '', academicYear: '2024-2025', formMaster: '', capacity: '', isActive: true });
  };

  const handleDeleteClass = (classItem) => {
    if (classItem.currentEnrollment > 0) {
      alert(`Cannot delete ${classItem.className} because it has ${classItem.currentEnrollment} enrolled students.`);
      return;
    }
    if (window.confirm(`Delete ${classItem.className}?`)) {
      setClasses(prev => prev.filter(c => c.id !== classItem.id));
    }
  };

  const getCapacityPercentage = (current, capacity) => (current / capacity) * 100;
  const getCapacityStatus = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="classes-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Classes</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage all classes with form masters and capacity tracking</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Class</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gap: '1rem' }}>
        {classes.map(classItem => {
          const capacityPercent = getCapacityPercentage(classItem.currentEnrollment, classItem.capacity);
          const capacityStatus = getCapacityStatus(capacityPercent);
          return (
            <div key={classItem.id} className={`class-card ${capacityStatus === 'warning' || capacityStatus === 'danger' ? 'warning' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{classItem.className}</h3>
                    <span className="status-badge status-active">{classItem.classCode}</span>
                    {classItem.isActive ? <span className="status-badge status-active"><CheckCircle size={12} /> Active</span> : <span className="status-badge status-inactive">Inactive</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                    <span><School size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.level}</span>
                    {classItem.programme && <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.programme}</span>}
                    <span><UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />Form Master: {classItem.formMaster || 'Not Assigned'}</span>
                    <span><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.currentEnrollment}/{classItem.capacity} Students</span>
                  </div>
                  <div className="capacity-bar">
                    <div className={`capacity-fill ${capacityStatus === 'warning' ? 'warning' : capacityStatus === 'danger' ? 'danger' : ''}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                  </div>
                  {capacityPercent >= 90 && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> Capacity warning: {capacityPercent.toFixed(0)}% full</div>}
                </div>
                <div className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => { setEditingClass(classItem); setFormData(classItem); setShowModal(true); }}><Edit size={16} /></button>
                  <button className="action-btn set-current-btn" onClick={() => { setSelectedClass(classItem); setShowRosterModal(true); }}><Eye size={16} /> Roster</button>
                  <button className="action-btn edit-btn" onClick={() => { setSelectedClass(classItem); setShowFormMasterModal(true); }}><UserCheck size={16} /> Assign Master</button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteClass(classItem)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Modal */}
      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingClass(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingClass(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label>Class Name <span className="required">*</span></label><input type="text" name="className" className="form-input" value={formData.className} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Class Code <span className="required">*</span></label><input type="text" name="classCode" className="form-input" value={formData.classCode} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Level <span className="required">*</span></label><select name="level" className="form-select" value={formData.level} onChange={handleInputChange}><option value="">Select Level</option>{levels.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div className="form-group"><label>Programme (SHS only)</label><select name="programme" className="form-select" value={formData.programme} onChange={handleInputChange}><option value="">None</option>{programmes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="form-group"><label>Form Master</label><select name="formMaster" className="form-select" value={formData.formMaster} onChange={handleInputChange}><option value="">Select Teacher</option>{teachers.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="form-group"><label>Capacity <span className="required">*</span></label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Academic Year</label><select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>{academicYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            <div className="form-group"><label><input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} /> Is Active?</label></div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingClass(null); }}>Cancel</button><button className="button" onClick={handleAddEditClass}>{editingClass ? 'Save' : 'Add'}</button></div>
        </div>
      </div>}

      {/* Roster Modal */}
      {showRosterModal && selectedClass && <div className="modal-overlay" onClick={() => setShowRosterModal(false)}>
        <div className="modal-container roster-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Student Roster - {selectedClass.className}</h2><X className="modal-close" size={20} onClick={() => setShowRosterModal(false)} /></div>
          <div className="modal-body"><div className="student-list">{students.map(s => <div key={s.id} className="student-item"><div><strong>{s.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Admission: {s.admissionNo} | {s.gender}</div></div><div style={{ fontSize: '0.75rem' }}>{s.parentContact}</div></div>)}</div></div>
          <div className="modal-footer"><button className="button" onClick={() => setShowRosterModal(false)}>Close</button></div>
        </div>
      </div>}

      {/* Assign Form Master Modal */}
      {showFormMasterModal && selectedClass && <div className="modal-overlay" onClick={() => setShowFormMasterModal(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Assign Form Master - {selectedClass.className}</h2><X className="modal-close" size={20} onClick={() => setShowFormMasterModal(false)} /></div>
          <div className="modal-body"><div className="form-group"><label>Select Form Master</label><select className="form-select" value={selectedClass.formMaster || ''} onChange={(e) => setClasses(prev => prev.map(c => c.id === selectedClass.id ? { ...c, formMaster: e.target.value } : c))}><option value="">None</option>{teachers.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
          <div className="modal-footer"><button className="button" onClick={() => setShowFormMasterModal(false)}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}

export default Classes;