// import { useState } from 'react';
// import { TrendingUp, Plus, Edit, Trash2, Copy, Eye, X, Award, Star } from 'lucide-react';
// import '../../../styles/grade-boundaries.css';

// function GradeBoundaries() {
//   const [grades, setGrades] = useState([
//     { id: 1, grade: 'A', minScore: 80, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', levelCategory: 'BOTH', isDefault: true },
//     { id: 2, grade: 'B', minScore: 70, maxScore: 79, gradePoint: 3.0, remark: 'Very Good', levelCategory: 'BOTH', isDefault: true },
//     { id: 3, grade: 'C', minScore: 60, maxScore: 69, gradePoint: 2.0, remark: 'Good', levelCategory: 'BOTH', isDefault: true },
//     { id: 4, grade: 'D', minScore: 50, maxScore: 59, gradePoint: 1.0, remark: 'Credit', levelCategory: 'BOTH', isDefault: true },
//     { id: 5, grade: 'E', minScore: 40, maxScore: 49, gradePoint: 0.5, remark: 'Pass', levelCategory: 'BOTH', isDefault: true },
//     { id: 6, grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, remark: 'Fail', levelCategory: 'BOTH', isDefault: true }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [editingGrade, setEditingGrade] = useState(null);
//   const [filterCategory, setFilterCategory] = useState('BOTH');
//   const [formData, setFormData] = useState({ grade: '', minScore: '', maxScore: '', gradePoint: '', remark: '', levelCategory: 'BOTH' });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditGrade = () => {
//     if (!formData.grade || !formData.minScore || !formData.maxScore || !formData.gradePoint) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (parseInt(formData.minScore) >= parseInt(formData.maxScore)) {
//       alert('Min Score must be less than Max Score');
//       return;
//     }

//     if (editingGrade) {
//       setGrades(prev => prev.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g));
//     } else {
//       const newGrade = { id: Date.now(), ...formData, isDefault: false };
//       setGrades(prev => [...prev, newGrade]);
//     }
//     setShowModal(false);
//     setEditingGrade(null);
//     setFormData({ grade: '', minScore: '', maxScore: '', gradePoint: '', remark: '', levelCategory: 'BOTH' });
//   };

//   const handleDeleteGrade = (grade) => {
//     if (grade.isDefault) {
//       alert('Cannot delete default grade boundaries');
//       return;
//     }
//     if (window.confirm(`Delete grade ${grade.grade}?`)) {
//       setGrades(prev => prev.filter(g => g.id !== grade.id));
//     }
//   };

//   const handleCopyFromJHStoSHS = () => {
//     const jhsGrades = grades.filter(g => g.levelCategory === 'JHS' || g.levelCategory === 'BOTH');
//     const newGrades = jhsGrades.map(g => ({ ...g, id: Date.now() + Math.random(), levelCategory: 'SHS', isDefault: false }));
//     setGrades(prev => [...prev, ...newGrades]);
//     alert(`Copied ${newGrades.length} grades from JHS to SHS`);
//   };

//   const filteredGrades = grades.filter(g => filterCategory === 'BOTH' || g.levelCategory === filterCategory || g.levelCategory === 'BOTH');

//   const getScoreGrade = (score) => {
//     const grade = grades.find(g => score >= g.minScore && score <= g.maxScore);
//     return grade || { grade: 'N/A', remark: 'Invalid Score' };
//   };

//   return (
//     <div className="grade-boundaries-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Award size={28} style={{ display: 'inline', marginRight: '12px' }} />Grade Boundaries</h1>
//         <p style={{ color: 'var(--secondary)' }}>Define grading scales for JHS and SHS</p></div>
//         <div style={{ display: 'flex', gap: '0.75rem' }}>
//           <button className="button button-secondary" onClick={handleCopyFromJHStoSHS}><Copy size={16} /> Copy JHS → SHS</button>
//           <button className="button" onClick={() => setShowPreview(true)}><Eye size={16} /> Preview Mapping</button>
//           <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Grade</button>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

//       <div className="filter-bar" style={{ marginBottom: '1rem' }}>
//         <label>Filter by Level:</label>
//         <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
//           <option value="BOTH">All Levels</option><option value="JHS">JHS Only</option><option value="SHS">SHS Only</option>
//         </select>
//       </div>

//       <div className="table-container">
//         <table className="academic-years-table">
//           <thead><tr><th>Grade</th><th>Min Score</th><th>Max Score</th><th>Grade Point</th><th>Remark</th><th>Level Category</th><th>Default?</th><th>Actions</th></tr></thead>
//           <tbody>
//             {filteredGrades.sort((a, b) => b.minScore - a.minScore).map(grade => (
//               <tr key={grade.id} className="grade-row"><td><strong>{grade.grade}</strong></td>
//               <td>{grade.minScore}</td><td>{grade.maxScore}</td><td>{grade.gradePoint}</td><td>{grade.remark}</td>
//               <td><span className="status-badge status-active">{grade.levelCategory}</span></td>
//               <td>{grade.isDefault && <Star size={16} color="#f59e0b" />}</td>
//               <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingGrade(grade); setFormData(grade); setShowModal(true); }}><Edit size={16} /></button>
//               {!grade.isDefault && <button className="action-btn delete-btn" onClick={() => handleDeleteGrade(grade)}><Trash2 size={16} /></button>}</td></tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Preview Modal */}
//       {showPreview && <div className="modal-overlay" onClick={() => setShowPreview(false)}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>Score to Grade Preview</h2><X className="modal-close" size={20} onClick={() => setShowPreview(false)} /></div>
//           <div className="modal-body">
//             <div className="grade-preview"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
//               {[95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map(score => {
//                 const { grade, remark } = getScoreGrade(score);
//                 return <div key={score} className="preview-item"><div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{score}</div><div>{grade}</div><div style={{ fontSize: '0.75rem' }}>{remark}</div></div>;
//               })}
//             </div></div>
//             <div style={{ marginTop: '1rem' }}><h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Grade Mapping:</h3>
//               {grades.map(g => <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
//                 <span><strong>{g.grade}</strong> ({g.minScore}-{g.maxScore})</span><span>{g.remark}</span><span>{g.gradePoint} GPA</span></div>)}</div>
//           </div>
//           <div className="modal-footer"><button className="button" onClick={() => setShowPreview(false)}>Close</button></div>
//         </div>
//       </div>}

//       {/* Grade Modal */}
//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingGrade(null); }}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>{editingGrade ? 'Edit Grade' : 'Add Grade'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingGrade(null); }} /></div>
//           <div className="modal-body">
//             <div className="form-group"><label className="form-label">Grade <span className="required">*</span></label><input type="text" name="grade" className="form-input" value={formData.grade} onChange={handleInputChange} placeholder="A, B+, C-" /></div>
//             <div className="form-group"><label className="form-label">Min Score <span className="required">*</span></label><input type="number" name="minScore" className="form-input" value={formData.minScore} onChange={handleInputChange} /></div>
//             <div className="form-group"><label className="form-label">Max Score <span className="required">*</span></label><input type="number" name="maxScore" className="form-input" value={formData.maxScore} onChange={handleInputChange} /></div>
//             <div className="form-group"><label className="form-label">Grade Point <span className="required">*</span></label><input type="number" step="0.1" name="gradePoint" className="form-input" value={formData.gradePoint} onChange={handleInputChange} /></div>
//             <div className="form-group"><label className="form-label">Remark</label><input type="text" name="remark" className="form-input" value={formData.remark} onChange={handleInputChange} /></div>
//             <div className="form-group"><label className="form-label">Level Category</label><select name="levelCategory" className="form-select" value={formData.levelCategory} onChange={handleInputChange}>
//               <option value="JHS">JHS Only</option><option value="SHS">SHS Only</option><option value="BOTH">Both JHS & SHS</option></select></div>
//           </div>
//           <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingGrade(null); }}>Cancel</button>
//           <button className="button" onClick={handleAddEditGrade}>{editingGrade ? 'Save Changes' : 'Add Grade'}</button></div>
//         </div>
//       </div>}
//     </div>
//   );
// }

// export default GradeBoundaries;











// src/components/Academics/GradeBoundaries.jsx
import { useState } from 'react';
import { TrendingUp, Plus, Edit, Trash2, Copy, Eye, X, Award, Star, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/grade-boundaries.css';

function GradeBoundaries() {
  const [grades, setGrades] = useState([
    { id: 1, grade: 'A', min_score: 80, max_score: 100, grade_point: 4.0, remark: 'Excellent', level_category: 'BOTH', is_default: true },
    { id: 2, grade: 'B', min_score: 70, max_score: 79, grade_point: 3.0, remark: 'Very Good', level_category: 'BOTH', is_default: true },
    { id: 3, grade: 'C', min_score: 60, max_score: 69, grade_point: 2.0, remark: 'Good', level_category: 'BOTH', is_default: true },
    { id: 4, grade: 'D', min_score: 50, max_score: 59, grade_point: 1.0, remark: 'Credit', level_category: 'BOTH', is_default: true },
    { id: 5, grade: 'E', min_score: 40, max_score: 49, grade_point: 0.5, remark: 'Pass', level_category: 'BOTH', is_default: true },
    { id: 6, grade: 'F', min_score: 0, max_score: 39, grade_point: 0.0, remark: 'Fail', level_category: 'BOTH', is_default: true }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState('BOTH');
  const [formData, setFormData] = useState({
    grade: '',
    min_score: '',
    max_score: '',
    grade_point: '',
    remark: '',
    level_category: 'BOTH'
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
    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';
    if (!formData.min_score) newErrors.min_score = 'Min score is required';
    if (!formData.max_score) newErrors.max_score = 'Max score is required';
    if (!formData.grade_point && formData.grade_point !== 0) newErrors.grade_point = 'Grade point is required';
    
    const minScore = parseFloat(formData.min_score);
    const maxScore = parseFloat(formData.max_score);
    const gradePoint = parseFloat(formData.grade_point);
    
    // Validate score ranges
    if (minScore >= maxScore) {
      newErrors.min_score = 'Min score must be less than max score';
    }
    
    if (minScore < 0 || minScore > 100) {
      newErrors.min_score = 'Min score must be between 0 and 100';
    }
    
    if (maxScore < 0 || maxScore > 100) {
      newErrors.max_score = 'Max score must be between 0 and 100';
    }
    
    if (gradePoint < 0 || gradePoint > 4) {
      newErrors.grade_point = 'Grade point must be between 0 and 4';
    }
    
    // Check for overlapping score ranges within the same level category
    const overlapping = grades.find(g => {
      if (selectedGrade && g.id === selectedGrade.id) return false;
      if (g.level_category !== formData.level_category && g.level_category !== 'BOTH' && formData.level_category !== 'BOTH') return false;
      
      return (minScore >= g.min_score && minScore <= g.max_score) ||
             (maxScore >= g.min_score && maxScore <= g.max_score) ||
             (minScore <= g.min_score && maxScore >= g.max_score);
    });
    
    if (overlapping) {
      newErrors.min_score = `Score range overlaps with grade ${overlapping.grade} (${overlapping.min_score}-${overlapping.max_score})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveGrade = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedGrade) {
      // Update existing grade
      setGrades(prev => prev.map(g => 
        g.id === selectedGrade.id 
          ? { 
              ...g, 
              grade: formData.grade,
              min_score: parseFloat(formData.min_score),
              max_score: parseFloat(formData.max_score),
              grade_point: parseFloat(formData.grade_point),
              remark: formData.remark || '',
              level_category: formData.level_category,
              updated_at: new Date().toISOString()
            }
          : g
      ));
    } else {
      // Add new grade
      const newGrade = {
        id: Date.now(),
        grade: formData.grade,
        min_score: parseFloat(formData.min_score),
        max_score: parseFloat(formData.max_score),
        grade_point: parseFloat(formData.grade_point),
        remark: formData.remark || '',
        level_category: formData.level_category,
        is_default: false,
        created_at: new Date().toISOString()
      };
      setGrades(prev => [...prev, newGrade]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      grade: grade.grade,
      min_score: grade.min_score.toString(),
      max_score: grade.max_score.toString(),
      grade_point: grade.grade_point.toString(),
      remark: grade.remark || '',
      level_category: grade.level_category
    });
    setView('edit');
  };

  const handleDeleteGrade = (grade) => {
    if (grade.is_default) {
      alert('Cannot delete default grade boundaries');
      return;
    }
    if (window.confirm(`Delete grade ${grade.grade}?`)) {
      setGrades(prev => prev.filter(g => g.id !== grade.id));
    }
  };

  const handleCopyFromJHStoSHS = () => {
    const jhsGrades = grades.filter(g => g.level_category === 'JHS' || g.level_category === 'BOTH');
    const newGrades = jhsGrades.map(g => ({ 
      ...g, 
      id: Date.now() + Math.random(), 
      level_category: 'SHS', 
      is_default: false,
      created_at: new Date().toISOString()
    }));
    setGrades(prev => [...prev, ...newGrades]);
    alert(`Copied ${newGrades.length} grades from JHS to SHS`);
  };

  const resetForm = () => {
    setFormData({
      grade: '',
      min_score: '',
      max_score: '',
      grade_point: '',
      remark: '',
      level_category: 'BOTH'
    });
    setErrors({});
    setSelectedGrade(null);
  };

  const getScoreGrade = (score) => {
    const grade = grades.find(g => score >= g.min_score && score <= g.max_score);
    return grade || { grade: 'N/A', remark: 'Invalid Score', grade_point: 0 };
  };

  const filteredGrades = grades.filter(g => 
    filterCategory === 'BOTH' || g.level_category === filterCategory || g.level_category === 'BOTH'
  );

  // Render List View
  if (view === 'list') {
    return (
      <div className="grade-boundaries-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Award size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Grade Boundaries
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define grading scales for JHS and SHS</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button button-secondary" onClick={handleCopyFromJHStoSHS}>
              <Copy size={16} /> Copy JHS → SHS
            </button>
            <button className="button button-secondary" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview Mapping
            </button>
            <button className="button" onClick={() => { resetForm(); setView('create'); }}>
              <Plus size={16} /> Add Grade
            </button>
          </div>
        </div>
        <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <label>Filter by Level:</label>
          <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="BOTH">All Levels</option>
            <option value="JHS">JHS Only</option>
            <option value="SHS">SHS Only</option>
          </select>
        </div>

        <div className="table-container">
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Min Score</th>
                <th>Max Score</th>
                <th>Grade Point</th>
                <th>Remark</th>
                <th>Level Category</th>
                <th>Default?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.sort((a, b) => b.min_score - a.min_score).map(grade => (
                <tr key={grade.id} className="grade-row">
                  <td><strong>{grade.grade}</strong></td>
                  <td>{grade.min_score}</td>
                  <td>{grade.max_score}</td>
                  <td>{grade.grade_point}</td>
                  <td>{grade.remark}</td>
                  <td><span className="status-badge status-active">{grade.level_category}</span></td>
                  <td>{grade.is_default && <Star size={16} color="#f59e0b" />}</td>
                  <td className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => handleEditGrade(grade)}>
                      <Edit size={16} />
                    </button>
                    {!grade.is_default && (
                      <button className="action-btn delete-btn" onClick={() => handleDeleteGrade(grade)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview Modal (kept as modal since it's a view-only action) */}
        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Score to Grade Preview</h2>
                <X className="modal-close" size={20} onClick={() => setShowPreview(false)} />
              </div>
              <div className="modal-body">
                <div className="grade-preview">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                    {[95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map(score => {
                      const { grade, remark } = getScoreGrade(score);
                      return (
                        <div key={score} className="preview-item">
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{score}</div>
                          <div>{grade}</div>
                          <div style={{ fontSize: '0.75rem' }}>{remark}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Grade Mapping:</h3>
                  {grades.sort((a, b) => b.min_score - a.min_score).map(g => (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span><strong>{g.grade}</strong> ({g.min_score}-{g.max_score})</span>
                      <span>{g.remark}</span>
                      <span>{g.grade_point} GPA</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowPreview(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="grade-boundaries-container">
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
            <ArrowLeft size={16} /> Back to Grade Boundaries
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add Grade Boundary' : `Edit: ${selectedGrade?.grade}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new grade boundary' : 'Update grade boundary information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }}>
          <div className="form-section">
            <h2>Grade Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Grade <span className="required">*</span></label>
                <input
                  type="text"
                  name="grade"
                  className={`form-input ${errors.grade ? 'error' : ''}`}
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B+, C-"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Letter grade identifier (A, B, C, etc.)
                </small>
                {errors.grade && <span className="error-message">{errors.grade}</span>}
              </div>

              <div className="form-group">
                <label>Min Score <span className="required">*</span></label>
                <input
                  type="number"
                  name="min_score"
                  className={`form-input ${errors.min_score ? 'error' : ''}`}
                  value={formData.min_score}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  step="0.01"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Minimum percentage to achieve this grade
                </small>
                {errors.min_score && <span className="error-message">{errors.min_score}</span>}
              </div>

              <div className="form-group">
                <label>Max Score <span className="required">*</span></label>
                <input
                  type="number"
                  name="max_score"
                  className={`form-input ${errors.max_score ? 'error' : ''}`}
                  value={formData.max_score}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  step="0.01"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Maximum percentage for this grade
                </small>
                {errors.max_score && <span className="error-message">{errors.max_score}</span>}
              </div>

              <div className="form-group">
                <label>Grade Point <span className="required">*</span></label>
                <input
                  type="number"
                  name="grade_point"
                  className={`form-input ${errors.grade_point ? 'error' : ''}`}
                  value={formData.grade_point}
                  onChange={handleInputChange}
                  placeholder="0.0 - 4.0"
                  step="0.1"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  GPA value for this grade (0.0 to 4.0)
                </small>
                {errors.grade_point && <span className="error-message">{errors.grade_point}</span>}
              </div>

              <div className="form-group">
                <label>Remark</label>
                <input
                  type="text"
                  name="remark"
                  className="form-input"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="e.g., Excellent, Good, Pass"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Optional description or remark for this grade
                </small>
              </div>

              <div className="form-group">
                <label>Level Category <span className="required">*</span></label>
                <select
                  name="level_category"
                  className="form-select"
                  value={formData.level_category}
                  onChange={handleInputChange}
                >
                  <option value="BOTH">Both JHS & SHS</option>
                  <option value="JHS">JHS Only</option>
                  <option value="SHS">SHS Only</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Which educational level(s) this grade applies to
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Grade' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradeBoundaries;