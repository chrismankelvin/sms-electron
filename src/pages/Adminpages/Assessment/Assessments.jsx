// // src/components/Academics/Assessments.jsx

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   FileText, Plus, Edit, Eye, Calendar, AlertCircle, CheckCircle, 
//   X, BookOpen, Clock, Trash2, Loader, RefreshCw, ArrowLeft, Save
// } from 'lucide-react';
// import '../../../styles/assessments.css';

// const API_BASE_URL = 'http://localhost:8000/api';

// // API Services
// const assessmentService = {
//   async getAll(filters = {}) {
//     let url = `${API_BASE_URL}/assessments/`;
//     const params = [];
//     if (filters.term_id) params.push(`term_id=${filters.term_id}`);
//     if (filters.academic_year_id) params.push(`academic_year_id=${filters.academic_year_id}`);
//     if (filters.subject_id) params.push(`subject_id=${filters.subject_id}`);
//     if (filters.type) params.push(`assessment_type=${filters.type}`);
//     if (params.length) url += `?${params.join('&')}`;
    
//     const response = await fetch(url);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async getById(id) {
//     const response = await fetch(`${API_BASE_URL}/assessments/${id}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async create(assessmentData) {
//     const response = await fetch(`${API_BASE_URL}/assessments/`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(assessmentData)
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async update(id, assessmentData) {
//     const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(assessmentData)
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async delete(id) {
//     const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
//       method: 'DELETE'
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return true;
//   },

//   async getWeightSummary(academicYearId, termId) {
//     const response = await fetch(`${API_BASE_URL}/assessments/weight-summary/${academicYearId}/${termId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// const academicYearService = {
//   async getAll() {
//     const response = await fetch(`${API_BASE_URL}/academic-years/`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// const termService = {
//   async getAll() {
//     const response = await fetch(`${API_BASE_URL}/terms/`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// const subjectService = {
//   async getAll() {
//     const response = await fetch(`${API_BASE_URL}/subjects/`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// function Assessments() {
//   const navigate = useNavigate();
//   const [assessments, setAssessments] = useState([]);
//   const [academicYears, setAcademicYears] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [view, setView] = useState('list'); // 'list', 'create', 'edit'
//   const [selectedAssessment, setSelectedAssessment] = useState(null);
//   const [weightSummary, setWeightSummary] = useState({ total_weight: 0, is_valid: false });
//   const [filters, setFilters] = useState({ term_id: '', academic_year_id: '', type: '' });
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'quiz',
//     term_id: '',
//     academic_year_id: '',
//     subject_id: '',
//     weight: '',
//     max_score: 100,
//     assessment_date: '',
//     description: ''
//   });
//   const [errors, setErrors] = useState({});

//   const assessmentTypes = [
//     { value: 'quiz', label: 'Quiz' },
//     { value: 'test', label: 'Test' },
//     { value: 'exam', label: 'Exam' },
//     { value: 'project', label: 'Project' },
//     { value: 'homework', label: 'Homework' },
//     { value: 'classwork', label: 'Classwork' }
//   ];

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (view === 'list') {
//       loadAssessments();
//     }
//   }, [filters, view]);

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       const [yearsData, termsData, subjectsData] = await Promise.all([
//         academicYearService.getAll(),
//         termService.getAll(),
//         subjectService.getAll()
//       ]);
      
//       setAcademicYears(yearsData);
//       setTerms(termsData);
//       setSubjects(subjectsData);
      
//       // Set default filter to current academic year
//       const currentYear = yearsData.find(y => y.is_current);
//       if (currentYear) {
//         setFilters(prev => ({ ...prev, academic_year_id: currentYear.id.toString() }));
//       }
//     } catch (error) {
//       showAlert('Failed to load data: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAssessments = async () => {
//     try {
//       const data = await assessmentService.getAll({
//         term_id: filters.term_id ? parseInt(filters.term_id) : undefined,
//         academic_year_id: filters.academic_year_id ? parseInt(filters.academic_year_id) : undefined,
//         type: filters.type || undefined
//       });
//       setAssessments(data);
      
//       // Update weight summary based on current filter
//       if (filters.academic_year_id && filters.term_id) {
//         const summary = await assessmentService.getWeightSummary(
//           parseInt(filters.academic_year_id), 
//           parseInt(filters.term_id)
//         );
//         setWeightSummary(summary);
//       } else {
//         // Calculate total weight from all assessments in current filter
//         const total = data.reduce((sum, a) => sum + (a.weight || 0), 0);
//         setWeightSummary({ total_weight: total, is_valid: total === 100 });
//       }
//     } catch (error) {
//       showAlert('Failed to load assessments: ' + error.message, 'error');
//     }
//   };

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Assessment name is required';
//     if (!formData.type) newErrors.type = 'Assessment type is required';
//     if (!formData.term_id) newErrors.term_id = 'Term is required';
//     if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
//     if (!formData.weight) newErrors.weight = 'Weight is required';
//     if (parseFloat(formData.weight) <= 0) newErrors.weight = 'Weight must be greater than 0';
//     if (parseFloat(formData.weight) > 100) newErrors.weight = 'Weight cannot exceed 100%';
//     if (!formData.max_score) newErrors.max_score = 'Max score is required';
//     if (parseFloat(formData.max_score) <= 0) newErrors.max_score = 'Max score must be greater than 0';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveAssessment = async () => {
//     if (!validateForm()) return;

//     try {
//       setSaving(true);
      
//       const assessmentData = {
//         name: formData.name.trim(),
//         type: formData.type,
//         term_id: parseInt(formData.term_id),
//         academic_year_id: parseInt(formData.academic_year_id),
//         subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
//         weight: parseFloat(formData.weight),
//         max_score: parseFloat(formData.max_score),
//         assessment_date: formData.assessment_date || null,
//         description: formData.description || null
//       };

//       if (view === 'edit' && selectedAssessment) {
//         await assessmentService.update(selectedAssessment.id, assessmentData);
//         showAlert('Assessment updated successfully!', 'success');
//       } else {
//         await assessmentService.create(assessmentData);
//         showAlert('Assessment created successfully!', 'success');
//       }
      
//       resetForm();
//       setView('list');
//       await loadAssessments();
      
//     } catch (error) {
//       showAlert('Failed to save: ' + error.message, 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEditAssessment = (assessment) => {
//     setSelectedAssessment(assessment);
//     setFormData({
//       name: assessment.name,
//       type: assessment.type,
//       term_id: assessment.term_id.toString(),
//       academic_year_id: assessment.academic_year_id.toString(),
//       subject_id: assessment.subject_id?.toString() || '',
//       weight: assessment.weight.toString(),
//       max_score: assessment.max_score.toString(),
//       assessment_date: assessment.assessment_date || '',
//       description: assessment.description || ''
//     });
//     setView('edit');
//   };

//   const handleDeleteAssessment = async (assessment) => {
//     if (window.confirm(`Delete "${assessment.name}"? This action cannot be undone.`)) {
//       try {
//         setSaving(true);
//         await assessmentService.delete(assessment.id);
//         showAlert(`Assessment "${assessment.name}" deleted successfully`, 'success');
//         await loadAssessments();
//       } catch (error) {
//         showAlert('Failed to delete: ' + error.message, 'error');
//       } finally {
//         setSaving(false);
//       }
//     }
//   };

//   const handleEnterScores = (assessment) => {
//     navigate(`/academics/assessments/${assessment.id}/scores`);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       type: 'quiz',
//       term_id: '',
//       academic_year_id: '',
//       subject_id: '',
//       weight: '',
//       max_score: 100,
//       assessment_date: '',
//       description: ''
//     });
//     setErrors({});
//     setSelectedAssessment(null);
//   };

//   const clearFilters = () => {
//     const currentYear = academicYears.find(y => y.is_current);
//     setFilters({ 
//       term_id: '', 
//       academic_year_id: currentYear ? currentYear.id.toString() : '', 
//       type: '' 
//     });
//   };

//   const totalWeight = assessments.reduce((sum, a) => sum + (a.weight || 0), 0);
//   const isWeightValid = weightSummary.is_valid || totalWeight === 100;

//   // Render List View
//   if (view === 'list') {
//     return (
//       <div className="assessments-container">
//         {/* Alert Messages */}
//         {alert.show && (
//           <div className={`alert-${alert.type}`}>
//             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//               {alert.message}
//             </span>
//             <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
//               <X size={18} />
//             </span>
//           </div>
//         )}

//         {/* Header */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//           <div>
//             <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//               <FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />
//               Manage Assessments
//             </h1>
//             <p style={{ color: 'var(--secondary)' }}>Create and manage exams, tests, and quizzes</p>
//           </div>
//           <div style={{ display: 'flex', gap: '0.75rem' }}>
//             <button className="button button-secondary" onClick={loadAssessments} disabled={saving}>
//               <RefreshCw size={16} className={saving ? 'spinner' : ''} />
//               Refresh
//             </button>
//             <button className="button" onClick={() => { resetForm(); setView('create'); }} disabled={saving}>
//               <Plus size={16} /> Create Assessment
//             </button>
//           </div>
//         </div>
//         <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//         {/* Filters */}
//         <div className="filters-section">
//           <div className="filters-bar">
//             <div className="filter-group">
//               <label>Academic Year</label>
//               <select 
//                 className="form-select"
//                 value={filters.academic_year_id}
//                 onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
//               >
//                 <option value="">All Years</option>
//                 {academicYears.map(year => (
//                   <option key={year.id} value={year.id}>{year.year_label}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="filter-group">
//               <label>Term</label>
//               <select 
//                 className="form-select"
//                 value={filters.term_id}
//                 onChange={(e) => setFilters(prev => ({ ...prev, term_id: e.target.value }))}
//               >
//                 <option value="">All Terms</option>
//                 {terms.map(term => (
//                   <option key={term.id} value={term.id}>{term.name}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="filter-group">
//               <label>Assessment Type</label>
//               <select 
//                 className="form-select"
//                 value={filters.type}
//                 onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
//               >
//                 <option value="">All Types</option>
//                 {assessmentTypes.map(type => (
//                   <option key={type.value} value={type.value}>{type.label}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="filter-actions">
//               <button className="btn-secondary" onClick={clearFilters}>
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Weight Summary */}
//         <div className={`weight-summary ${isWeightValid ? 'weight-success' : 'weight-warning'}`}>
//           <div style={{ flex: 1 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               {isWeightValid ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//               <strong>Total Assessment Weight: {weightSummary.total_weight || totalWeight}%</strong>
//             </div>
//             <div className="weight-bar">
//               <div className="weight-bar-fill" style={{ width: `${Math.min(weightSummary.total_weight || totalWeight, 100)}%` }}></div>
//             </div>
//             {!isWeightValid && (weightSummary.total_weight || totalWeight) < 100 && (
//               <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
//                 ⚠ Need {100 - (weightSummary.total_weight || totalWeight)}% more to reach 100%
//               </div>
//             )}
//             {!isWeightValid && (weightSummary.total_weight || totalWeight) > 100 && (
//               <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--danger)' }}>
//                 ⚠ Total weight exceeds 100% by {(weightSummary.total_weight || totalWeight) - 100}%
//               </div>
//             )}
//             {isWeightValid && (
//               <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
//                 ✓ Perfect! Ready for score entry
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Assessments Table */}
//         <div className="table-container">
//           <table className="academic-years-table">
//             <thead>
//               <tr>
//                 <th>Assessment Name</th>
//                 <th>Type</th>
//                 <th>Term</th>
//                 <th>Academic Year</th>
//                 <th>Subject</th>
//                 <th>Weight</th>
//                 <th>Max Score</th>
//                 <th>Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assessments.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
//                     <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
//                     <p>No assessments found</p>
//                     {(filters.academic_year_id || filters.term_id || filters.type) && (
//                       <button className="btn-secondary" onClick={clearFilters}>
//                         Clear Filters
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ) : (
//                 assessments.map(a => (
//                   <tr key={a.id}>
//                     <td><strong>{a.name}</strong></td>
//                     <td><span className="status-badge status-active">{a.type}</span></td>
//                     <td>{a.term_name}</td>
//                     <td>{a.academic_year_label}</td>
//                     <td>{a.subject_name || 'All Subjects'}</td>
//                     <td><span className="status-badge status-active">{a.weight}%</span></td>
//                     <td>{a.max_score}</td>
//                     <td>{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : '-'}</td>
//                     <td className="action-buttons">
//                       <button 
//                         className="action-btn edit-btn" 
//                         onClick={() => handleEditAssessment(a)}
//                         disabled={saving}
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button 
//                         className="action-btn set-current-btn" 
//                         onClick={() => handleEnterScores(a)}
//                         disabled={!isWeightValid}
//                         title={!isWeightValid ? "Total weight must be 100% before entering scores" : "Enter scores"}
//                       >
//                         <Eye size={16} /> Scores
//                       </button>
//                       <button 
//                         className="action-btn delete-btn" 
//                         onClick={() => handleDeleteAssessment(a)}
//                         disabled={saving}
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // Render Create/Edit Form View
//   return (
//     <div className="assessments-container">
//       {/* Alert Messages */}
//       {alert.show && (
//         <div className={`alert-${alert.type}`}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alert.message}
//           </span>
//           <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
//             <X size={18} />
//           </span>
//         </div>
//       )}

//       {/* Header */}
//       <div className="form-header">
//         <div>
//           <button 
//             onClick={() => { resetForm(); setView('list'); }}
//             className="back-button"
//             disabled={saving}
//           >
//             <ArrowLeft size={16} /> Back to Assessments
//           </button>
//           <h1>{view === 'create' ? 'Create Assessment' : `Edit: ${selectedAssessment?.name}`}</h1>
//           <p>{view === 'create' ? 'Create a new assessment for students' : 'Update assessment information'}</p>
//         </div>
//       </div>
//       <hr className="divider" />

//       <div className="form-container">
//         <form onSubmit={(e) => { e.preventDefault(); handleSaveAssessment(); }}>
//           <div className="form-section">
//             <h2>Assessment Details</h2>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Assessment Name <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`form-input ${errors.name ? 'error' : ''}`}
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="e.g., End of Term Examination, Week 3 Quiz"
//                   disabled={saving}
//                 />
//                 {errors.name && <span className="error-message">{errors.name}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Assessment Type <span className="required">*</span></label>
//                 <select
//                   name="type"
//                   className={`form-select ${errors.type ? 'error' : ''}`}
//                   value={formData.type}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   {assessmentTypes.map(type => (
//                     <option key={type.value} value={type.value}>{type.label}</option>
//                   ))}
//                 </select>
//                 {errors.type && <span className="error-message">{errors.type}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Academic Year <span className="required">*</span></label>
//                 <select
//                   name="academic_year_id"
//                   className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
//                   value={formData.academic_year_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">Select Academic Year</option>
//                   {academicYears.map(year => (
//                     <option key={year.id} value={year.id}>{year.year_label}</option>
//                   ))}
//                 </select>
//                 {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Term <span className="required">*</span></label>
//                 <select
//                   name="term_id"
//                   className={`form-select ${errors.term_id ? 'error' : ''}`}
//                   value={formData.term_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">Select Term</option>
//                   {terms.map(term => (
//                     <option key={term.id} value={term.id}>{term.name}</option>
//                   ))}
//                 </select>
//                 {errors.term_id && <span className="error-message">{errors.term_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Subject (Optional)</label>
//                 <select
//                   name="subject_id"
//                   className="form-select"
//                   value={formData.subject_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">All Subjects</option>
//                   {subjects.map(subject => (
//                     <option key={subject.id} value={subject.id}>{subject.name}</option>
//                   ))}
//                 </select>
//                 <small className="field-hint">Leave empty for general assessments covering all subjects</small>
//               </div>

//               <div className="form-group">
//                 <label>Weight (%) <span className="required">*</span></label>
//                 <input
//                   type="number"
//                   name="weight"
//                   className={`form-input ${errors.weight ? 'error' : ''}`}
//                   value={formData.weight}
//                   onChange={handleInputChange}
//                   placeholder="e.g., 10, 20, 70"
//                   step="0.1"
//                   disabled={saving}
//                 />
//                 <small className="field-hint">Percentage contribution to final grade (must sum to 100% per term)</small>
//                 {errors.weight && <span className="error-message">{errors.weight}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Max Score <span className="required">*</span></label>
//                 <input
//                   type="number"
//                   name="max_score"
//                   className={`form-input ${errors.max_score ? 'error' : ''}`}
//                   value={formData.max_score}
//                   onChange={handleInputChange}
//                   placeholder="e.g., 100, 50, 20"
//                   step="0.5"
//                   disabled={saving}
//                 />
//                 <small className="field-hint">Maximum possible score for this assessment</small>
//                 {errors.max_score && <span className="error-message">{errors.max_score}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Assessment Date</label>
//                 <input
//                   type="date"
//                   name="assessment_date"
//                   className="form-input"
//                   value={formData.assessment_date}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 />
//               </div>

//               <div className="form-group full-width">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   className="form-textarea"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows="3"
//                   placeholder="Optional description or notes about this assessment"
//                   disabled={saving}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="form-actions">
//             <button type="button" className="btn-secondary" onClick={() => { resetForm(); setView('list'); }} disabled={saving}>
//               Cancel
//             </button>
//             <button type="submit" className="btn-primary" disabled={saving}>
//               {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
//               {saving ? 'Saving...' : (view === 'create' ? 'Create Assessment' : 'Save Changes')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Assessments;




// src/components/Academics/Assessments.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Eye, Calendar, AlertCircle, CheckCircle, 
  X, BookOpen, Clock, Trash2, Loader, RefreshCw, ArrowLeft, Save,
  Search, Filter, ChevronDown, ChevronRight
} from 'lucide-react';
import '../../../styles/assessments.css';

const API_BASE_URL = 'http://localhost:8000/api';

// API Services
const assessmentService = {
  async getAll(filters = {}) {
    let url = `${API_BASE_URL}/assessments/`;
    const params = [];
    if (filters.term_id) params.push(`term_id=${filters.term_id}`);
    if (filters.academic_year_id) params.push(`academic_year_id=${filters.academic_year_id}`);
    if (filters.subject_id) params.push(`subject_id=${filters.subject_id}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSubjectsWithAssessments(academicYearId, termId) {
    const response = await fetch(`${API_BASE_URL}/assessments/subjects?academic_year_id=${academicYearId}&term_id=${termId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSubjectWeightSummary(academicYearId, termId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/assessments/weight-summary/${academicYearId}/${termId}/${subjectId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(assessmentData) {
    const response = await fetch(`${API_BASE_URL}/assessments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, assessmentData) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

const academicYearService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/academic-years/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const termService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/terms/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const subjectService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/subjects/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function Assessments() {
  const navigate = useNavigate();
  const [subjectsData, setSubjectsData] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [filters, setFilters] = useState({ term_id: '', academic_year_id: '' });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    type: 'quiz',
    term_id: '',
    academic_year_id: '',
    subject_id: '',
    weight: '',
    max_score: 100,
    assessment_date: '',
    description: ''
  });
  const [weightSummary, setWeightSummary] = useState({ total_weight: 0, remaining: 100, is_valid: false });
  const [errors, setErrors] = useState({});

  const assessmentTypes = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'test', label: 'Test' },
    { value: 'exam', label: 'Exam' },
    { value: 'project', label: 'Project' },
    { value: 'homework', label: 'Homework' },
    { value: 'classwork', label: 'Classwork' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (view === 'list' && filters.academic_year_id && filters.term_id) {
      loadSubjectsWithAssessments();
    }
  }, [filters, view]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [yearsData, termsData, subjectsData] = await Promise.all([
        academicYearService.getAll(),
        termService.getAll(),
        subjectService.getAll()
      ]);
      
      setAcademicYears(yearsData);
      setTerms(termsData);
      setSubjects(subjectsData);
      
      // Set default filter to current academic year
      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear) {
        setFilters(prev => ({ ...prev, academic_year_id: currentYear.id.toString() }));
      }
      if (termsData.length > 0) {
        setFilters(prev => ({ ...prev, term_id: termsData[0].id.toString() }));
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsWithAssessments = async () => {
    if (!filters.academic_year_id || !filters.term_id) return;
    
    try {
      setLoading(true);
      const data = await assessmentService.getSubjectsWithAssessments(
        parseInt(filters.academic_year_id),
        parseInt(filters.term_id)
      );
      setSubjectsData(data);
    } catch (error) {
      showAlert('Failed to load assessments: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setFormData(prev => ({ ...prev, subject_id: subjectId, weight: '' }));
    
    if (subjectId && filters.academic_year_id && filters.term_id) {
      try {
        const summary = await assessmentService.getSubjectWeightSummary(
          parseInt(filters.academic_year_id),
          parseInt(filters.term_id),
          parseInt(subjectId)
        );
        setWeightSummary(summary);
      } catch (error) {
        console.error('Error loading weight summary:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Assessment name is required';
    if (!formData.type) newErrors.type = 'Assessment type is required';
    if (!formData.term_id) newErrors.term_id = 'Term is required';
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (parseFloat(formData.weight) <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (parseFloat(formData.weight) > 100) newErrors.weight = 'Weight cannot exceed 100%';
    if (!formData.max_score) newErrors.max_score = 'Max score is required';
    if (parseFloat(formData.max_score) <= 0) newErrors.max_score = 'Max score must be greater than 0';
    
    // Check if weight would exceed 100%
    const newTotal = weightSummary.total_weight + parseFloat(formData.weight);
    if (newTotal > 100) {
      newErrors.weight = `Total weight would exceed 100%. Current total: ${weightSummary.total_weight}%, Adding: ${formData.weight}%`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAssessment = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const assessmentData = {
        name: formData.name.trim(),
        type: formData.type,
        term_id: parseInt(formData.term_id),
        academic_year_id: parseInt(formData.academic_year_id),
        subject_id: parseInt(formData.subject_id),
        weight: parseFloat(formData.weight),
        max_score: parseFloat(formData.max_score),
        assessment_date: formData.assessment_date || null,
        description: formData.description || null
      };

      if (view === 'edit' && selectedAssessment) {
        await assessmentService.update(selectedAssessment.id, assessmentData);
        showAlert('Assessment updated successfully!', 'success');
      } else {
        await assessmentService.create(assessmentData);
        showAlert('Assessment created successfully!', 'success');
      }
      
      resetForm();
      setView('list');
      await loadSubjectsWithAssessments();
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      name: assessment.name,
      type: assessment.type,
      term_id: assessment.term_id.toString(),
      academic_year_id: assessment.academic_year_id.toString(),
      subject_id: assessment.subject_id.toString(),
      weight: assessment.weight.toString(),
      max_score: assessment.max_score.toString(),
      assessment_date: assessment.assessment_date || '',
      description: assessment.description || ''
    });
    
    // Load weight summary for this subject
    assessmentService.getSubjectWeightSummary(
      assessment.academic_year_id,
      assessment.term_id,
      assessment.subject_id
    ).then(summary => {
      setWeightSummary(summary);
    }).catch(console.error);
    
    setView('edit');
  };

  const handleDeleteAssessment = async (assessment) => {
    if (window.confirm(`Delete "${assessment.name}"? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await assessmentService.delete(assessment.id);
        showAlert(`Assessment "${assessment.name}" deleted successfully`, 'success');
        await loadSubjectsWithAssessments();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEnterScores = (assessment) => {
    navigate(`/academics/assessments/${assessment.id}/scores`);
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'quiz',
      term_id: filters.term_id,
      academic_year_id: filters.academic_year_id,
      subject_id: '',
      weight: '',
      max_score: 100,
      assessment_date: '',
      description: ''
    });
    setWeightSummary({ total_weight: 0, remaining: 100, is_valid: false });
    setErrors({});
    setSelectedAssessment(null);
  };

  const clearFilters = () => {
    const currentYear = academicYears.find(y => y.is_current);
    setFilters({ 
      term_id: terms.length > 0 ? terms[0].id.toString() : '', 
      academic_year_id: currentYear ? currentYear.id.toString() : '' 
    });
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="assessments-container">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`alert-${alert.type}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {alert.message}
            </span>
            <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
              <X size={18} />
            </span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Subject Assessments
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Create and manage assessments for each subject (weights must sum to 100% per subject)</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button button-secondary" onClick={loadSubjectsWithAssessments} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              Refresh
            </button>
            <button className="button" onClick={() => { resetForm(); setView('create'); }} disabled={saving}>
              <Plus size={16} /> Create Assessment
            </button>
          </div>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-bar">
            <div className="filter-group">
              <label>Academic Year</label>
              <select 
                className="form-select"
                value={filters.academic_year_id}
                onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
              >
                <option value="">Select Year</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.year_label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Term</label>
              <select 
                className="form-select"
                value={filters.term_id}
                onChange={(e) => setFilters(prev => ({ ...prev, term_id: e.target.value }))}
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term.id} value={term.id}>{term.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-actions">
              <button className="btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Subjects with Assessments */}
        <div className="subjects-container">
          {loading ? (
            <div className="loading-container">
              <Loader size={48} className="spinner" />
              <p>Loading assessments...</p>
            </div>
          ) : subjectsData.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>No assessments found for the selected filters</p>
              <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }}>
                <Plus size={16} /> Create First Assessment
              </button>
            </div>
          ) : (
            subjectsData.map(subject => (
              <div key={subject.subject_id} className="subject-card">
                <div 
                  className="subject-header"
                  onClick={() => toggleSubject(subject.subject_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="subject-info">
                    {expandedSubjects[subject.subject_id] ? 
                      <ChevronDown size={20} /> : <ChevronRight size={20} />
                    }
                    <BookOpen size={20} />
                    <h3>{subject.subject_name}</h3>
                    <div className={`weight-status ${subject.is_valid ? 'valid' : 'invalid'}`}>
                      {subject.is_valid ? (
                        <CheckCircle size={16} /> 
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>{subject.total_weight}% / 100%</span>
                    </div>
                  </div>
                  <div className="subject-actions">
                    <button 
                      className="btn-sm btn-primary"
                      onClick={(e) => { e.stopPropagation(); setFormData({ ...resetForm(), subject_id: subject.subject_id, term_id: filters.term_id, academic_year_id: filters.academic_year_id }); setView('create'); }}
                    >
                      <Plus size={14} /> Add Assessment
                    </button>
                  </div>
                </div>
                
                {expandedSubjects[subject.subject_id] && (
                  <div className="assessments-list">
                    {subject.assessments.length === 0 ? (
                      <div className="no-assessments">
                        <p>No assessments created for this subject yet.</p>
                      </div>
                    ) : (
                      <table className="assessments-table">
                        <thead>
                          <tr>
                            <th>Assessment Name</th>
                            <th>Type</th>
                            <th>Weight</th>
                            <th>Max Score</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subject.assessments.map(assessment => (
                            <tr key={assessment.id}>
                              <td><strong>{assessment.name}</strong></td>
                              <td><span className="type-badge">{assessment.type}</span></td>
                              <td><span className="weight-badge">{assessment.weight}%</span></td>
                              <td>{assessment.max_score}</td>
                              <td>{assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString() : '-'}</td>
                              <td className="action-buttons">
                                <button 
                                  className="action-btn edit-btn" 
                                  onClick={() => handleEditAssessment({ ...assessment, subject_id: subject.subject_id, subject_name: subject.subject_name, term_id: parseInt(filters.term_id), academic_year_id: parseInt(filters.academic_year_id) })}
                                  title="Edit Assessment"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  className="action-btn score-btn" 
                                  onClick={() => handleEnterScores({ id: assessment.id, name: assessment.name })}
                                  title="Enter Scores"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  className="action-btn delete-btn" 
                                  onClick={() => handleDeleteAssessment(assessment)}
                                  title="Delete Assessment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="total-row">
                            <td colSpan="2"><strong>Total Weight</strong></td>
                            <td><strong className={subject.is_valid ? 'text-success' : 'text-danger'}>{subject.total_weight}%</strong></td>
                            <td colSpan="3">
                              {!subject.is_valid && (
                                <span className="warning-text">⚠ Need {subject.remaining}% more to reach 100%</span>
                              )}
                              {subject.is_valid && (
                                <span className="success-text">✓ Complete - Ready for score entry</span>
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="assessments-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      {/* Header */}
      <div className="form-header">
        <div>
          <button 
            onClick={() => { resetForm(); setView('list'); }}
            className="back-button"
            disabled={saving}
          >
            <ArrowLeft size={16} /> Back to Assessments
          </button>
          <h1>{view === 'create' ? 'Create Assessment' : `Edit: ${selectedAssessment?.name}`}</h1>
          <p>{view === 'create' ? 'Create a new assessment for a subject' : 'Update assessment information'}</p>
        </div>
      </div>
      <hr className="divider" />

      <div className="form-container">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveAssessment(); }}>
          <div className="form-section">
            <h2>Assessment Details</h2>
            
            {/* Weight Summary for Selected Subject */}
            {formData.subject_id && (
              <div className={`weight-summary-card ${weightSummary.is_valid ? 'valid' : 'warning'}`}>
                <div className="weight-summary-header">
                  <strong>Subject Weight Status</strong>
                  {weightSummary.is_valid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="weight-summary-stats">
                  <span>Current Total: {weightSummary.total_weight}%</span>
                  <span>Remaining: {weightSummary.remaining}%</span>
                  <span>Status: {weightSummary.is_valid ? 'Complete' : 'Incomplete'}</span>
                </div>
                <div className="weight-bar">
                  <div className="weight-fill" style={{ width: `${weightSummary.total_weight}%` }}></div>
                </div>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label>Assessment Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., End of Term Examination, Week 3 Quiz"
                  disabled={saving}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Assessment Type <span className="required">*</span></label>
                <select
                  name="type"
                  className={`form-select ${errors.type ? 'error' : ''}`}
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  {assessmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <select
                  name="subject_id"
                  className={`form-select ${errors.subject_id ? 'error' : ''}`}
                  value={formData.subject_id}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={saving}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                {errors.subject_id && <span className="error-message">{errors.subject_id}</span>}
              </div>

              <div className="form-group">
                <label>Weight (%) <span className="required">*</span></label>
                <input
                  type="number"
                  name="weight"
                  className={`form-input ${errors.weight ? 'error' : ''}`}
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 10, 20, 70"
                  step="0.1"
                  disabled={saving}
                />
                <small className="field-hint">Percentage contribution to final grade (must sum to 100% per subject)</small>
                {errors.weight && <span className="error-message">{errors.weight}</span>}
              </div>

              <div className="form-group">
                <label>Max Score <span className="required">*</span></label>
                <input
                  type="number"
                  name="max_score"
                  className={`form-input ${errors.max_score ? 'error' : ''}`}
                  value={formData.max_score}
                  onChange={handleInputChange}
                  placeholder="e.g., 100, 50, 20"
                  step="0.5"
                  disabled={saving}
                />
                <small className="field-hint">Maximum possible score for this assessment</small>
                {errors.max_score && <span className="error-message">{errors.max_score}</span>}
              </div>

              <div className="form-group">
                <label>Assessment Date</label>
                <input
                  type="date"
                  name="assessment_date"
                  className="form-input"
                  value={formData.assessment_date}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description or notes about this assessment"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => { resetForm(); setView('list'); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : (view === 'create' ? 'Create Assessment' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Assessments;