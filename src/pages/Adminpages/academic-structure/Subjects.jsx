
import { useState } from 'react';
import { Book, Plus, Edit, Trash2, Users, Layers, BookOpen, X, CheckCircle, Target, GraduationCap } from 'lucide-react';
import '../../../styles/subjects.css';

function Subjects() {
  const [subjects, setSubjects] = useState([
    { id: 1, subjectName: 'Mathematics', subjectCode: 'MATH101', type: 'Core', category: 'BOTH', description: 'Fundamental mathematics including algebra, geometry, and calculus' },
    { id: 2, subjectName: 'English Language', subjectCode: 'ENG101', type: 'Core', category: 'BOTH', description: 'English language, literature, and composition' },
    { id: 3, subjectName: 'Biology', subjectCode: 'BIO201', type: 'Elective', category: 'SHS', description: 'Study of living organisms' },
    { id: 4, subjectName: 'Chemistry', subjectCode: 'CHEM201', type: 'Elective', category: 'SHS', description: 'Study of matter and its properties' },
    { id: 5, subjectName: 'Physics', subjectCode: 'PHY201', type: 'Elective', category: 'SHS', description: 'Study of matter, energy, and their interactions' },
    { id: 6, subjectName: 'Social Studies', subjectCode: 'SST101', type: 'Core', category: 'JHS', description: 'History, geography, and civic education' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({ subjectName: '', subjectCode: '', type: 'Core', category: 'BOTH', description: '' });

  const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
  const programmes = ['General Science', 'General Arts', 'Business', 'Visual Arts', 'Home Economics'];
  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditSubject = () => {
    if (!formData.subjectName || !formData.subjectCode) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingSubject) {
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...formData } : s));
    } else {
      const newSubject = { id: Date.now(), ...formData };
      setSubjects(prev => [...prev, newSubject]);
    }
    setShowModal(false);
    setEditingSubject(null);
    setFormData({ subjectName: '', subjectCode: '', type: 'Core', category: 'BOTH', description: '' });
  };

  const handleDeleteSubject = (subject) => {
    if (window.confirm(`Delete ${subject.subjectName}? This will remove it from all assignments.`)) {
      setSubjects(prev => prev.filter(s => s.id !== subject.id));
    }
  };

  return (
    <div className="subjects-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Book size={28} style={{ display: 'inline', marginRight: '12px' }} />Subjects</h1>
        <p style={{ color: 'var(--secondary)' }}>Master list of all subjects taught in the institution</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Subject</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container">
        <table className="academic-years-table">
          <thead><tr><th>Subject Name</th><th>Code</th><th>Type</th><th>Category</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td><strong>{subject.subjectName}</strong></td>
                <td><span className="status-badge status-active">{subject.subjectCode}</span></td>
                <td><span className={`status-badge ${subject.type === 'Core' ? 'subject-type-core' : 'subject-type-elective'}`}>{subject.type}</span></td>
                <td><span className="status-badge status-inactive">{subject.category}</span></td>
                <td style={{ maxWidth: '300px' }}>{subject.description}</td>
                <td className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => { setEditingSubject(subject); setFormData(subject); setShowModal(true); }}><Edit size={16} /></button>
                  <button className="action-btn set-current-btn" onClick={() => { setSelectedSubject(subject); setShowLevelModal(true); }}><Target size={16} /> Levels</button>
                  {subject.type === 'Elective' && <button className="action-btn edit-btn" onClick={() => { setSelectedSubject(subject); setShowProgrammeModal(true); }}><GraduationCap size={16} /> Programmes</button>}
                  <button className="action-btn archive-btn" onClick={() => { setSelectedSubject(subject); setShowTeachersModal(true); }}><Users size={16} /> Teachers</button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteSubject(subject)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject Modal */}
      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSubject(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingSubject ? 'Edit Subject' : 'Add Subject'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingSubject(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label>Subject Name <span className="required">*</span></label><input type="text" name="subjectName" className="form-input" value={formData.subjectName} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Subject Code <span className="required">*</span></label><input type="text" name="subjectCode" className="form-input" value={formData.subjectCode} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="Core">Core (Required for all)</option><option value="Elective">Elective (Optional)</option></select></div>
            <div className="form-group"><label>Category</label><select name="category" className="form-select" value={formData.category} onChange={handleInputChange}><option value="JHS">JHS Only</option><option value="SHS">SHS Only</option><option value="BOTH">Both Levels</option></select></div>
            <div className="form-group"><label>Description</label><textarea name="description" className="form-textarea" value={formData.description} onChange={handleInputChange} rows="3"></textarea></div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingSubject(null); }}>Cancel</button><button className="button" onClick={handleAddEditSubject}>{editingSubject ? 'Save' : 'Add'}</button></div>
        </div>
      </div>}

      {/* Assign to Levels Modal */}
      {showLevelModal && selectedSubject && <div className="modal-overlay" onClick={() => setShowLevelModal(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Assign {selectedSubject.subjectName} to Levels</h2><X className="modal-close" size={20} onClick={() => setShowLevelModal(false)} /></div>
          <div className="modal-body"><div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{levels.map(level => <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked={level.includes('JHS') && selectedSubject.category !== 'SHS'} /> {level}</label>)}</div></div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => setShowLevelModal(false)}>Cancel</button><button className="button" onClick={() => setShowLevelModal(false)}>Save Assignments</button></div>
        </div>
      </div>}

      {/* Assign to Programmes Modal */}
      {showProgrammeModal && selectedSubject && <div className="modal-overlay" onClick={() => setShowProgrammeModal(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Assign {selectedSubject.subjectName} to Programmes</h2><X className="modal-close" size={20} onClick={() => setShowProgrammeModal(false)} /></div>
          <div className="modal-body"><div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{programmes.map(prog => <label key={prog} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked={prog === 'General Science' && selectedSubject.subjectName === 'Biology'} /> {prog}</label>)}</div></div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => setShowProgrammeModal(false)}>Cancel</button><button className="button" onClick={() => setShowProgrammeModal(false)}>Save Assignments</button></div>
        </div>
      </div>}

      {/* View Teachers Modal */}
      {showTeachersModal && selectedSubject && <div className="modal-overlay" onClick={() => setShowTeachersModal(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Teachers Qualified for {selectedSubject.subjectName}</h2><X className="modal-close" size={20} onClick={() => setShowTeachersModal(false)} /></div>
          <div className="modal-body"><div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{teachers.map(teacher => <div key={teacher} className="student-item"><span>{teacher}</span><CheckCircle size={16} color="#10b981" /></div>)}</div></div>
          <div className="modal-footer"><button className="button" onClick={() => setShowTeachersModal(false)}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}

export default Subjects;