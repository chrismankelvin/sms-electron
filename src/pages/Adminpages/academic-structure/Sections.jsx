import { useState } from 'react';
import { Grid, Plus, Edit, Eye, Trash2, Users, X, Layers } from 'lucide-react';
import '../../../styles/sections.css';

function Sections() {
  const [sections, setSections] = useState([
    { id: 1, sectionName: 'A', parentClass: 'JHS 1 Science', academicYear: '2024-2025', capacity: 40, currentEnrollment: 38 },
    { id: 2, sectionName: 'B', parentClass: 'JHS 1 Science', academicYear: '2024-2025', capacity: 40, currentEnrollment: 37 },
    { id: 3, sectionName: 'Morning', parentClass: 'SHS 1 Science', academicYear: '2024-2025', capacity: 45, currentEnrollment: 30 },
    { id: 4, sectionName: 'Afternoon', parentClass: 'SHS 1 Science', academicYear: '2024-2025', capacity: 45, currentEnrollment: 28 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({ sectionName: '', parentClass: '', academicYear: '2024-2025', capacity: '' });

  const parentClasses = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'SHS 1 Arts', 'SHS 2 Business'];
  const academicYears = ['2022-2023', '2023-2024', '2024-2025'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditSection = () => {
    if (!formData.sectionName || !formData.parentClass || !formData.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingSection) {
      setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, ...formData, currentEnrollment: s.currentEnrollment } : s));
    } else {
      const newSection = { id: Date.now(), ...formData, currentEnrollment: 0 };
      setSections(prev => [...prev, newSection]);
    }
    setShowModal(false);
    setEditingSection(null);
    setFormData({ sectionName: '', parentClass: '', academicYear: '2024-2025', capacity: '' });
  };

  const handleDeleteSection = (section) => {
    if (section.currentEnrollment > 0) {
      alert(`Cannot delete section ${section.sectionName} because it has ${section.currentEnrollment} students.`);
      return;
    }
    if (window.confirm(`Delete section ${section.sectionName}?`)) {
      setSections(prev => prev.filter(s => s.id !== section.id));
    }
  };

  return (
    <div className="sections-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />Sections</h1>
        <p style={{ color: 'var(--secondary)' }}>Subdivide classes into manageable sections</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Section</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {sections.map(section => (
          <div key={section.id} className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <div><h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Section {section.sectionName}</h3><div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{section.parentClass}</div></div>
              <div className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingSection(section); setFormData(section); setShowModal(true); }}><Edit size={16} /></button>
              <button className="action-btn set-current-btn" onClick={() => { setSelectedSection(section); setShowStudentsModal(true); }}><Eye size={16} /></button>
              <button className="action-btn delete-btn" onClick={() => handleDeleteSection(section)}><Trash2 size={16} /></button></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
              <span><Users size={14} style={{ display: 'inline', marginRight: '4px' }} />{section.currentEnrollment}/{section.capacity}</span>
              <span>{section.academicYear}</span>
            </div>
            <div className="capacity-bar" style={{ marginTop: '0.5rem' }}><div className="capacity-fill" style={{ width: `${(section.currentEnrollment / section.capacity) * 100}%` }}></div></div>
          </div>
        ))}
      </div>

      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSection(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingSection ? 'Edit Section' : 'Add Section'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingSection(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label>Section Name <span className="required">*</span></label><input type="text" name="sectionName" className="form-input" value={formData.sectionName} onChange={handleInputChange} placeholder="A, B, C, Morning, Afternoon" /></div>
            <div className="form-group"><label>Parent Class <span className="required">*</span></label><select name="parentClass" className="form-select" value={formData.parentClass} onChange={handleInputChange}><option value="">Select Class</option>{parentClasses.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Capacity <span className="required">*</span></label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Academic Year</label><select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>{academicYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingSection(null); }}>Cancel</button><button className="button" onClick={handleAddEditSection}>{editingSection ? 'Save' : 'Add'}</button></div>
        </div>
      </div>}

      {showStudentsModal && selectedSection && <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Students - Section {selectedSection.sectionName} ({selectedSection.parentClass})</h2><X className="modal-close" size={20} onClick={() => setShowStudentsModal(false)} /></div>
          <div className="modal-body"><p>Student list would appear here. Currently {selectedSection.currentEnrollment} enrolled.</p></div>
          <div className="modal-footer"><button className="button" onClick={() => setShowStudentsModal(false)}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}

export default Sections;