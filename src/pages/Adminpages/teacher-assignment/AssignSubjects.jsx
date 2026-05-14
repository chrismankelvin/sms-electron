// // src/components/Academics/AssignSubjects.jsx

// import { useState, useEffect } from 'react';
// import { 
//   BookOpen, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   AlertCircle, 
//   X, 
//   ArrowLeft, 
//   Save,
//   Loader,
//   CheckCircle,
//   Filter
// } from 'lucide-react';
// import '../../../styles/assign-subjects.css';
// import { teacherSubjectAssignmentService } from '../../../services/teacherSubjectAssignmentService';
// import { getstaff } from '../../../services/api.service';
// import { classService } from '../../../services/classService';
// import { subjectService } from '../../../services/subjectService';
// import { academicYearService } from '../../../services/academicYearService';

// function AssignSubjects() {
//   const [assignments, setAssignments] = useState([]);
//   const [staff, setStaff] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [academicYears, setAcademicYears] = useState([]);
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [view, setView] = useState('list');
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [showConflictWarning, setShowConflictWarning] = useState(false);
//   const [conflictInfo, setConflictInfo] = useState(null);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
//   const [filters, setFilters] = useState({ 
//     academic_year_id: '', 
//     class_id: '', 
//     subject_id: '' 
//   });
//   const [formData, setFormData] = useState({
//     staff_id: '',
//     class_id: '',
//     subject_id: '',
//     academic_year_id: '',
//     is_active: true
//   });
//   const [errors, setErrors] = useState({});

//   // Load data on component mount
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   // Load assignments when filters change
//   useEffect(() => {
//     if (academicYears.length > 0) {
//       loadAssignments();
//     }
//   }, [filters]);

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);


//       const staffData = {
      
//         async getAll() {
//           try {
//             // Try using the imported function first
//             const response = await getstaff();
//             return response;
//           } catch (error) {
//             // Fallback to direct fetch if needed
//             console.error('getstaff failed, using fallback:', error);
//             const response = await fetch(`${API_BASE_URL}/staff/`);
//             const data = await response.json();
//             if (!data.success) throw new Error(data.message);
//             return data.data;
//           }
//         }
      
//       };
      
//       const [classesData, subjectsData, yearsData] = await Promise.all([
  
//         classService.getAll().catch(() => []),
//         subjectService.getAll().catch(() => []),
//         academicYearService.getAll().catch(() => [])
//       ]);
      
//       setStaff(staffData);
//       setClasses(classesData);
//       setSubjects(subjectsData);
//       setAcademicYears(yearsData);
      
//       // Set default filter to current academic year
//       const currentYear = yearsData.find(y => y.is_current);
//       if (currentYear) {
//         setFilters(prev => ({ ...prev, academic_year_id: currentYear.id.toString() }));
//       } else if (yearsData.length > 0) {
//         setFilters(prev => ({ ...prev, academic_year_id: yearsData[0].id.toString() }));
//       }
      
//     } catch (error) {
//       showAlert('Failed to load data: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAssignments = async () => {
//     try {
//       setLoading(true);
//       const data = await teacherSubjectAssignmentService.getAll({
//         academic_year_id: filters.academic_year_id ? parseInt(filters.academic_year_id) : undefined,
//         class_id: filters.class_id ? parseInt(filters.class_id) : undefined,
//         subject_id: filters.subject_id ? parseInt(filters.subject_id) : undefined
//       });
//       setAssignments(data);
//     } catch (error) {
//       showAlert('Failed to load assignments: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: type === 'checkbox' ? checked : value 
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const checkForConflicts = async () => {
//     if (!formData.staff_id || !formData.academic_year_id) return true;
    
//     try {
//       const conflicts = await teacherSubjectAssignmentService.getTeacherConflicts(
//         parseInt(formData.staff_id),
//         parseInt(formData.academic_year_id)
//       );
      
//       if (conflicts.assignments.length > 0) {
//         const existing = conflicts.assignments[0];
//         setConflictInfo({
//           teacher: staff.find(s => s.id === parseInt(formData.staff_id))?.first_name + ' ' + 
//                    staff.find(s => s.id === parseInt(formData.staff_id))?.surname,
//           class: existing.class_name,
//           subject: existing.subject_name
//         });
//         setShowConflictWarning(true);
//         return false;
//       }
//       return true;
//     } catch (error) {
//       console.error('Error checking conflicts:', error);
//       return true;
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.staff_id) newErrors.staff_id = 'Teacher is required';
//     if (!formData.class_id) newErrors.class_id = 'Class is required';
//     if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
//     if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveAssignment = async () => {
//     if (!validateForm()) return;
    
//     if (!await checkForConflicts()) return;

//     try {
//       setSaving(true);
      
//       const assignmentData = {
//         staff_id: parseInt(formData.staff_id),
//         class_id: parseInt(formData.class_id),
//         subject_id: parseInt(formData.subject_id),
//         academic_year_id: parseInt(formData.academic_year_id),
//         is_active: formData.is_active
//       };

//       if (view === 'edit' && selectedAssignment) {
//         await teacherSubjectAssignmentService.update(selectedAssignment.id, assignmentData);
//         showAlert('Assignment updated successfully!', 'success');
//       } else {
//         await teacherSubjectAssignmentService.create(assignmentData);
//         showAlert('Assignment created successfully!', 'success');
//       }
      
//       await loadAssignments();
//       resetForm();
//       setView('list');
      
//     } catch (error) {
//       if (error.message.includes('already assigned')) {
//         setErrors({ duplicate: error.message });
//       } else {
//         showAlert('Failed to save: ' + error.message, 'error');
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEditAssignment = (assignment) => {
//     setSelectedAssignment(assignment);
//     setFormData({
//       staff_id: assignment.staff_id.toString(),
//       class_id: assignment.class_id.toString(),
//       subject_id: assignment.subject_id.toString(),
//       academic_year_id: assignment.academic_year_id.toString(),
//       is_active: assignment.is_active
//     });
//     setView('edit');
//   };

//   const handleDeleteAssignment = async (assignment) => {
//     if (window.confirm(`Remove "${assignment.subject_name}" assignment from ${assignment.class_name}?`)) {
//       try {
//         setSaving(true);
//         await teacherSubjectAssignmentService.delete(assignment.id);
//         showAlert('Assignment deleted successfully!', 'success');
//         await loadAssignments();
//       } catch (error) {
//         showAlert('Failed to delete: ' + error.message, 'error');
//       } finally {
//         setSaving(false);
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       staff_id: '',
//       class_id: '',
//       subject_id: '',
//       academic_year_id: filters.academic_year_id || '',
//       is_active: true
//     });
//     setErrors({});
//     setSelectedAssignment(null);
//     setShowConflictWarning(false);
//     setConflictInfo(null);
//   };

//   const clearFilters = () => {
//     const currentYear = academicYears.find(y => y.is_current);
//     setFilters({ 
//       academic_year_id: currentYear ? currentYear.id.toString() : (academicYears[0]?.id.toString() || ''), 
//       class_id: '', 
//       subject_id: '' 
//     });
//   };

//   const getStaffName = (staffId) => {
//     const staffMember = staff.find(s => s.id === staffId);
//     return staffMember ? `${staffMember.first_name} ${staffMember.surname}` : 'Unknown';
//   };

//   if (loading && assignments.length === 0) {
//     return (
//       <div className="assign-subjects-container">
//         <div className="loading-container">
//           <Loader size={48} className="spinner" />
//           <p>Loading assignments...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render List View
//   if (view === 'list') {
//     return (
//       <div className="assign-subjects-container">
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

//         <div className="assign-header">
//           <div className="header-title">
//             <h1>
//               <BookOpen size={28} />
//               Assign Subjects
//             </h1>
//             <p>Assign teachers to teach specific subjects in specific classes</p>
//           </div>
//           <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }} disabled={saving}>
//             <Plus size={16} /> Add Assignment
//           </button>
//         </div>
//         <hr className="divider" />

//         {/* Filters */}
//         <div className="filters-bar">
//           <div className="filter-group">
//             <label>Academic Year</label>
//             <select 
//               className="form-select" 
//               value={filters.academic_year_id} 
//               onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
//             >
//               <option value="">All Years</option>
//               {academicYears.map(y => (
//                 <option key={y.id} value={y.id}>{y.year_label}</option>
//               ))}
//             </select>
//           </div>
//           <div className="filter-group">
//             <label>Class</label>
//             <select 
//               className="form-select" 
//               value={filters.class_id} 
//               onChange={(e) => setFilters(prev => ({ ...prev, class_id: e.target.value }))}
//             >
//               <option value="">All Classes</option>
//               {classes.map(c => (
//                 <option key={c.id} value={c.id}>{c.class_name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="filter-group">
//             <label>Subject</label>
//             <select 
//               className="form-select" 
//               value={filters.subject_id} 
//               onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
//             >
//               <option value="">All Subjects</option>
//               {subjects.map(s => (
//                 <option key={s.id} value={s.id}>{s.name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="filter-actions">
//             <button className="btn-secondary" onClick={clearFilters}>
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* Assignments Table */}
//         <div className="table-container">
//           <table className="assignments-table">
//             <thead>
//               <tr>
//                 <th>Class</th>
//                 <th>Subject</th>
//                 <th>Teacher</th>
//                 <th>Academic Year</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assignments.length > 0 ? (
//                 assignments.map(a => (
//                   <tr key={a.id}>
//                     <td><strong>{a.class_name}</strong></td>
//                     <td>{a.subject_name} <span className="subject-code">({a.subject_code})</span></td>
//                     <td>{a.staff_name}</td>
//                     <td>{a.academic_year_label}</td>
//                     <td>
//                       <span className={`status-badge ${a.is_active ? 'status-active' : 'status-inactive'}`}>
//                         {a.is_active ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="action-buttons">
//                       <button 
//                         className="action-btn edit-btn" 
//                         onClick={() => handleEditAssignment(a)}
//                         disabled={saving}
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button 
//                         className="action-btn delete-btn" 
//                         onClick={() => handleDeleteAssignment(a)}
//                         disabled={saving}
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                      </td></tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="empty-state-cell">
//                     <div className="empty-state">
//                       <BookOpen size={48} />
//                       <p>No assignments found</p>
//                       <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }}>
//                         <Plus size={16} /> Add Assignment
//                       </button>
//                     </div>
//                    </td>
//                    </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   // Render Create/Edit Form View
//   return (
//     <div className="assign-subjects-container">
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

//       <div className="form-header">
//         <div>
//           <button 
//             onClick={() => { resetForm(); setView('list'); }}
//             className="back-button"
//             disabled={saving}
//           >
//             <ArrowLeft size={16} /> Back to Assignments
//           </button>
//           <h1>{view === 'create' ? 'Add Assignment' : `Edit: ${selectedAssignment?.subject_name}`}</h1>
//           <p>{view === 'create' ? 'Assign a teacher to teach a subject in a class' : 'Update assignment information'}</p>
//         </div>
//       </div>
//       <hr className="divider" />

//       <div className="form-container">
//         <form onSubmit={(e) => { e.preventDefault(); handleSaveAssignment(); }}>
//           <div className="form-section">
//             <h2>Assignment Details</h2>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Teacher <span className="required">*</span></label>
//                 <select
//                   name="staff_id"
//                   className={`form-select ${errors.staff_id ? 'error' : ''}`}
//                   value={formData.staff_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">Select Teacher</option>
//                   {staff.map(t => (
//                     <option key={t.id} value={t.id}>
//                       {t.title} {t.first_name} {t.surname}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.staff_id && <span className="error-message">{errors.staff_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Class <span className="required">*</span></label>
//                 <select
//                   name="class_id"
//                   className={`form-select ${errors.class_id ? 'error' : ''}`}
//                   value={formData.class_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">Select Class</option>
//                   {classes.map(c => (
//                     <option key={c.id} value={c.id}>{c.class_name} ({c.class_code})</option>
//                   ))}
//                 </select>
//                 {errors.class_id && <span className="error-message">{errors.class_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Subject <span className="required">*</span></label>
//                 <select
//                   name="subject_id"
//                   className={`form-select ${errors.subject_id ? 'error' : ''}`}
//                   value={formData.subject_id}
//                   onChange={handleInputChange}
//                   disabled={saving}
//                 >
//                   <option value="">Select Subject</option>
//                   {subjects.map(s => (
//                     <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
//                   ))}
//                 </select>
//                 <small className="field-hint">
//                   Only subjects the teacher is qualified for will work in timetables
//                 </small>
//                 {errors.subject_id && <span className="error-message">{errors.subject_id}</span>}
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
//                   {academicYears.map(y => (
//                     <option key={y.id} value={y.id}>{y.year_label}</option>
//                   ))}
//                 </select>
//                 {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     name="is_active"
//                     checked={formData.is_active}
//                     onChange={handleInputChange}
//                     disabled={saving}
//                   />
//                   Is Active?
//                 </label>
//                 <small className="field-hint">
//                   Inactive assignments won't appear in timetables
//                 </small>
//               </div>
//             </div>

//             {errors.duplicate && (
//               <div className="alert-error-block">
//                 <AlertCircle size={14} />
//                 {errors.duplicate}
//               </div>
//             )}

//             <div className="alert-info-block">
//               <AlertCircle size={14} />
//               <span>Each teacher can only be assigned to teach a specific subject in a specific class once per academic year.</span>
//             </div>
//           </div>

//           <div className="form-actions">
//             <button type="button" className="btn-secondary" onClick={() => { resetForm(); setView('list'); }} disabled={saving}>
//               Cancel
//             </button>
//             <button type="submit" className="btn-primary" disabled={saving}>
//               {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
//               {saving ? 'Saving...' : (view === 'create' ? 'Create Assignment' : 'Save Changes')}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Conflict Warning Modal */}
//       {showConflictWarning && conflictInfo && (
//         <div className="modal-overlay" onClick={() => setShowConflictWarning(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Teacher Conflict Warning</h2>
//               <X className="modal-close" size={20} onClick={() => setShowConflictWarning(false)} />
//             </div>
//             <div className="modal-body">
//               <div className="alert-warning">
//                 <AlertCircle size={20} />
//                 <p><strong>{conflictInfo.teacher}</strong> is already assigned to teach <strong>{conflictInfo.subject}</strong> in <strong>{conflictInfo.class}</strong> for this academic year.</p>
//                 <p>This may cause timetable conflicts. Do you want to continue anyway?</p>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="btn-secondary" onClick={() => setShowConflictWarning(false)}>
//                 Cancel
//               </button>
//               <button className="btn-primary" onClick={() => {
//                 setShowConflictWarning(false);
//                 handleSaveAssignment();
//               }}>
//                 Continue Anyway
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AssignSubjects;

// src/components/Academics/AssignSubjects.jsx

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  X, 
  ArrowLeft, 
  Save,
  Loader,
  CheckCircle,
  Filter
} from 'lucide-react';
import '../../../styles/assign-subjects.css';
import { teacherSubjectAssignmentService } from '../../../services/teacherSubjectAssignmentService';
import { getstaff } from '../../../services/api.service';
import { classService } from '../../../services/classService';
import { subjectService } from '../../../services/subjectService';
import { academicYearService } from '../../../services/academicYearService';

const API_BASE_URL = 'http://localhost:8000/api';

function AssignSubjects() {
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [filters, setFilters] = useState({ 
    academic_year_id: '', 
    class_id: '', 
    subject_id: '' 
  });
  const [formData, setFormData] = useState({
    staff_id: '',
    class_id: '',
    subject_id: '',
    academic_year_id: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load assignments when filters change
  useEffect(() => {
    if (academicYears.length > 0 && !loading) {
      loadAssignments();
    }
  }, [filters.academic_year_id, filters.class_id, filters.subject_id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Fetch staff data properly
      let staffData = [];
      try {
        const staffResponse = await getstaff();
        console.log('Staff response:', staffResponse);
        
        // Handle different response structures
        if (staffResponse && staffResponse.success && staffResponse.data) {
          staffData = staffResponse.data;
        } else if (Array.isArray(staffResponse)) {
          staffData = staffResponse;
        } else if (staffResponse && staffResponse.data && Array.isArray(staffResponse.data)) {
          staffData = staffResponse.data;
        } else {
          staffData = [];
        }
      } catch (error) {
        console.error('Failed to load staff:', error);
        // Fallback: try direct fetch
        try {
          const fallbackResponse = await fetch(`${API_BASE_URL}/staff/`);
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && Array.isArray(fallbackData.data)) {
            staffData = fallbackData.data;
          }
        } catch (fallbackError) {
          console.error('Fallback staff fetch also failed:', fallbackError);
          staffData = [];
        }
      }
      
      // Format staff data to have consistent structure
      const formattedStaff = staffData.map(s => ({
        id: s.id || s.staff_id,
        first_name: s.first_name || s.name?.split(' ')[0] || '',
        surname: s.surname || s.last_name || s.name?.split(' ').slice(1).join(' ') || '',
        title: s.title || '',
        staff_number: s.staff_number,
        email: s.email,
        phone: s.phone
      }));
      
      setStaff(formattedStaff);
      
      // Fetch other data
      const [classesData, subjectsData, yearsData] = await Promise.all([
        classService.getAll().catch(() => []),
        subjectService.getAll().catch(() => []),
        academicYearService.getAll().catch(() => [])
      ]);
      
      setClasses(classesData);
      setSubjects(subjectsData);
      setAcademicYears(yearsData);
      
      // Set default filter to current academic year
      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear) {
        setFilters(prev => ({ ...prev, academic_year_id: currentYear.id.toString() }));
      } else if (yearsData.length > 0) {
        setFilters(prev => ({ ...prev, academic_year_id: yearsData[0].id.toString() }));
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const data = await teacherSubjectAssignmentService.getAll({
        academic_year_id: filters.academic_year_id ? parseInt(filters.academic_year_id) : undefined,
        class_id: filters.class_id ? parseInt(filters.class_id) : undefined,
        subject_id: filters.subject_id ? parseInt(filters.subject_id) : undefined
      });
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      showAlert('Failed to load assignments: ' + error.message, 'error');
      setAssignments([]);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const checkForConflicts = async () => {
    if (!formData.staff_id || !formData.academic_year_id) return true;
    
    try {
      const conflicts = await teacherSubjectAssignmentService.getTeacherConflicts(
        parseInt(formData.staff_id),
        parseInt(formData.academic_year_id)
      );
      
      if (conflicts && conflicts.assignments && conflicts.assignments.length > 0) {
        const existing = conflicts.assignments[0];
        const teacherInfo = staff.find(s => s.id === parseInt(formData.staff_id));
        setConflictInfo({
          teacher: teacherInfo ? `${teacherInfo.first_name} ${teacherInfo.surname}` : 'Teacher',
          class: existing.class_name,
          subject: existing.subject_name
        });
        setShowConflictWarning(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return true;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.staff_id) newErrors.staff_id = 'Teacher is required';
    if (!formData.class_id) newErrors.class_id = 'Class is required';
    if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAssignment = async () => {
    if (!validateForm()) return;
    
    if (!await checkForConflicts()) return;

    try {
      setSaving(true);
      
      const assignmentData = {
        staff_id: parseInt(formData.staff_id),
        class_id: parseInt(formData.class_id),
        subject_id: parseInt(formData.subject_id),
        academic_year_id: parseInt(formData.academic_year_id),
        is_active: formData.is_active
      };

      if (view === 'edit' && selectedAssignment) {
        await teacherSubjectAssignmentService.update(selectedAssignment.id, assignmentData);
        showAlert('Assignment updated successfully!', 'success');
      } else {
        await teacherSubjectAssignmentService.create(assignmentData);
        showAlert('Assignment created successfully!', 'success');
      }
      
      await loadAssignments();
      resetForm();
      setView('list');
      
    } catch (error) {
      if (error.message && error.message.includes('already assigned')) {
        setErrors({ duplicate: error.message });
      } else {
        showAlert('Failed to save: ' + error.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      staff_id: assignment.staff_id?.toString() || '',
      class_id: assignment.class_id?.toString() || '',
      subject_id: assignment.subject_id?.toString() || '',
      academic_year_id: assignment.academic_year_id?.toString() || '',
      is_active: assignment.is_active !== undefined ? assignment.is_active : true
    });
    setView('edit');
  };

  const handleDeleteAssignment = async (assignment) => {
    if (window.confirm(`Remove "${assignment.subject_name}" assignment from ${assignment.class_name}?`)) {
      try {
        setSaving(true);
        await teacherSubjectAssignmentService.delete(assignment.id);
        showAlert('Assignment deleted successfully!', 'success');
        await loadAssignments();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      class_id: '',
      subject_id: '',
      academic_year_id: filters.academic_year_id || '',
      is_active: true
    });
    setErrors({});
    setSelectedAssignment(null);
    setShowConflictWarning(false);
    setConflictInfo(null);
  };

  const clearFilters = () => {
    const currentYear = academicYears.find(y => y.is_current);
    setFilters({ 
      academic_year_id: currentYear ? currentYear.id.toString() : (academicYears[0]?.id.toString() || ''), 
      class_id: '', 
      subject_id: '' 
    });
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? `${staffMember.first_name} ${staffMember.surname}` : 'Unknown';
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="assign-subjects-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="assign-subjects-container">
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

        <div className="assign-header">
          <div className="header-title">
            <h1>
              <BookOpen size={28} />
              Assign Subjects
            </h1>
            <p>Assign teachers to teach specific subjects in specific classes</p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }} disabled={saving}>
            <Plus size={16} /> Add Assignment
          </button>
        </div>
        <hr className="divider" />

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label>Academic Year</label>
            <select 
              className="form-select" 
              value={filters.academic_year_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
            >
              <option value="">All Years</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.year_label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Class</label>
            <select 
              className="form-select" 
              value={filters.class_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, class_id: e.target.value }))}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Subject</label>
            <select 
              className="form-select" 
              value={filters.subject_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="table-container">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.class_name}</strong></td>
                    <td>{a.subject_name} <span className="subject-code">({a.subject_code})</span></td>
                    <td>{a.staff_name || getStaffName(a.staff_id)}</td>
                    <td>{a.academic_year_label}</td>
                    <td>
                      <span className={`status-badge ${a.is_active ? 'status-active' : 'status-inactive'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditAssignment(a)}
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteAssignment(a)}
                        disabled={saving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    <div className="empty-state">
                      <BookOpen size={48} />
                      <p>No assignments found</p>
                      <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }}>
                        <Plus size={16} /> Add Assignment
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="assign-subjects-container">
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

      <div className="form-header">
        <div>
          <button 
            onClick={() => { resetForm(); setView('list'); }}
            className="back-button"
            disabled={saving}
          >
            <ArrowLeft size={16} /> Back to Assignments
          </button>
          <h1>{view === 'create' ? 'Add Assignment' : `Edit: ${selectedAssignment?.subject_name || 'Assignment'}`}</h1>
          <p>{view === 'create' ? 'Assign a teacher to teach a subject in a class' : 'Update assignment information'}</p>
        </div>
      </div>
      <hr className="divider" />

      <div className="form-container">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveAssignment(); }}>
          <div className="form-section">
            <h2>Assignment Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Teacher <span className="required">*</span></label>
                <select
                  name="staff_id"
                  className={`form-select ${errors.staff_id ? 'error' : ''}`}
                  value={formData.staff_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Teacher</option>
                  {staff.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title ? `${t.title} ` : ''}{t.first_name} {t.surname}
                    </option>
                  ))}
                </select>
                {errors.staff_id && <span className="error-message">{errors.staff_id}</span>}
              </div>

              <div className="form-group">
                <label>Class <span className="required">*</span></label>
                <select
                  name="class_id"
                  className={`form-select ${errors.class_id ? 'error' : ''}`}
                  value={formData.class_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name} ({c.class_code})</option>
                  ))}
                </select>
                {errors.class_id && <span className="error-message">{errors.class_id}</span>}
              </div>

              <div className="form-group">
                <label>Subject <span className="required">*</span></label>
                <select
                  name="subject_id"
                  className={`form-select ${errors.subject_id ? 'error' : ''}`}
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <small className="field-hint">
                  Only subjects the teacher is qualified for will work in timetables
                </small>
                {errors.subject_id && <span className="error-message">{errors.subject_id}</span>}
              </div>

              <div className="form-group">
                <label>Academic Year <span className="required">*</span></label>
                <select
                  name="academic_year_id"
                  className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
                  value={formData.academic_year_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.year_label}</option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  Is Active?
                </label>
                <small className="field-hint">
                  Inactive assignments won't appear in timetables
                </small>
              </div>
            </div>

            {errors.duplicate && (
              <div className="alert-error-block">
                <AlertCircle size={14} />
                {errors.duplicate}
              </div>
            )}

            <div className="alert-info-block">
              <AlertCircle size={14} />
              <span>Each teacher can only be assigned to teach a specific subject in a specific class once per academic year.</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => { resetForm(); setView('list'); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : (view === 'create' ? 'Create Assignment' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>

      {/* Conflict Warning Modal */}
      {showConflictWarning && conflictInfo && (
        <div className="modal-overlay" onClick={() => setShowConflictWarning(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Teacher Conflict Warning</h2>
              <X className="modal-close" size={20} onClick={() => setShowConflictWarning(false)} />
            </div>
            <div className="modal-body">
              <div className="alert-warning">
                <AlertCircle size={20} />
                <p><strong>{conflictInfo.teacher}</strong> is already assigned to teach <strong>{conflictInfo.subject}</strong> in <strong>{conflictInfo.class}</strong> for this academic year.</p>
                <p>This may cause timetable conflicts. Do you want to continue anyway?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConflictWarning(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => {
                setShowConflictWarning(false);
                handleSaveAssignment();
              }}>
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignSubjects;