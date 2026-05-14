

// // src/components/Academics/Subjects.jsx
// import { useState } from 'react';
// import { Book, Plus, Edit, Trash2, Users, Layers, BookOpen, X, CheckCircle, Target, GraduationCap, ArrowLeft, Save } from 'lucide-react';
// import '../../../styles/subjects.css';

// function Subjects() {
//   const [subjects, setSubjects] = useState([
//     { id: 1, name: 'Mathematics', code: 'MATH101', type: 'core', category: 'BOTH', description: 'Fundamental mathematics including algebra, geometry, and calculus' },
//     { id: 2, name: 'English Language', code: 'ENG101', type: 'core', category: 'BOTH', description: 'English language, literature, and composition' },
//     { id: 3, name: 'Biology', code: 'BIO201', type: 'elective', category: 'SHS', description: 'Study of living organisms' },
//     { id: 4, name: 'Chemistry', code: 'CHEM201', type: 'elective', category: 'SHS', description: 'Study of matter and its properties' },
//     { id: 5, name: 'Physics', code: 'PHY201', type: 'elective', category: 'SHS', description: 'Study of matter, energy, and their interactions' },
//     { id: 6, name: 'Social Studies', code: 'SST101', type: 'core', category: 'JHS', description: 'History, geography, and civic education' }
//   ]);

//   const [view, setView] = useState('list'); // 'list', 'create', 'edit'
//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [showLevelModal, setShowLevelModal] = useState(false);
//   const [showProgrammeModal, setShowProgrammeModal] = useState(false);
//   const [showTeachersModal, setShowTeachersModal] = useState(false);
  
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     type: 'core',
//     category: 'BOTH',
//     description: ''
//   });

//   const [errors, setErrors] = useState({});

//   const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
//   const programmes = ['General Science', 'General Arts', 'Business', 'Visual Arts', 'Home Economics'];
//   const teachers = [
//     { id: 1, name: 'Mr. John Doe', qualified: true },
//     { id: 2, name: 'Mrs. Jane Smith', qualified: true },
//     { id: 3, name: 'Dr. James Wilson', qualified: true },
//     { id: 4, name: 'Ms. Sarah Johnson', qualified: false },
//     { id: 5, name: 'Mr. Michael Brown', qualified: true }
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   // Auto-generate subject code from name
//   const generateSubjectCode = (name) => {
//     if (!name) return '';
//     const words = name.split(' ');
//     let code = '';
//     if (words.length === 1) {
//       code = name.substring(0, 6).toUpperCase();
//     } else {
//       code = words.map(word => word[0]).join('').toUpperCase();
//     }
//     // Add random numbers to make it unique
//     return `${code}${Math.floor(Math.random() * 100)}`;
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Subject name is required';
//     if (!formData.code.trim()) newErrors.code = 'Subject code is required';
//     if (!formData.type) newErrors.type = 'Subject type is required';
//     if (!formData.category) newErrors.category = 'Category is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveSubject = () => {
//     if (!validateForm()) return;

//     if (view === 'edit' && selectedSubject) {
//       // Update existing subject
//       setSubjects(prev => prev.map(s => 
//         s.id === selectedSubject.id 
//           ? { ...s, ...formData, updated_at: new Date().toISOString() } 
//           : s
//       ));
//     } else {
//       // Add new subject
//       const newSubject = { 
//         id: Date.now(), 
//         ...formData,
//         created_at: new Date().toISOString()
//       };
//       setSubjects(prev => [...prev, newSubject]);
//     }
    
//     resetForm();
//     setView('list');
//   };

//   const handleEditSubject = (subject) => {
//     setSelectedSubject(subject);
//     setFormData({
//       name: subject.name,
//       code: subject.code,
//       type: subject.type,
//       category: subject.category,
//       description: subject.description || ''
//     });
//     setView('edit');
//   };

//   const handleDeleteSubject = (subject) => {
//     if (window.confirm(`Delete ${subject.name}? This will remove it from all assignments.`)) {
//       setSubjects(prev => prev.filter(s => s.id !== subject.id));
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       code: '',
//       type: 'core',
//       category: 'BOTH',
//       description: ''
//     });
//     setErrors({});
//     setSelectedSubject(null);
//   };

//   const getTypeBadgeClass = (type) => {
//     return type === 'core' ? 'subject-type-core' : 'subject-type-elective';
//   };

//   const getTypeLabel = (type) => {
//     return type === 'core' ? 'Core' : 'Elective';
//   };

//   // Render Subject List View
//   if (view === 'list') {
//     return (
//       <div className="subjects-container">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//           <div>
//             <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//               <Book size={28} style={{ display: 'inline', marginRight: '12px' }} />
//               Subjects
//             </h1>
//             <p style={{ color: 'var(--secondary)' }}>Master list of all subjects taught in the institution</p>
//           </div>
//           <button className="button" onClick={() => { resetForm(); setView('create'); }}>
//             <Plus size={16} /> Add Subject
//           </button>
//         </div>
//         <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//         <div className="table-container">
//           <table className="academic-years-table">
//             <thead>
//               <tr>
//                 <th>Subject Name</th>
//                 <th>Code</th>
//                 <th>Type</th>
//                 <th>Category</th>
//                 <th>Description</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subjects.map(subject => (
//                 <tr key={subject.id}>
//                   <td><strong>{subject.name}</strong></td>
//                   <td><span className="status-badge status-active">{subject.code}</span></td>
//                   <td>
//                     <span className={`status-badge ${getTypeBadgeClass(subject.type)}`}>
//                       {getTypeLabel(subject.type)}
//                     </span>
//                   </td>
//                   <td><span className="status-badge status-inactive">{subject.category}</span></td>
//                   <td style={{ maxWidth: '300px' }}>{subject.description}</td>
//                   <td className="action-buttons">
//                     <button className="action-btn edit-btn" onClick={() => handleEditSubject(subject)}>
//                       <Edit size={16} />
//                     </button>
//                     <button className="action-btn set-current-btn" onClick={() => { setSelectedSubject(subject); setShowLevelModal(true); }}>
//                       <Target size={16} /> Levels
//                     </button>
//                     {subject.type === 'elective' && (
//                       <button className="action-btn edit-btn" onClick={() => { setSelectedSubject(subject); setShowProgrammeModal(true); }}>
//                         <GraduationCap size={16} /> Programmes
//                       </button>
//                     )}
//                     <button className="action-btn archive-btn" onClick={() => { setSelectedSubject(subject); setShowTeachersModal(true); }}>
//                       <Users size={16} /> Teachers
//                     </button>
//                     <button className="action-btn delete-btn" onClick={() => handleDeleteSubject(subject)}>
//                       <Trash2 size={16} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Assign to Levels Modal */}
//         {showLevelModal && selectedSubject && (
//           <div className="modal-overlay" onClick={() => setShowLevelModal(false)}>
//             <div className="modal-container" onClick={e => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2>Assign {selectedSubject.name} to Levels</h2>
//                 <X className="modal-close" size={20} onClick={() => setShowLevelModal(false)} />
//               </div>
//               <div className="modal-body">
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                   {levels.map(level => {
//                     // Determine if checkbox should be checked based on category
//                     const isChecked = selectedSubject.category === 'BOTH' || 
//                       (selectedSubject.category === 'JHS' && level.includes('JHS')) ||
//                       (selectedSubject.category === 'SHS' && level.includes('SHS'));
                    
//                     return (
//                       <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
//                         <input type="checkbox" defaultChecked={isChecked} /> {level}
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="button button-secondary" onClick={() => setShowLevelModal(false)}>Cancel</button>
//                 <button className="button" onClick={() => setShowLevelModal(false)}>Save Assignments</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Assign to Programmes Modal */}
//         {showProgrammeModal && selectedSubject && (
//           <div className="modal-overlay" onClick={() => setShowProgrammeModal(false)}>
//             <div className="modal-container" onClick={e => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2>Assign {selectedSubject.name} to Programmes</h2>
//                 <X className="modal-close" size={20} onClick={() => setShowProgrammeModal(false)} />
//               </div>
//               <div className="modal-body">
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//                   {programmes.map(prog => (
//                     <label key={prog} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
//                       <input type="checkbox" defaultChecked={prog === 'General Science' && selectedSubject.name === 'Biology'} /> {prog}
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="button button-secondary" onClick={() => setShowProgrammeModal(false)}>Cancel</button>
//                 <button className="button" onClick={() => setShowProgrammeModal(false)}>Save Assignments</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* View Teachers Modal */}
//         {showTeachersModal && selectedSubject && (
//           <div className="modal-overlay" onClick={() => setShowTeachersModal(false)}>
//             <div className="modal-container" onClick={e => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2>Teachers Qualified for {selectedSubject.name}</h2>
//                 <X className="modal-close" size={20} onClick={() => setShowTeachersModal(false)} />
//               </div>
//               <div className="modal-body">
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                   {teachers.map(teacher => (
//                     <div key={teacher.id} className="student-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <span>{teacher.name}</span>
//                       {teacher.qualified ? (
//                         <CheckCircle size={16} color="#10b981" />
//                       ) : (
//                         <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Not Qualified</span>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="button" onClick={() => setShowTeachersModal(false)}>Close</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Render Create/Edit Form View
//   return (
//     <div className="subjects-container">
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
//             <ArrowLeft size={16} /> Back to Subjects
//           </button>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             {view === 'create' ? 'Add New Subject' : `Edit Subject: ${selectedSubject?.name}`}
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>
//             {view === 'create' ? 'Create a new subject for the curriculum' : 'Update subject information'}
//           </p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
//         <form onSubmit={(e) => { e.preventDefault(); handleSaveSubject(); }}>
//           <div className="form-section">
//             <h2>Subject Information</h2>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Subject Name <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`form-input ${errors.name ? 'error' : ''}`}
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Mathematics, Biology, History"
//                 />
//                 {errors.name && <span className="error-message">{errors.name}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Subject Code <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="code"
//                   className={`form-input ${errors.code ? 'error' : ''}`}
//                   value={formData.code}
//                   onChange={handleInputChange}
//                   placeholder="e.g., MATH101, BIO201"
//                 />
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
//                   Unique identifier for the subject
//                 </small>
//                 {errors.code && <span className="error-message">{errors.code}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Subject Type <span className="required">*</span></label>
//                 <select
//                   name="type"
//                   className={`form-select ${errors.type ? 'error' : ''}`}
//                   value={formData.type}
//                   onChange={handleInputChange}
//                 >
//                   <option value="core">Core (Required for all students)</option>
//                   <option value="elective">Elective (Optional, programme-specific)</option>
//                 </select>
//                 {errors.type && <span className="error-message">{errors.type}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Category <span className="required">*</span></label>
//                 <select
//                   name="category"
//                   className={`form-select ${errors.category ? 'error' : ''}`}
//                   value={formData.category}
//                   onChange={handleInputChange}
//                 >
//                   <option value="JHS">JHS Only</option>
//                   <option value="SHS">SHS Only</option>
//                   <option value="BOTH">Both Levels (JHS & SHS)</option>
//                 </select>
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
//                   Which educational levels does this subject belong to?
//                 </small>
//                 {errors.category && <span className="error-message">{errors.category}</span>}
//               </div>

//               <div className="form-group full-width">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   className="form-input"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Optional description of the subject content and objectives"
//                   rows="4"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
//             <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
//               Cancel
//             </button>
//             <button type="submit" className="button">
//               <Save size={16} />
//               {view === 'create' ? 'Create Subject' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Subjects;








// src/components/Academics/Subjects.jsx

import { useState, useEffect } from 'react';
import { 
  Book, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  X, 
  CheckCircle, 
  Target, 
  GraduationCap, 
  ArrowLeft, 
  Save,
  Loader,
  AlertCircle
} from 'lucide-react';
import '../../../styles/subjects.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const subjectService = {
  async getAll(subjectType = null, category = null) {
    let url = `${API_BASE_URL}/subjects/`;
    const params = [];
    if (subjectType) params.push(`subject_type=${subjectType}`);
    if (category) params.push(`category=${category}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async generateCode(name) {
    const response = await fetch(`${API_BASE_URL}/subjects/code/generate?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(subjectData) {
    const response = await fetch(`${API_BASE_URL}/subjects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, subjectData) {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async assignLevels(id, category, levels = []) {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}/assign-levels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, levels })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async assignProgrammes(id, programmeIds) {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}/assign-programmes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programme_ids: programmeIds })
    });
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

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'core',
    category: 'BOTH',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const levels = [
    { id: 1, name: 'JHS 1', category: 'JHS' },
    { id: 2, name: 'JHS 2', category: 'JHS' },
    { id: 3, name: 'JHS 3', category: 'JHS' },
    { id: 4, name: 'SHS 1', category: 'SHS' },
    { id: 5, name: 'SHS 2', category: 'SHS' },
    { id: 6, name: 'SHS 3', category: 'SHS' }
  ];

  const teachers = [
    { id: 1, name: 'Mr. John Doe', qualified: true },
    { id: 2, name: 'Mrs. Jane Smith', qualified: true },
    { id: 3, name: 'Dr. James Wilson', qualified: true },
    { id: 4, name: 'Ms. Sarah Johnson', qualified: false },
    { id: 5, name: 'Mr. Michael Brown', qualified: true }
  ];

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [subjectsData, programmesData] = await Promise.all([
        subjectService.getAll(),
        programmeService.getAll()
      ]);
      
      setSubjects(subjectsData);
      setProgrammes(programmesData);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenerateCode = async () => {
    if (!formData.name) {
      showAlert('Please enter a subject name first', 'error');
      return;
    }
    
    try {
      const result = await subjectService.generateCode(formData.name);
      setFormData(prev => ({ ...prev, code: result.suggested_code }));
      showAlert(`Suggested code: ${result.suggested_code}`, 'success');
    } catch (error) {
      showAlert('Failed to generate code: ' + error.message, 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    if (!formData.type) newErrors.type = 'Subject type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSubject = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const subjectData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        category: formData.category,
        description: formData.description || ''
      };

      if (view === 'edit' && selectedSubject) {
        await subjectService.update(selectedSubject.id, subjectData);
        showAlert('Subject updated successfully!', 'success');
      } else {
        await subjectService.create(subjectData);
        showAlert('Subject created successfully!', 'success');
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

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      type: subject.type,
      category: subject.category,
      description: subject.description || ''
    });
    setView('edit');
  };

  const handleDeleteSubject = async (subject) => {
    if (window.confirm(`Delete ${subject.name}? This will remove it from all assignments.`)) {
      try {
        setSaving(true);
        await subjectService.delete(subject.id);
        showAlert(`${subject.name} deleted successfully`, 'success');
        await loadAllData();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAssignLevels = async () => {
    try {
      setSaving(true);
      let category = formData.category;
      
      // Determine category from selected levels
      const hasJHS = selectedLevels.some(levelId => levels.find(l => l.id === levelId)?.category === 'JHS');
      const hasSHS = selectedLevels.some(levelId => levels.find(l => l.id === levelId)?.category === 'SHS');
      
      if (hasJHS && hasSHS) {
        category = 'BOTH';
      } else if (hasJHS) {
        category = 'JHS';
      } else if (hasSHS) {
        category = 'SHS';
      }
      
      await subjectService.assignLevels(selectedSubject.id, category, selectedLevels);
      showAlert('Levels assigned successfully!', 'success');
      setShowLevelModal(false);
      await loadAllData();
    } catch (error) {
      showAlert('Failed to assign levels: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProgrammes = async () => {
    try {
      setSaving(true);
      await subjectService.assignProgrammes(selectedSubject.id, selectedProgrammes);
      showAlert('Programmes assigned successfully!', 'success');
      setShowProgrammeModal(false);
      await loadAllData();
    } catch (error) {
      showAlert('Failed to assign programmes: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openLevelModal = (subject) => {
    setSelectedSubject(subject);
    // Pre-select levels based on category
    const preSelected = [];
    if (subject.category === 'BOTH') {
      levels.forEach(level => preSelected.push(level.id));
    } else if (subject.category === 'JHS') {
      levels.filter(l => l.category === 'JHS').forEach(level => preSelected.push(level.id));
    } else if (subject.category === 'SHS') {
      levels.filter(l => l.category === 'SHS').forEach(level => preSelected.push(level.id));
    }
    setSelectedLevels(preSelected);
    setShowLevelModal(true);
  };

  const openProgrammeModal = (subject) => {
    setSelectedSubject(subject);
    setSelectedProgrammes([]);
    setShowProgrammeModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'core',
      category: 'BOTH',
      description: ''
    });
    setErrors({});
    setSelectedSubject(null);
  };

  const getTypeBadgeClass = (type) => {
    return type === 'core' ? 'subject-type-core' : 'subject-type-elective';
  };

  const getTypeLabel = (type) => {
    return type === 'core' ? 'Core' : 'Elective';
  };

  if (loading) {
    return (
      <div className="subjects-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  // Render Subject List View
  if (view === 'list') {
    return (
      <div className="subjects-container">
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
              <Book size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Subjects
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Master list of all subjects taught in the institution</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {subjects.length === 0 ? (
          <div className="empty-state">
            <Book size={48} />
            <p>No subjects defined yet</p>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} />
              Add Your First Subject
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="academic-years-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.id}>
                    <td><strong>{subject.name}</strong></td>
                    <td><span className="status-badge status-active">{subject.code}</span></td>
                    <td>
                      <span className={`status-badge ${getTypeBadgeClass(subject.type)}`}>
                        {getTypeLabel(subject.type)}
                      </span>
                    </td>
                    <td><span className="status-badge status-inactive">{subject.category}</span></td>
                    <td style={{ maxWidth: '300px' }}>{subject.description || '-'}</td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditSubject(subject)}
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn level-btn" 
                        onClick={() => openLevelModal(subject)}
                        disabled={saving}
                      >
                        <Target size={16} /> Levels
                      </button>
                      {subject.type === 'elective' && (
                        <button 
                          className="action-btn programme-btn" 
                          onClick={() => openProgrammeModal(subject)}
                          disabled={saving}
                        >
                          <GraduationCap size={16} /> Programmes
                        </button>
                      )}
                      <button 
                        className="action-btn teachers-btn" 
                        onClick={() => { setSelectedSubject(subject); setShowTeachersModal(true); }}
                        disabled={saving}
                      >
                        <Users size={16} /> Teachers
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteSubject(subject)}
                        disabled={saving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign to Levels Modal */}
        {showLevelModal && selectedSubject && (
          <div className="modal-overlay" onClick={() => setShowLevelModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign {selectedSubject.name} to Levels</h2>
                <X className="modal-close" size={20} onClick={() => setShowLevelModal(false)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {levels.map(level => (
                    <label key={level.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLevels.includes(level.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLevels([...selectedLevels, level.id]);
                          } else {
                            setSelectedLevels(selectedLevels.filter(id => id !== level.id));
                          }
                        }}
                      /> 
                      {level.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="button button-secondary" 
                  onClick={() => setShowLevelModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="button" 
                  onClick={handleAssignLevels}
                  disabled={saving}
                >
                  {saving ? <Loader size={16} className="spinner" /> : 'Save Assignments'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign to Programmes Modal */}
        {showProgrammeModal && selectedSubject && (
          <div className="modal-overlay" onClick={() => setShowProgrammeModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign {selectedSubject.name} to Programmes</h2>
                <X className="modal-close" size={20} onClick={() => setShowProgrammeModal(false)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {programmes.map(prog => (
                    <label key={prog.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProgrammes.includes(prog.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProgrammes([...selectedProgrammes, prog.id]);
                          } else {
                            setSelectedProgrammes(selectedProgrammes.filter(id => id !== prog.id));
                          }
                        }}
                      /> 
                      {prog.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="button button-secondary" 
                  onClick={() => setShowProgrammeModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="button" 
                  onClick={handleAssignProgrammes}
                  disabled={saving}
                >
                  {saving ? <Loader size={16} className="spinner" /> : 'Save Assignments'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Teachers Modal */}
        {showTeachersModal && selectedSubject && (
          <div className="modal-overlay" onClick={() => setShowTeachersModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Teachers Qualified for {selectedSubject.name}</h2>
                <X className="modal-close" size={20} onClick={() => setShowTeachersModal(false)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="teacher-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{teacher.name}</span>
                      {teacher.qualified ? (
                        <CheckCircle size={16} color="#10b981" />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Not Qualified</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowTeachersModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="subjects-container">
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
            <ArrowLeft size={16} /> Back to Subjects
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Subject' : `Edit Subject: ${selectedSubject?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new subject for the curriculum' : 'Update subject information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSubject(); }}>
          <div className="form-section">
            <h2>Subject Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Subject Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Biology, History"
                  disabled={saving}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Subject Code <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    name="code"
                    className={`form-input ${errors.code ? 'error' : ''}`}
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., MATH101, BIO201"
                    style={{ flex: 1 }}
                    disabled={saving}
                  />
                  <button 
                    type="button" 
                    className="button button-secondary"
                    onClick={handleGenerateCode}
                    disabled={saving || !formData.name}
                  >
                    Generate
                  </button>
                </div>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Unique identifier for the subject
                </small>
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>

              <div className="form-group">
                <label>Subject Type <span className="required">*</span></label>
                <select
                  name="type"
                  className={`form-select ${errors.type ? 'error' : ''}`}
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="core">Core (Required for all students)</option>
                  <option value="elective">Elective (Optional, programme-specific)</option>
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  name="category"
                  className={`form-select ${errors.category ? 'error' : ''}`}
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="JHS">JHS Only</option>
                  <option value="SHS">SHS Only</option>
                  <option value="BOTH">Both Levels (JHS & SHS)</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Which educational levels does this subject belong to?
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
                  placeholder="Optional description of the subject content and objectives"
                  rows="4"
                  disabled={saving}
                />
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Subject' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Subjects;