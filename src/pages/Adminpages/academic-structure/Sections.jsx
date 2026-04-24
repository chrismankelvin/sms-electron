// import { useState } from 'react';
// import { Grid, Plus, Edit, Eye, Trash2, Users, X, Layers } from 'lucide-react';
// import '../../../styles/sections.css';

// function Sections() {
//   const [sections, setSections] = useState([
//     { id: 1, sectionName: 'A', parentClass: 'JHS 1 Science', academicYear: '2024-2025', capacity: 40, currentEnrollment: 38 },
//     { id: 2, sectionName: 'B', parentClass: 'JHS 1 Science', academicYear: '2024-2025', capacity: 40, currentEnrollment: 37 },
//     { id: 3, sectionName: 'Morning', parentClass: 'SHS 1 Science', academicYear: '2024-2025', capacity: 45, currentEnrollment: 30 },
//     { id: 4, sectionName: 'Afternoon', parentClass: 'SHS 1 Science', academicYear: '2024-2025', capacity: 45, currentEnrollment: 28 }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [showStudentsModal, setShowStudentsModal] = useState(false);
//   const [editingSection, setEditingSection] = useState(null);
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [formData, setFormData] = useState({ sectionName: '', parentClass: '', academicYear: '2024-2025', capacity: '' });

//   const parentClasses = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'SHS 1 Arts', 'SHS 2 Business'];
//   const academicYears = ['2022-2023', '2023-2024', '2024-2025'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditSection = () => {
//     if (!formData.sectionName || !formData.parentClass || !formData.capacity) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingSection) {
//       setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, ...formData, currentEnrollment: s.currentEnrollment } : s));
//     } else {
//       const newSection = { id: Date.now(), ...formData, currentEnrollment: 0 };
//       setSections(prev => [...prev, newSection]);
//     }
//     setShowModal(false);
//     setEditingSection(null);
//     setFormData({ sectionName: '', parentClass: '', academicYear: '2024-2025', capacity: '' });
//   };

//   const handleDeleteSection = (section) => {
//     if (section.currentEnrollment > 0) {
//       alert(`Cannot delete section ${section.sectionName} because it has ${section.currentEnrollment} students.`);
//       return;
//     }
//     if (window.confirm(`Delete section ${section.sectionName}?`)) {
//       setSections(prev => prev.filter(s => s.id !== section.id));
//     }
//   };

//   return (
//     <div className="sections-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />Sections</h1>
//         <p style={{ color: 'var(--secondary)' }}>Subdivide classes into manageable sections</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Section</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
//         {sections.map(section => (
//           <div key={section.id} className="section-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
//               <div><h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Section {section.sectionName}</h3><div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{section.parentClass}</div></div>
//               <div className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingSection(section); setFormData(section); setShowModal(true); }}><Edit size={16} /></button>
//               <button className="action-btn set-current-btn" onClick={() => { setSelectedSection(section); setShowStudentsModal(true); }}><Eye size={16} /></button>
//               <button className="action-btn delete-btn" onClick={() => handleDeleteSection(section)}><Trash2 size={16} /></button></div>
//             </div>
//             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
//               <span><Users size={14} style={{ display: 'inline', marginRight: '4px' }} />{section.currentEnrollment}/{section.capacity}</span>
//               <span>{section.academicYear}</span>
//             </div>
//             <div className="capacity-bar" style={{ marginTop: '0.5rem' }}><div className="capacity-fill" style={{ width: `${(section.currentEnrollment / section.capacity) * 100}%` }}></div></div>
//           </div>
//         ))}
//       </div>

//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSection(null); }}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>{editingSection ? 'Edit Section' : 'Add Section'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingSection(null); }} /></div>
//           <div className="modal-body">
//             <div className="form-group"><label>Section Name <span className="required">*</span></label><input type="text" name="sectionName" className="form-input" value={formData.sectionName} onChange={handleInputChange} placeholder="A, B, C, Morning, Afternoon" /></div>
//             <div className="form-group"><label>Parent Class <span className="required">*</span></label><select name="parentClass" className="form-select" value={formData.parentClass} onChange={handleInputChange}><option value="">Select Class</option>{parentClasses.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
//             <div className="form-group"><label>Capacity <span className="required">*</span></label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
//             <div className="form-group"><label>Academic Year</label><select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>{academicYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
//           </div>
//           <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingSection(null); }}>Cancel</button><button className="button" onClick={handleAddEditSection}>{editingSection ? 'Save' : 'Add'}</button></div>
//         </div>
//       </div>}

//       {showStudentsModal && selectedSection && <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>Students - Section {selectedSection.sectionName} ({selectedSection.parentClass})</h2><X className="modal-close" size={20} onClick={() => setShowStudentsModal(false)} /></div>
//           <div className="modal-body"><p>Student list would appear here. Currently {selectedSection.currentEnrollment} enrolled.</p></div>
//           <div className="modal-footer"><button className="button" onClick={() => setShowStudentsModal(false)}>Close</button></div>
//         </div>
//       </div>}
//     </div>
//   );
// }

// export default Sections;




// src/components/Academics/Sections.jsx
import { useState } from 'react';
import { Grid, Plus, Edit, Eye, Trash2, Users, X, Layers, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/sections.css';

function Sections() {
  const [sections, setSections] = useState([
    { id: 1, section_name: 'A', class_id: 1, class_name: 'JHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 40, current_enrollment: 38, description: 'Morning section A' },
    { id: 2, section_name: 'B', class_id: 1, class_name: 'JHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 40, current_enrollment: 37, description: 'Afternoon section B' },
    { id: 3, section_name: 'Morning', class_id: 3, class_name: 'SHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 45, current_enrollment: 30, description: 'Morning session' },
    { id: 4, section_name: 'Afternoon', class_id: 3, class_name: 'SHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 45, current_enrollment: 28, description: 'Afternoon session' }
  ]);

  const [classes, setClasses] = useState([
    { id: 1, class_name: 'JHS 1 Science', class_code: 'JHS1-SCI-A' },
    { id: 2, class_name: 'JHS 2 Science', class_code: 'JHS2-SCI-A' },
    { id: 3, class_name: 'SHS 1 Science', class_code: 'SHS1-SCI-A' },
    { id: 4, class_name: 'SHS 1 Arts', class_code: 'SHS1-ART-A' },
    { id: 5, class_name: 'SHS 2 Business', class_code: 'SHS2-BUS-A' }
  ]);

  const [academicYears, setAcademicYears] = useState([
    { id: 1, year_label: '2022-2023' },
    { id: 2, year_label: '2023-2024' },
    { id: 3, year_label: '2024-2025' }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedSection, setSelectedSection] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [formData, setFormData] = useState({
    section_name: '',
    class_id: '',
    academic_year_id: '3',
    capacity: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.section_name.trim()) newErrors.section_name = 'Section name is required';
    if (!formData.class_id) newErrors.class_id = 'Parent class is required';
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    
    const capacity = parseInt(formData.capacity);
    if (capacity && (capacity < 1 || capacity > 200)) {
      newErrors.capacity = 'Capacity must be between 1 and 200';
    }
    
    // Check for duplicate (class_id, section_name, academic_year_id) combination
    const existingSection = sections.find(s => 
      s.class_id === parseInt(formData.class_id) && 
      s.section_name.toLowerCase() === formData.section_name.toLowerCase() &&
      s.academic_year_id === parseInt(formData.academic_year_id) &&
      (!selectedSection || s.id !== selectedSection.id)
    );
    if (existingSection) {
      newErrors.section_name = `Section "${formData.section_name}" already exists for this class in the selected academic year`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSection = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedSection) {
      // Update existing section
      setSections(prev => prev.map(s => 
        s.id === selectedSection.id 
          ? { 
              ...s, 
              section_name: formData.section_name,
              class_id: parseInt(formData.class_id),
              class_name: getClassName(parseInt(formData.class_id)),
              academic_year_id: parseInt(formData.academic_year_id),
              academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
              capacity: parseInt(formData.capacity),
              description: formData.description || '',
              updated_at: new Date().toISOString()
            }
          : s
      ));
    } else {
      // Add new section
      const newSection = {
        id: Date.now(),
        section_name: formData.section_name,
        class_id: parseInt(formData.class_id),
        class_name: getClassName(parseInt(formData.class_id)),
        academic_year_id: parseInt(formData.academic_year_id),
        academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
        capacity: parseInt(formData.capacity),
        current_enrollment: 0,
        description: formData.description || '',
        created_at: new Date().toISOString()
      };
      setSections(prev => [...prev, newSection]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setFormData({
      section_name: section.section_name,
      class_id: section.class_id.toString(),
      academic_year_id: section.academic_year_id.toString(),
      capacity: section.capacity.toString(),
      description: section.description || ''
    });
    setView('edit');
  };

  const handleDeleteSection = (section) => {
    if (section.current_enrollment > 0) {
      alert(`Cannot delete section ${section.section_name} because it has ${section.current_enrollment} students.`);
      return;
    }
    if (window.confirm(`Delete section "${section.section_name}" from ${section.class_name}?`)) {
      setSections(prev => prev.filter(s => s.id !== section.id));
    }
  };

  const resetForm = () => {
    setFormData({
      section_name: '',
      class_id: '',
      academic_year_id: '3',
      capacity: '',
      description: ''
    });
    setErrors({});
    setSelectedSection(null);
  };

  const getClassName = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.class_name : 'Unknown Class';
  };

  const getAcademicYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'Unknown Year';
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="sections-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Sections
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Subdivide classes into manageable sections</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} /> Add Section
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {sections.map(section => {
            const percentage = (section.current_enrollment / section.capacity) * 100;
            return (
              <div key={section.id} className="section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Section {section.section_name}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{section.class_name}</div>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => handleEditSection(section)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn set-current-btn" onClick={() => { setSelectedSection(section); setShowStudentsModal(true); }}>
                      <Eye size={16} />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteSection(section)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {section.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{section.description}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                  <span><Users size={14} style={{ display: 'inline', marginRight: '4px' }} />{section.current_enrollment}/{section.capacity}</span>
                  <span>{section.academic_year_label}</span>
                </div>
                <div className="capacity-bar" style={{ marginTop: '0.5rem' }}>
                  <div className="capacity-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                {percentage >= 90 && (
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    ⚠️ Capacity warning: {percentage.toFixed(0)}% full
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Students Modal (kept as modal since it's a view-only action) */}
        {showStudentsModal && selectedSection && (
          <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Students - Section {selectedSection.section_name} ({selectedSection.class_name})</h2>
                <X className="modal-close" size={20} onClick={() => setShowStudentsModal(false)} />
              </div>
              <div className="modal-body">
                <p>Student list would appear here. Currently {selectedSection.current_enrollment} enrolled.</p>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowStudentsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="sections-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <button 
            onClick={() => { resetForm(); setView('list'); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}
          >
            <ArrowLeft size={16} /> Back to Sections
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Section' : `Edit Section: ${selectedSection?.section_name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new section for a class' : 'Update section information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSection(); }}>
          <div className="form-section">
            <h2>Section Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Section Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="section_name"
                  className={`form-input ${errors.section_name ? 'error' : ''}`}
                  value={formData.section_name}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B, Morning, Afternoon"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Name must be unique per class per academic year
                </small>
                {errors.section_name && <span className="error-message">{errors.section_name}</span>}
              </div>

              <div className="form-group">
                <label>Parent Class <span className="required">*</span></label>
                <select
                  name="class_id"
                  className={`form-select ${errors.class_id ? 'error' : ''}`}
                  value={formData.class_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.class_name} ({cls.class_code})</option>
                  ))}
                </select>
                {errors.class_id && <span className="error-message">{errors.class_id}</span>}
              </div>

              <div className="form-group">
                <label>Academic Year <span className="required">*</span></label>
                <select
                  name="academic_year_id"
                  className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
                  value={formData.academic_year_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.year_label}</option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
              </div>

              <div className="form-group">
                <label>Capacity <span className="required">*</span></label>
                <input
                  type="number"
                  name="capacity"
                  className={`form-input ${errors.capacity ? 'error' : ''}`}
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum number of students"
                  min="1"
                  max="200"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Maximum students allowed in this section (1-200)
                </small>
                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of this section"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Section' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Sections;