// import { useState } from 'react';
// import { BookOpen, Plus, Edit, Trash2, Eye, X, GraduationCap, Bookmark } from 'lucide-react';
// import '../../../styles/programmes.css';

// function Programmes() {
//   const [programmes, setProgrammes] = useState([
//     { id: 1, programmeName: 'General Science', code: 'SCI', category: 'SHS', description: 'Focus on Sciences - Biology, Chemistry, Physics', subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'] },
//     { id: 2, programmeName: 'General Arts', code: 'ART', category: 'SHS', description: 'Focus on Humanities and Social Sciences', subjects: ['Literature', 'History', 'Geography', 'Economics'] },
//     { id: 3, programmeName: 'Business', code: 'BUS', category: 'SHS', description: 'Focus on Commerce and Management', subjects: ['Accounting', 'Business Management', 'Economics', 'Mathematics'] },
//     { id: 4, programmeName: 'General', code: 'GEN', category: 'JHS', description: 'General Junior High School Curriculum', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'French'] }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [showSubjectsModal, setShowSubjectsModal] = useState(false);
//   const [editingProgramme, setEditingProgramme] = useState(null);
//   const [selectedProgramme, setSelectedProgramme] = useState(null);
//   const [formData, setFormData] = useState({ programmeName: '', code: '', category: 'SHS', description: '' });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditProgramme = () => {
//     if (!formData.programmeName || !formData.code) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingProgramme) {
//       setProgrammes(prev => prev.map(p => p.id === editingProgramme.id ? { ...p, ...formData } : p));
//     } else {
//       const newProgramme = { id: Date.now(), ...formData, subjects: [] };
//       setProgrammes(prev => [...prev, newProgramme]);
//     }
//     setShowModal(false);
//     setEditingProgramme(null);
//     setFormData({ programmeName: '', code: '', category: 'SHS', description: '' });
//   };

//   const handleDeleteProgramme = (programme) => {
//     if (window.confirm(`Are you sure you want to delete ${programme.programmeName}?`)) {
//       setProgrammes(prev => prev.filter(p => p.id !== programme.id));
//     }
//   };

//   const openEditModal = (programme) => {
//     setEditingProgramme(programme);
//     setFormData({ programmeName: programme.programmeName, code: programme.code, category: programme.category, description: programme.description || '' });
//     setShowModal(true);
//   };

//   const viewSubjects = (programme) => {
//     setSelectedProgramme(programme);
//     setShowSubjectsModal(true);
//   };

//   return (
//     <div className="programmes-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><GraduationCap size={28} style={{ display: 'inline', marginRight: '12px' }} />Academic Programmes</h1>
//         <p style={{ color: 'var(--secondary)' }}>Define SHS programmes (Science, Arts, Business, etc.)</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Programme</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
//         {programmes.map(prog => (
//           <div key={prog.id} className="programme-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
//               <div><h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{prog.programmeName}</h3>
//               <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
//                 <span className="status-badge status-active" style={{ fontSize: '0.7rem' }}>{prog.code}</span>
//                 <span className={`status-badge ${prog.category === 'JHS' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.7rem' }}>{prog.category}</span>
//               </div></div>
//               <div className="action-buttons">
//                 <button className="action-btn edit-btn" onClick={() => openEditModal(prog)}><Edit size={16} /></button>
//                 <button className="action-btn delete-btn" onClick={() => handleDeleteProgramme(prog)}><Trash2 size={16} /></button>
//               </div>
//             </div>
//             {prog.description && <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>{prog.description}</p>}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
//               <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{prog.subjects?.length || 0} Elective Subjects</span>
//               <button className="button" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => viewSubjects(prog)}><Eye size={14} /> View Subjects</button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Subjects Modal */}
//       {showSubjectsModal && selectedProgramme && (
//         <div className="modal-overlay" onClick={() => setShowSubjectsModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header"><h2>Elective Subjects - {selectedProgramme.programmeName}</h2><X className="modal-close" size={20} onClick={() => setShowSubjectsModal(false)} /></div>
//             <div className="modal-body">
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
//                 {selectedProgramme.subjects?.map((subject, idx) => <span key={idx} className="subject-tag"><Bookmark size={12} style={{ display: 'inline', marginRight: '4px' }} />{subject}</span>)}
//               </div>
//               <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
//                 <strong>Note:</strong> Subjects are managed in the Subjects section. This is a preview of assigned electives.
//               </div>
//             </div>
//             <div className="modal-footer"><button className="button" onClick={() => setShowSubjectsModal(false)}>Close</button></div>
//           </div>
//         </div>
//       )}

//       {/* Programme Modal */}
//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingProgramme(null); }}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>{editingProgramme ? 'Edit Programme' : 'Add New Programme'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingProgramme(null); }} /></div>
//           <div className="modal-body">
//             <div className="form-group"><label className="form-label">Programme Name <span className="required">*</span></label>
//               <input type="text" name="programmeName" className="form-input" value={formData.programmeName} onChange={handleInputChange} /></div>
//             <div className="form-group"><label className="form-label">Programme Code <span className="required">*</span></label>
//               <input type="text" name="code" className="form-input" value={formData.code} onChange={handleInputChange} placeholder="e.g., SCI, ART, BUS" /></div>
//             <div className="form-group"><label className="form-label">Category</label>
//               <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
//                 <option value="JHS">JHS (Junior High School)</option><option value="SHS">SHS (Senior High School)</option></select></div>
//             <div className="form-group"><label className="form-label">Description</label>
//               <textarea name="description" className="form-textarea" value={formData.description} onChange={handleInputChange} rows="3"></textarea></div>
//           </div>
//           <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingProgramme(null); }}>Cancel</button>
//           <button className="button" onClick={handleAddEditProgramme}>{editingProgramme ? 'Save Changes' : 'Add Programme'}</button></div>
//         </div>
//       </div>}
//     </div>
//   );
// }

// export default Programmes;








// src/components/Academics/Programmes.jsx
import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Eye, X, GraduationCap, Bookmark, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/programmes.css';

function Programmes() {
  const [programmes, setProgrammes] = useState([
    { id: 1, name: 'General Science', code: 'SCI', category: 'SHS', description: 'Focus on Sciences - Biology, Chemistry, Physics', subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'] },
    { id: 2, name: 'General Arts', code: 'ART', category: 'SHS', description: 'Focus on Humanities and Social Sciences', subjects: ['Literature', 'History', 'Geography', 'Economics'] },
    { id: 3, name: 'Business', code: 'BUS', category: 'SHS', description: 'Focus on Commerce and Management', subjects: ['Accounting', 'Business Management', 'Economics', 'Mathematics'] },
    { id: 4, name: 'General', code: 'GEN', category: 'JHS', description: 'General Junior High School Curriculum', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'French'] }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'SHS',
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
    if (!formData.name.trim()) newErrors.name = 'Programme name is required';
    if (!formData.code.trim()) newErrors.code = 'Programme code is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Check for duplicate name (UNIQUE constraint)
    const existingName = programmes.find(p => 
      p.name.toLowerCase() === formData.name.toLowerCase() &&
      (!selectedProgramme || p.id !== selectedProgramme.id)
    );
    if (existingName) {
      newErrors.name = `Programme "${formData.name}" already exists`;
    }
    
    // Check for duplicate code (UNIQUE constraint)
    const existingCode = programmes.find(p => 
      p.code.toUpperCase() === formData.code.toUpperCase() &&
      (!selectedProgramme || p.id !== selectedProgramme.id)
    );
    if (existingCode) {
      newErrors.code = `Code "${formData.code.toUpperCase()}" already exists`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProgramme = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedProgramme) {
      // Update existing programme
      setProgrammes(prev => prev.map(p => 
        p.id === selectedProgramme.id 
          ? { 
              ...p, 
              name: formData.name,
              code: formData.code.toUpperCase(),
              category: formData.category,
              description: formData.description || '',
              updated_at: new Date().toISOString()
            }
          : p
      ));
    } else {
      // Add new programme
      const newProgramme = {
        id: Date.now(),
        name: formData.name,
        code: formData.code.toUpperCase(),
        category: formData.category,
        description: formData.description || '',
        subjects: [],
        created_at: new Date().toISOString()
      };
      setProgrammes(prev => [...prev, newProgramme]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditProgramme = (programme) => {
    setSelectedProgramme(programme);
    setFormData({
      name: programme.name,
      code: programme.code,
      category: programme.category,
      description: programme.description || ''
    });
    setView('edit');
  };

  const handleDeleteProgramme = (programme) => {
    if (window.confirm(`Are you sure you want to delete ${programme.name}?`)) {
      setProgrammes(prev => prev.filter(p => p.id !== programme.id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'SHS',
      description: ''
    });
    setErrors({});
    setSelectedProgramme(null);
  };

  const viewSubjects = (programme) => {
    setSelectedProgramme(programme);
    setShowSubjectsModal(true);
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="programmes-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <GraduationCap size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Programmes
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define SHS programmes (Science, Arts, Business, etc.) and JHS curriculum</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} /> Add Programme
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {programmes.map(prog => (
            <div key={prog.id} className="programme-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{prog.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="status-badge status-active" style={{ fontSize: '0.7rem' }}>{prog.code}</span>
                    <span className={`status-badge ${prog.category === 'JHS' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.7rem' }}>
                      {prog.category}
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => handleEditProgramme(prog)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteProgramme(prog)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {prog.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>{prog.description}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  {prog.subjects?.length || 0} Elective Subjects
                </span>
                <button 
                  className="button" 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    fontSize: '0.75rem', 
                    backgroundColor: 'transparent', 
                    border: '1px solid var(--primary)', 
                    color: 'var(--primary)' 
                  }} 
                  onClick={() => viewSubjects(prog)}
                >
                  <Eye size={14} /> View Subjects
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects Modal (kept as modal since it's a view-only action) */}
        {showSubjectsModal && selectedProgramme && (
          <div className="modal-overlay" onClick={() => setShowSubjectsModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Elective Subjects - {selectedProgramme.name}</h2>
                <X className="modal-close" size={20} onClick={() => setShowSubjectsModal(false)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProgramme.subjects?.length > 0 ? (
                    selectedProgramme.subjects.map((subject, idx) => (
                      <span key={idx} className="subject-tag">
                        <Bookmark size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: 'var(--secondary)', textAlign: 'center', width: '100%' }}>
                      No subjects assigned to this programme yet.
                    </p>
                  )}
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                  <strong>Note:</strong> Subjects are managed in the Subjects section. This is a preview of assigned electives.
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowSubjectsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="programmes-container">
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
            <ArrowLeft size={16} /> Back to Programmes
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Programme' : `Edit: ${selectedProgramme?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new academic programme' : 'Update programme information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProgramme(); }}>
          <div className="form-section">
            <h2>Programme Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Programme Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., General Science, General Arts, Business"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Must be unique across all programmes
                </small>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Programme Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  className={`form-input ${errors.code ? 'error' : ''}`}
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SCI, ART, BUS"
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Short unique code (will be stored in uppercase)
                </small>
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  name="category"
                  className={`form-select ${errors.category ? 'error' : ''}`}
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="SHS">SHS (Senior High School)</option>
                  <option value="JHS">JHS (Junior High School)</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Determines which educational level this programme belongs to
                </small>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of this academic programme"
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
              {view === 'create' ? 'Create Programme' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Programmes;