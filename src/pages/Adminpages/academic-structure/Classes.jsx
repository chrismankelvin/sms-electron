// // src/components/Classes/Classes.jsx
// import { useState, useEffect } from 'react';
// import { Users, Plus, Edit, Eye, Trash2, UserCheck,Save, AlertTriangle, X, BookOpen, CheckCircle, School, TrendingUp, ArrowLeft } from 'lucide-react';
// import '../../../styles/classes.css';

// function Classes() {
//   const [classes, setClasses] = useState([
//     { id: 1, class_name: 'JHS 1 Science A', class_code: 'JHS1-SCI-A', level_id: 1, programme_id: null, academic_year_id: 1, form_master_id: 1, description: 'JHS 1 Science Class A', capacity: 40, currentEnrollment: 38, is_active: true },
//     { id: 2, class_name: 'JHS 1 Science B', class_code: 'JHS1-SCI-B', level_id: 1, programme_id: null, academic_year_id: 1, form_master_id: 2, description: 'JHS 1 Science Class B', capacity: 40, currentEnrollment: 37, is_active: true },
//     { id: 3, class_name: 'SHS 1 Science A', class_code: 'SHS1-SCI-A', level_id: 4, programme_id: 1, academic_year_id: 1, form_master_id: 3, description: 'SHS 1 Science Class A', capacity: 45, currentEnrollment: 44, is_active: true },
//     { id: 4, class_name: 'SHS 1 Arts A', class_code: 'SHS1-ART-A', level_id: 4, programme_id: 2, academic_year_id: 1, form_master_id: 4, description: 'SHS 1 Arts Class A', capacity: 45, currentEnrollment: 30, is_active: true },
//     { id: 5, class_name: 'JHS 2 Science A', class_code: 'JHS2-SCI-A', level_id: 2, programme_id: null, academic_year_id: 1, form_master_id: 5, description: 'JHS 2 Science Class A', capacity: 40, currentEnrollment: 25, is_active: false }
//   ]);

//   const [levels, setLevels] = useState([
//     { id: 1, name: 'JHS 1' },
//     { id: 2, name: 'JHS 2' },
//     { id: 3, name: 'JHS 3' },
//     { id: 4, name: 'SHS 1' },
//     { id: 5, name: 'SHS 2' },
//     { id: 6, name: 'SHS 3' }
//   ]);

//   const [programmes, setProgrammes] = useState([
//     { id: 1, name: 'General Science' },
//     { id: 2, name: 'General Arts' },
//     { id: 3, name: 'Business' },
//     { id: 4, name: 'Visual Arts' },
//     { id: 5, name: 'Home Economics' }
//   ]);

//   const [academicYears, setAcademicYears] = useState([
//     { id: 1, name: '2022-2023' },
//     { id: 2, name: '2023-2024' },
//     { id: 3, name: '2024-2025' }
//   ]);

//   const [staff, setStaff] = useState([
//     { id: 1, first_name: 'John', surname: 'Doe', full_name: 'Mr. John Doe' },
//     { id: 2, first_name: 'Jane', surname: 'Smith', full_name: 'Mrs. Jane Smith' },
//     { id: 3, first_name: 'James', surname: 'Wilson', full_name: 'Dr. James Wilson' },
//     { id: 4, first_name: 'Sarah', surname: 'Johnson', full_name: 'Ms. Sarah Johnson' },
//     { id: 5, first_name: 'Michael', surname: 'Brown', full_name: 'Mr. Michael Brown' },
//     { id: 6, first_name: 'Emily', surname: 'Davis', full_name: 'Mrs. Emily Davis' }
//   ]);

//   const [view, setView] = useState('list'); // 'list', 'create', 'edit'
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [showRosterModal, setShowRosterModal] = useState(false);
//   const [formData, setFormData] = useState({
//     class_name: '',
//     class_code: '',
//     level_id: '',
//     programme_id: '',
//     academic_year_id: '3',
//     form_master_id: '',
//     description: '',
//     capacity: '',
//     is_active: true
//   });

//   const [errors, setErrors] = useState({});

//   // Generate class code automatically based on class name and level
//   const generateClassCode = (className, levelId) => {
//     if (!className || !levelId) return '';
//     const level = levels.find(l => l.id === parseInt(levelId));
//     if (!level) return '';
    
//     const levelAbbr = level.name.replace(/\s/g, '').toUpperCase();
//     const words = className.split(' ');
//     let classAbbr = '';
    
//     if (words.length >= 3) {
//       classAbbr = `${words[0].substring(0, 2)}${words[2].substring(0, 1)}`.toUpperCase();
//     } else {
//       classAbbr = words.map(w => w[0]).join('').toUpperCase();
//     }
    
//     return `${levelAbbr}-${classAbbr}`;
//   };

//   // Auto-generate class code when class name or level changes
//   useEffect(() => {
//     if (formData.class_name && formData.level_id) {
//       const generatedCode = generateClassCode(formData.class_name, formData.level_id);
//       setFormData(prev => ({ ...prev, class_code: generatedCode }));
//     }
//   }, [formData.class_name, formData.level_id]);

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

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
//     if (!formData.class_code.trim()) newErrors.class_code = 'Class code is required';
//     if (!formData.level_id) newErrors.level_id = 'Level is required';
//     if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
//     if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveClass = () => {
//     if (!validateForm()) return;

//     if (view === 'edit' && selectedClass) {
//       // Update existing class
//       setClasses(prev => prev.map(c => 
//         c.id === selectedClass.id 
//           ? { 
//               ...c, 
//               ...formData, 
//               currentEnrollment: c.currentEnrollment,
//               updated_at: new Date().toISOString()
//             } 
//           : c
//       ));
//     } else {
//       // Add new class
//       const newClass = { 
//         id: Date.now(), 
//         ...formData, 
//         currentEnrollment: 0,
//         created_at: new Date().toISOString()
//       };
//       setClasses(prev => [...prev, newClass]);
//     }
    
//     resetForm();
//     setView('list');
//   };

//   const handleEditClass = (classItem) => {
//     setSelectedClass(classItem);
//     setFormData({
//       class_name: classItem.class_name,
//       class_code: classItem.class_code,
//       level_id: classItem.level_id,
//       programme_id: classItem.programme_id || '',
//       academic_year_id: classItem.academic_year_id,
//       form_master_id: classItem.form_master_id || '',
//       description: classItem.description || '',
//       capacity: classItem.capacity,
//       is_active: classItem.is_active
//     });
//     setView('edit');
//   };

//   const handleDeleteClass = (classItem) => {
//     if (classItem.currentEnrollment > 0) {
//       alert(`Cannot delete ${classItem.class_name} because it has ${classItem.currentEnrollment} enrolled students.`);
//       return;
//     }
//     if (window.confirm(`Delete ${classItem.class_name}?`)) {
//       setClasses(prev => prev.filter(c => c.id !== classItem.id));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       class_name: '',
//       class_code: '',
//       level_id: '',
//       programme_id: '',
//       academic_year_id: '3',
//       form_master_id: '',
//       description: '',
//       capacity: '',
//       is_active: true
//     });
//     setErrors({});
//     setSelectedClass(null);
//   };

//   const getCapacityPercentage = (current, capacity) => (current / capacity) * 100;
//   const getCapacityStatus = (percentage) => {
//     if (percentage >= 90) return 'danger';
//     if (percentage >= 75) return 'warning';
//     return 'normal';
//   };

//   const getLevelName = (levelId) => {
//     const level = levels.find(l => l.id === levelId);
//     return level ? level.name : 'N/A';
//   };

//   const getProgrammeName = (programmeId) => {
//     if (!programmeId) return null;
//     const programme = programmes.find(p => p.id === programmeId);
//     return programme ? programme.name : null;
//   };

//   const getAcademicYearName = (yearId) => {
//     const year = academicYears.find(y => y.id === yearId);
//     return year ? year.name : 'N/A';
//   };

//   const getFormMasterName = (staffId) => {
//     if (!staffId) return 'Not Assigned';
//     const master = staff.find(s => s.id === staffId);
//     return master ? master.full_name : 'Not Assigned';
//   };

//   // Render Class List View
//   if (view === 'list') {
//     return (
//       <div className="classes-container">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//           <div>
//             <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//               <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
//               Classes
//             </h1>
//             <p style={{ color: 'var(--secondary)' }}>Manage all classes with form masters and capacity tracking</p>
//           </div>
//           <button className="button" onClick={() => { resetForm(); setView('create'); }}>
//             <Plus size={16} /> Add Class
//           </button>
//         </div>
//         <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//         <div style={{ display: 'grid', gap: '1rem' }}>
//           {classes.map(classItem => {
//             const capacityPercent = getCapacityPercentage(classItem.currentEnrollment, classItem.capacity);
//             const capacityStatus = getCapacityStatus(capacityPercent);
//             const programmeName = getProgrammeName(classItem.programme_id);
            
//             return (
//               <div key={classItem.id} className={`class-card ${capacityStatus === 'warning' || capacityStatus === 'danger' ? 'warning' : ''}`}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
//                       <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{classItem.class_name}</h3>
//                       <span className="status-badge status-active">{classItem.class_code}</span>
//                       {classItem.is_active ? 
//                         <span className="status-badge status-active"><CheckCircle size={12} /> Active</span> : 
//                         <span className="status-badge status-inactive">Inactive</span>
//                       }
//                     </div>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
//                       <span><School size={14} style={{ display: 'inline', marginRight: '4px' }} />{getLevelName(classItem.level_id)}</span>
//                       {programmeName && <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{programmeName}</span>}
//                       <span><UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />Form Master: {getFormMasterName(classItem.form_master_id)}</span>
//                       <span><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.currentEnrollment}/{classItem.capacity} Students</span>
//                       <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{getAcademicYearName(classItem.academic_year_id)}</span>
//                     </div>
//                     <div className="capacity-bar">
//                       <div className={`capacity-fill ${capacityStatus === 'warning' ? 'warning' : capacityStatus === 'danger' ? 'danger' : ''}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
//                     </div>
//                     {capacityPercent >= 90 && 
//                       <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//                         <AlertTriangle size={12} /> Capacity warning: {capacityPercent.toFixed(0)}% full
//                       </div>
//                     }
//                   </div>
//                   <div className="action-buttons">
//                     <button className="action-btn edit-btn" onClick={() => handleEditClass(classItem)}>
//                       <Edit size={16} />
//                     </button>
//                     <button className="action-btn set-current-btn" onClick={() => { setSelectedClass(classItem); setShowRosterModal(true); }}>
//                       <Eye size={16} /> Roster
//                     </button>
//                     <button className="action-btn delete-btn" onClick={() => handleDeleteClass(classItem)}>
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Roster Modal */}
//         {showRosterModal && selectedClass && (
//           <div className="modal-overlay" onClick={() => setShowRosterModal(false)}>
//             <div className="modal-container roster-modal" onClick={e => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2>Student Roster - {selectedClass.class_name}</h2>
//                 <X className="modal-close" size={20} onClick={() => setShowRosterModal(false)} />
//               </div>
//               <div className="modal-body">
//                 <div className="student-list">
//                   {/* Student list would go here - fetch from API */}
//                   <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
//                     No students enrolled yet.
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="button" onClick={() => setShowRosterModal(false)}>Close</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Render Create/Edit Form View
//   return (
//     <div className="classes-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <div>
//           <button 
//             onClick={() => { resetForm(); setView('list'); }}
//             style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '0.5rem',
//               background: 'none',
//               border: 'none',
//               color: 'var(--primary)',
//               cursor: 'pointer',
//               fontSize: '0.875rem',
//               marginBottom: '0.5rem'
//             }}
//           >
//             <ArrowLeft size={16} /> Back to Classes
//           </button>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             {view === 'create' ? 'Add New Class' : `Edit Class: ${selectedClass?.class_name}`}
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>
//             {view === 'create' ? 'Create a new class with all details' : 'Update class information'}
//           </p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
//         <form onSubmit={(e) => { e.preventDefault(); handleSaveClass(); }}>
//           <div className="form-section">
//             <h2>Basic Information</h2>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Class Name <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="class_name"
//                   className={`form-input ${errors.class_name ? 'error' : ''}`}
//                   value={formData.class_name}
//                   onChange={handleInputChange}
//                   placeholder="e.g., JHS 1 Science A"
//                 />
//                 {errors.class_name && <span className="error-message">{errors.class_name}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Class Code <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="class_code"
//                   className={`form-input ${errors.class_code ? 'error' : ''}`}
//                   value={formData.class_code}
//                   onChange={handleInputChange}
//                   placeholder="Auto-generated"
//                   readOnly
//                   style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
//                 />
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Auto-generated from class name and level</small>
//                 {errors.class_code && <span className="error-message">{errors.class_code}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Level <span className="required">*</span></label>
//                 <select
//                   name="level_id"
//                   className={`form-select ${errors.level_id ? 'error' : ''}`}
//                   value={formData.level_id}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Select Level</option>
//                   {levels.map(level => (
//                     <option key={level.id} value={level.id}>{level.name}</option>
//                   ))}
//                 </select>
//                 {errors.level_id && <span className="error-message">{errors.level_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Programme (SHS only)</label>
//                 <select
//                   name="programme_id"
//                   className="form-select"
//                   value={formData.programme_id}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">None</option>
//                   {programmes.map(prog => (
//                     <option key={prog.id} value={prog.id}>{prog.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label>Academic Year <span className="required">*</span></label>
//                 <select
//                   name="academic_year_id"
//                   className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
//                   value={formData.academic_year_id}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Select Academic Year</option>
//                   {academicYears.map(year => (
//                     <option key={year.id} value={year.id}>{year.name}</option>
//                   ))}
//                 </select>
//                 {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Form Master</label>
//                 <select
//                   name="form_master_id"
//                   className="form-select"
//                   value={formData.form_master_id}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Select Form Master</option>
//                   {staff.map(master => (
//                     <option key={master.id} value={master.id}>{master.full_name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label>Capacity <span className="required">*</span></label>
//                 <input
//                   type="number"
//                   name="capacity"
//                   className={`form-input ${errors.capacity ? 'error' : ''}`}
//                   value={formData.capacity}
//                   onChange={handleInputChange}
//                   placeholder="Maximum number of students"
//                   min="1"
//                 />
//                 {errors.capacity && <span className="error-message">{errors.capacity}</span>}
//               </div>

//               <div className="form-group full-width">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   className="form-input"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Optional description of the class"
//                   rows="3"
//                 />
//               </div>

//               <div className="form-group">
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
//                   <input
//                     type="checkbox"
//                     name="is_active"
//                     checked={formData.is_active}
//                     onChange={handleInputChange}
//                   />
//                   Is Active?
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
//             <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
//               Cancel
//             </button>
//             <button type="submit" className="button">
//               <Save size={16} />
//               {view === 'create' ? 'Create Class' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Classes;







// src/components/Classes/Classes.jsx

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  UserCheck, 
  Save, 
  AlertTriangle, 
  X, 
  BookOpen, 
  CheckCircle, 
  School, 
  TrendingUp, 
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react';
import '../../../styles/classes.css';
import { getstaff } from '../../../services/api.service';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const classService = {
  async getAll(academicYearId = null, levelId = null, isActive = null) {
    let url = `${API_BASE_URL}/classes/`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (levelId) params.push(`level_id=${levelId}`);
    if (isActive !== null) params.push(`is_active=${isActive}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async generateCode(className, levelId) {
    const response = await fetch(`${API_BASE_URL}/classes/code/generate?class_name=${encodeURIComponent(className)}&level_id=${levelId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getStudents(classId) {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(classData) {
    const response = await fetch(`${API_BASE_URL}/classes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, classData) {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

const levelService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/levels/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const programmeService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/programmes/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
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

// import { getstaff } from '../../../services/api.service';

const staffService = {

  async getAll() {
    try {
      // Try using the imported function first
      const response = await getstaff();
      return response;
    } catch (error) {
      // Fallback to direct fetch if needed
      console.error('getstaff failed, using fallback:', error);
      const response = await fetch(`${API_BASE_URL}/staff/`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    }
  }

};

function Classes() {
  const [classes, setClasses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterStudents, setRosterStudents] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    class_name: '',
    class_code: '',
    level_id: '',
    programme_id: '',
    academic_year_id: '',
    form_master_id: '',
    description: '',
    capacity: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [classesData, levelsData, programmesData, academicYearsData, staffData] = await Promise.all([
        classService.getAll(),
        levelService.getAll(),
        programmeService.getAll(),
        academicYearService.getAll(),
        staffService.getAll()
      ]);
      
      setClasses(classesData);
      setLevels(levelsData);
      setProgrammes(programmesData);
      setAcademicYears(academicYearsData);
      setStaff(staffData);
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
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

  // Generate class code automatically based on class name and level
  const generateClassCode = async (className, levelId) => {
    if (!className || !levelId) return '';
    try {
      const result = await classService.generateCode(className, levelId);
      return result.class_code;
    } catch (error) {
      console.error('Error generating code:', error);
      return '';
    }
  };

  // Auto-generate class code when class name or level changes
  useEffect(() => {
    const updateClassCode = async () => {
      if (formData.class_name && formData.level_id) {
        const generatedCode = await generateClassCode(formData.class_name, formData.level_id);
        setFormData(prev => ({ ...prev, class_code: generatedCode }));
      }
    };
    updateClassCode();
  }, [formData.class_name, formData.level_id]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.class_code.trim()) newErrors.class_code = 'Class code is required';
    if (!formData.level_id) newErrors.level_id = 'Level is required';
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClass = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const classData = {
        class_name: formData.class_name.trim(),
        class_code: formData.class_code.trim(),
        level_id: parseInt(formData.level_id),
        programme_id: formData.programme_id ? parseInt(formData.programme_id) : null,
        academic_year_id: parseInt(formData.academic_year_id),
        form_master_id: formData.form_master_id ? parseInt(formData.form_master_id) : null,
        description: formData.description || '',
        capacity: parseInt(formData.capacity),
        is_active: formData.is_active
      };

      if (view === 'edit' && selectedClass) {
        await classService.update(selectedClass.id, classData);
        showAlert('Class updated successfully!', 'success');
      } else {
        await classService.create(classData);
        showAlert('Class created successfully!', 'success');
      }
      
      await loadAllData();
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      class_name: classItem.class_name,
      class_code: classItem.class_code || '',
      level_id: classItem.level_id.toString(),
      programme_id: classItem.programme_id?.toString() || '',
      academic_year_id: classItem.academic_year_id.toString(),
      form_master_id: classItem.form_master_id?.toString() || '',
      description: classItem.description || '',
      capacity: classItem.capacity.toString(),
      is_active: classItem.is_active
    });
    setView('edit');
  };

  const handleDeleteClass = async (classItem) => {
    if (classItem.current_enrollment > 0) {
      showAlert(`Cannot delete ${classItem.class_name} because it has ${classItem.current_enrollment} enrolled students.`, 'error');
      return;
    }
    
    if (window.confirm(`Delete ${classItem.class_name}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await classService.delete(classItem.id);
        showAlert(`${classItem.class_name} deleted successfully`, 'success');
        await loadAllData();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleViewRoster = async (classItem) => {
    try {
      setSaving(true);
      const students = await classService.getStudents(classItem.id);
      setRosterStudents(students);
      setSelectedClass(classItem);
      setShowRosterModal(true);
    } catch (error) {
      showAlert('Failed to load roster: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      class_name: '',
      class_code: '',
      level_id: '',
      programme_id: '',
      academic_year_id: '',
      form_master_id: '',
      description: '',
      capacity: '',
      is_active: true
    });
    setErrors({});
    setSelectedClass(null);
  };

  const getCapacityPercentage = (current, capacity) => (current / capacity) * 100;
  const getCapacityStatus = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const getLevelName = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : 'N/A';
  };

  const getProgrammeName = (programmeId) => {
    if (!programmeId) return null;
    const programme = programmes.find(p => p.id === programmeId);
    return programme ? programme.name : null;
  };

  const getAcademicYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'N/A';
  };

  const getFormMasterName = (staffId) => {
    if (!staffId) return 'Not Assigned';
    const master = staff.find(s => s.id === staffId);
    return master ? `${master.first_name} ${master.surname}` : 'Not Assigned';
  };

  if (loading) {
    return (
      <div className="classes-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  // Render Class List View
  if (view === 'list') {
    return (
      <div className="classes-container">
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Classes
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Manage all classes with form masters and capacity tracking</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} /> Add Class
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {classes.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No classes defined yet</p>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} />
              Add Your First Class
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {classes.map(classItem => {
              const capacityPercent = getCapacityPercentage(classItem.current_enrollment || 0, classItem.capacity);
              const capacityStatus = getCapacityStatus(capacityPercent);
              const programmeName = getProgrammeName(classItem.programme_id);
              
              return (
                <div key={classItem.id} className={`class-card ${capacityStatus === 'warning' || capacityStatus === 'danger' ? 'warning' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{classItem.class_name}</h3>
                        <span className="status-badge status-active">{classItem.class_code}</span>
                        {classItem.is_active ? 
                          <span className="status-badge status-active"><CheckCircle size={12} /> Active</span> : 
                          <span className="status-badge status-inactive">Inactive</span>
                        }
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        <span><School size={14} style={{ display: 'inline', marginRight: '4px' }} />{getLevelName(classItem.level_id)}</span>
                        {programmeName && <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{programmeName}</span>}
                        <span><UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />Form Master: {getFormMasterName(classItem.form_master_id)}</span>
                        <span><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.current_enrollment || 0}/{classItem.capacity} Students</span>
                        <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{getAcademicYearLabel(classItem.academic_year_id)}</span>
                      </div>
                      <div className="capacity-bar">
                        <div className={`capacity-fill ${capacityStatus === 'warning' ? 'warning' : capacityStatus === 'danger' ? 'danger' : ''}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                      </div>
                      {capacityPercent >= 90 && 
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertTriangle size={12} /> Capacity warning: {capacityPercent.toFixed(0)}% full
                        </div>
                      }
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditClass(classItem)}
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewRoster(classItem)}
                        disabled={saving}
                      >
                        <Eye size={16} /> Roster
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteClass(classItem)}
                        disabled={saving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Roster Modal */}
        {showRosterModal && selectedClass && (
          <div className="modal-overlay" onClick={() => setShowRosterModal(false)}>
            <div className="modal-container roster-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Student Roster - {selectedClass.class_name}</h2>
                <X className="modal-close" size={20} onClick={() => setShowRosterModal(false)} />
              </div>
              <div className="modal-body">
                <div className="student-list">
                  {rosterStudents.length > 0 ? (
                    rosterStudents.map(student => (
                      <div key={student.id} className="student-item">
                        <span><strong>{student.surname}, {student.first_name}</strong></span>
                        <span className="student-admission">{student.admission_number}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                      No students enrolled in this class yet.
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowRosterModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="classes-container">
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
            disabled={saving}
          >
            <ArrowLeft size={16} /> Back to Classes
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Class' : `Edit Class: ${selectedClass?.class_name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new class with all details' : 'Update class information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveClass(); }}>
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Class Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="class_name"
                  className={`form-input ${errors.class_name ? 'error' : ''}`}
                  value={formData.class_name}
                  onChange={handleInputChange}
                  placeholder="e.g., JHS 1 Science A"
                  disabled={saving}
                />
                {errors.class_name && <span className="error-message">{errors.class_name}</span>}
              </div>

              <div className="form-group">
                <label>Class Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="class_code"
                  className={`form-input ${errors.class_code ? 'error' : ''}`}
                  value={formData.class_code}
                  onChange={handleInputChange}
                  placeholder="Auto-generated"
                  readOnly
                  style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Auto-generated from class name and level</small>
                {errors.class_code && <span className="error-message">{errors.class_code}</span>}
              </div>

              <div className="form-group">
                <label>Level <span className="required">*</span></label>
                <select
                  name="level_id"
                  className={`form-select ${errors.level_id ? 'error' : ''}`}
                  value={formData.level_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                {errors.level_id && <span className="error-message">{errors.level_id}</span>}
              </div>

              <div className="form-group">
                <label>Programme (SHS only)</label>
                <select
                  name="programme_id"
                  className="form-select"
                  value={formData.programme_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">None</option>
                  {programmes.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
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
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.year_label}</option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
              </div>

              <div className="form-group">
                <label>Form Master</label>
                <select
                  name="form_master_id"
                  className="form-select"
                  value={formData.form_master_id}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="">Select Form Master</option>
                  {staff.map(master => (
                    <option key={master.id} value={master.id}>{master.first_name} {master.surname}</option>
                  ))}
                </select>
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
                  disabled={saving}
                />
                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of the class"
                  rows="3"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  Is Active?
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button 
              type="button" 
              className="button button-secondary" 
              onClick={() => { resetForm(); setView('list'); }}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="button" disabled={saving}>
              {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : (view === 'create' ? 'Create Class' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Classes;