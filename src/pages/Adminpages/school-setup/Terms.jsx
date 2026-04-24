// import { useState } from 'react';
// import { Calendar, Plus, Edit, CheckCircle, AlertCircle, Filter, X } from 'lucide-react';
// import '../../../styles/terms.css';

// function Terms() {
//   const [terms, setTerms] = useState([
//     { id: 1, termName: 'First Term', termNumber: 1, academicYear: '2024-2025', startDate: '2024-08-12', endDate: '2024-12-15', isActive: true, resultsPublished: true },
//     { id: 2, termName: 'Second Term', termNumber: 2, academicYear: '2024-2025', startDate: '2025-01-10', endDate: '2025-04-05', isActive: false, resultsPublished: false },
//     { id: 3, termName: 'Third Term', termNumber: 3, academicYear: '2024-2025', startDate: '2025-04-28', endDate: '2025-07-20', isActive: false, resultsPublished: false },
//     { id: 4, termName: 'First Term', termNumber: 1, academicYear: '2023-2024', startDate: '2023-08-14', endDate: '2023-12-10', isActive: false, resultsPublished: true }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [editingTerm, setEditingTerm] = useState(null);
//   const [selectedYear, setSelectedYear] = useState('2024-2025');
//   const [warning, setWarning] = useState('');
//   const [formData, setFormData] = useState({
//     termName: '',
//     termNumber: '',
//     academicYear: '2024-2025',
//     startDate: '',
//     endDate: ''
//   });

//   const academicYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const checkPreviousTermResults = (academicYear, termNumber) => {
//     const previousTerm = terms.find(t => 
//       t.academicYear === academicYear && 
//       t.termNumber === termNumber - 1
//     );
    
//     if (previousTerm && !previousTerm.resultsPublished) {
//       setWarning(`Cannot activate ${termNumber}nd/rd term until Term ${termNumber - 1} results are published.`);
//       return false;
//     }
//     setWarning('');
//     return true;
//   };

//   const handleActivateTerm = (term) => {
//     if (term.termNumber > 1) {
//       const canActivate = checkPreviousTermResults(term.academicYear, term.termNumber);
//       if (!canActivate) return;
//     }

//     setTerms(prev => prev.map(t => ({
//       ...t,
//       isActive: t.id === term.id,
//       resultsPublished: t.id === term.id ? t.resultsPublished : t.resultsPublished
//     })));
//   };

//   const handleAddEditTerm = () => {
//     if (!formData.termName || !formData.termNumber || !formData.startDate || !formData.endDate) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (new Date(formData.startDate) >= new Date(formData.endDate)) {
//       alert('End date must be after start date');
//       return;
//     }

//     if (editingTerm) {
//       setTerms(prev => prev.map(t => 
//         t.id === editingTerm.id 
//           ? { ...t, ...formData, resultsPublished: t.resultsPublished }
//           : t
//       ));
//     } else {
//       const newTerm = {
//         id: Date.now(),
//         ...formData,
//         isActive: false,
//         resultsPublished: false
//       };
//       setTerms(prev => [...prev, newTerm]);
//     }
    
//     setShowModal(false);
//     setEditingTerm(null);
//     setFormData({ termName: '', termNumber: '', academicYear: '2024-2025', startDate: '', endDate: '' });
//   };

//   const openEditModal = (term) => {
//     setEditingTerm(term);
//     setFormData({
//       termName: term.termName,
//       termNumber: term.termNumber,
//       academicYear: term.academicYear,
//       startDate: term.startDate,
//       endDate: term.endDate
//     });
//     setShowModal(true);
//   };

//   const filteredTerms = terms.filter(t => t.academicYear === selectedYear);

//   return (
//     <div className="terms-container">
//       <div className="terms-header">
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Academic Terms
//           </h1>
//           <p style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>Define terms within each academic year with date ranges</p>
//         </div>
//         <button className="button" onClick={() => setShowModal(true)}>
//           <Plus size={16} />
//           Add Term
//         </button>
//       </div>

//       <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

//       <div className="filter-bar">
//         <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by Academic Year:</label>
//         <select className="filter-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
//           {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
//         </select>
//       </div>

//       {warning && (
//         <div className="warning-banner">
//           <AlertCircle size={18} color="#f59e0b" />
//           <span>{warning}</span>
//         </div>
//       )}

//       <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
//         {filteredTerms.sort((a, b) => a.termNumber - b.termNumber).map(term => (
//           <div key={term.id} className={`term-card ${term.isActive ? 'active' : ''}`}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
//                   <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{term.termName}</h3>
//                   <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Term {term.termNumber}</span>
//                   {term.isActive && <span className="status-badge status-active"><CheckCircle size={12} /> Active</span>}
//                 </div>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)' }}>
//                   <span>📅 {new Date(term.startDate).toLocaleDateString()} → {new Date(term.endDate).toLocaleDateString()}</span>
//                   <span>📊 Results: {term.resultsPublished ? 'Published ✓' : 'Pending ⏳'}</span>
//                 </div>
//               </div>
//               <div className="action-buttons">
//                 <button className="action-btn edit-btn" onClick={() => openEditModal(term)}><Edit size={16} /></button>
//                 {!term.isActive && (
//                   <button className="action-btn set-current-btn" onClick={() => handleActivateTerm(term)}>
//                     <CheckCircle size={16} /> Activate
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal for Add/Edit */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTerm(null); }}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>{editingTerm ? 'Edit Term' : 'Add New Term'}</h2>
//               <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingTerm(null); }} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group"><label className="form-label">Term Name <span className="required">*</span></label>
//                 <input type="text" name="termName" className="form-input" value={formData.termName} onChange={handleInputChange} placeholder="e.g., First Term" /></div>
//               <div className="form-group"><label className="form-label">Term Number <span className="required">*</span></label>
//                 <input type="number" name="termNumber" className="form-input" value={formData.termNumber} onChange={handleInputChange} min="1" max="6" /></div>
//               <div className="form-group"><label className="form-label">Academic Year</label>
//                 <select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>
//                   {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
//                 </select></div>
//               <div className="form-group"><label className="form-label">Start Date <span className="required">*</span></label>
//                 <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleInputChange} /></div>
//               <div className="form-group"><label className="form-label">End Date <span className="required">*</span></label>
//                 <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleInputChange} /></div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingTerm(null); }}>Cancel</button>
//               <button className="button" onClick={handleAddEditTerm}>{editingTerm ? 'Save Changes' : 'Add Term'}</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Terms;











// src/components/Academics/Terms.jsx
import { useState } from 'react';
import { Calendar, Plus, Edit, CheckCircle, AlertCircle, Filter, X, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/terms.css';

function Terms() {
  const [terms, setTerms] = useState([
    { id: 1, name: 'First Term', term_number: 1, academic_year_id: 3, start_date: '2024-08-12', end_date: '2024-12-15', is_active: true, results_published: true },
    { id: 2, name: 'Second Term', term_number: 2, academic_year_id: 3, start_date: '2025-01-10', end_date: '2025-04-05', is_active: false, results_published: false },
    { id: 3, name: 'Third Term', term_number: 3, academic_year_id: 3, start_date: '2025-04-28', end_date: '2025-07-20', is_active: false, results_published: false },
    { id: 4, name: 'First Term', term_number: 1, academic_year_id: 2, start_date: '2023-08-14', end_date: '2023-12-10', is_active: false, results_published: true }
  ]);

  const [academicYears, setAcademicYears] = useState([
    { id: 1, year_label: '2022-2023' },
    { id: 2, year_label: '2023-2024' },
    { id: 3, year_label: '2024-2025' },
    { id: 4, year_label: '2025-2026' }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState('3');
  const [warning, setWarning] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    term_number: '',
    academic_year_id: '3',
    start_date: '',
    end_date: ''
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
    if (!formData.name.trim()) newErrors.name = 'Term name is required';
    if (!formData.term_number) newErrors.term_number = 'Term number is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Validate term number range
    const termNum = parseInt(formData.term_number);
    if (termNum && (termNum < 1 || termNum > 6)) {
      newErrors.term_number = 'Term number must be between 1 and 6';
    }
    
    // Validate that end date is after start date
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    // Check for duplicate term number in same academic year
    const existingTerm = terms.find(t => 
      t.academic_year_id === parseInt(formData.academic_year_id) && 
      t.term_number === termNum &&
      (!selectedTerm || t.id !== selectedTerm.id)
    );
    if (existingTerm) {
      newErrors.term_number = `Term ${termNum} already exists for this academic year`;
    }
    
    // Check for duplicate term name in same academic year
    const existingName = terms.find(t => 
      t.academic_year_id === parseInt(formData.academic_year_id) && 
      t.name.toLowerCase() === formData.name.toLowerCase() &&
      (!selectedTerm || t.id !== selectedTerm.id)
    );
    if (existingName) {
      newErrors.name = `"${formData.name}" already exists for this academic year`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPreviousTermResults = (academicYearId, termNumber) => {
    const previousTerm = terms.find(t => 
      t.academic_year_id === parseInt(academicYearId) && 
      t.term_number === termNumber - 1
    );
    
    if (previousTerm && !previousTerm.results_published) {
      setWarning(`Cannot activate Term ${termNumber} until Term ${termNumber - 1} results are published.`);
      return false;
    }
    setWarning('');
    return true;
  };

  const handleActivateTerm = (term) => {
    if (term.term_number > 1) {
      const canActivate = checkPreviousTermResults(term.academic_year_id, term.term_number);
      if (!canActivate) return;
    }

    setTerms(prev => prev.map(t => ({
      ...t,
      is_active: t.id === term.id
    })));
  };

  const handleSaveTerm = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedTerm) {
      // Update existing term
      setTerms(prev => prev.map(t => 
        t.id === selectedTerm.id 
          ? { 
              ...t, 
              name: formData.name,
              term_number: parseInt(formData.term_number),
              academic_year_id: parseInt(formData.academic_year_id),
              start_date: formData.start_date,
              end_date: formData.end_date,
              updated_at: new Date().toISOString()
            }
          : t
      ));
    } else {
      // Add new term
      const newTerm = {
        id: Date.now(),
        name: formData.name,
        term_number: parseInt(formData.term_number),
        academic_year_id: parseInt(formData.academic_year_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: false,
        results_published: false,
        created_at: new Date().toISOString()
      };
      setTerms(prev => [...prev, newTerm]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditTerm = (term) => {
    setSelectedTerm(term);
    setFormData({
      name: term.name,
      term_number: term.term_number.toString(),
      academic_year_id: term.academic_year_id.toString(),
      start_date: term.start_date,
      end_date: term.end_date
    });
    setView('edit');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      term_number: '',
      academic_year_id: '3',
      start_date: '',
      end_date: ''
    });
    setErrors({});
    setSelectedTerm(null);
    setWarning('');
  };

  const getAcademicYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'Unknown';
  };

  const filteredTerms = terms.filter(t => t.academic_year_id === parseInt(selectedYearId));

  // Render List View
  if (view === 'list') {
    return (
      <div className="terms-container">
        <div className="terms-header">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Terms
            </h1>
            <p style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>Define terms within each academic year with date ranges</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} />
            Add Term
          </button>
        </div>

        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

        <div className="filter-bar">
          <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by Academic Year:</label>
          <select className="filter-select" value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year_label}</option>
            ))}
          </select>
        </div>

        {warning && (
          <div className="warning-banner">
            <AlertCircle size={18} color="#f59e0b" />
            <span>{warning}</span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {filteredTerms.length > 0 ? (
            filteredTerms.sort((a, b) => a.term_number - b.term_number).map(term => (
              <div key={term.id} className={`term-card ${term.is_active ? 'active' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{term.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Term {term.term_number}</span>
                      {term.is_active && <span className="status-badge status-active"><CheckCircle size={12} /> Active</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)' }}>
                      <span>📅 {new Date(term.start_date).toLocaleDateString()} → {new Date(term.end_date).toLocaleDateString()}</span>
                      <span>📊 Results: {term.results_published ? 'Published ✓' : 'Pending ⏳'}</span>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => handleEditTerm(term)}>
                      <Edit size={16} />
                    </button>
                    {!term.is_active && (
                      <button className="action-btn set-current-btn" onClick={() => handleActivateTerm(term)}>
                        <CheckCircle size={16} /> Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No terms defined for this academic year</p>
              <button className="button" onClick={() => { resetForm(); setView('create'); }}>
                <Plus size={16} />
                Add First Term
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="terms-container">
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
            <ArrowLeft size={16} /> Back to Terms
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Term' : `Edit: ${selectedTerm?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new academic term' : 'Update term information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTerm(); }}>
          <div className="form-section">
            <h2>Term Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Term Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., First Term, Second Term, etc."
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Term Number <span className="required">*</span></label>
                <input
                  type="number"
                  name="term_number"
                  className={`form-input ${errors.term_number ? 'error' : ''}`}
                  value={formData.term_number}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3, etc."
                  min="1"
                  max="6"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Unique number for this term within the academic year (1-6)
                </small>
                {errors.term_number && <span className="error-message">{errors.term_number}</span>}
              </div>

              <div className="form-group">
                <label>Academic Year <span className="required">*</span></label>
                <select
                  name="academic_year_id"
                  className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
                  value={formData.academic_year_id}
                  onChange={handleInputChange}
                >
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.year_label}</option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
              </div>

              <div className="form-group">
                <label>Start Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="start_date"
                  className={`form-input ${errors.start_date ? 'error' : ''}`}
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
                {errors.start_date && <span className="error-message">{errors.start_date}</span>}
              </div>

              <div className="form-group">
                <label>End Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="end_date"
                  className={`form-input ${errors.end_date ? 'error' : ''}`}
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
                {errors.end_date && <span className="error-message">{errors.end_date}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Term' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Terms;