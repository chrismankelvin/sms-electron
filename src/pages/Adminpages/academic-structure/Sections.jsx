
  // // src/components/Academics/Sections.jsx
  // import { useState } from 'react';
  // import { Grid, Plus, Edit, Eye, Trash2, Users, X, Layers, ArrowLeft, Save } from 'lucide-react';
  // import '../../../styles/sections.css';

  // function Sections() {
  //   const [sections, setSections] = useState([
  //     { id: 1, section_name: 'A', class_id: 1, class_name: 'JHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 40, current_enrollment: 38, description: 'Morning section A' },
  //     { id: 2, section_name: 'B', class_id: 1, class_name: 'JHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 40, current_enrollment: 37, description: 'Afternoon section B' },
  //     { id: 3, section_name: 'Morning', class_id: 3, class_name: 'SHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 45, current_enrollment: 30, description: 'Morning session' },
  //     { id: 4, section_name: 'Afternoon', class_id: 3, class_name: 'SHS 1 Science', academic_year_id: 3, academic_year_label: '2024-2025', capacity: 45, current_enrollment: 28, description: 'Afternoon session' }
  //   ]);

  //   const [classes, setClasses] = useState([
  //     { id: 1, class_name: 'JHS 1 Science', class_code: 'JHS1-SCI-A' },
  //     { id: 2, class_name: 'JHS 2 Science', class_code: 'JHS2-SCI-A' },
  //     { id: 3, class_name: 'SHS 1 Science', class_code: 'SHS1-SCI-A' },
  //     { id: 4, class_name: 'SHS 1 Arts', class_code: 'SHS1-ART-A' },
  //     { id: 5, class_name: 'SHS 2 Business', class_code: 'SHS2-BUS-A' }
  //   ]);

  //   const [academicYears, setAcademicYears] = useState([
  //     { id: 1, year_label: '2022-2023' },
  //     { id: 2, year_label: '2023-2024' },
  //     { id: 3, year_label: '2024-2025' }
  //   ]);

  //   const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  //   const [selectedSection, setSelectedSection] = useState(null);
  //   const [showStudentsModal, setShowStudentsModal] = useState(false);
  //   const [formData, setFormData] = useState({
  //     section_name: '',
  //     class_id: '',
  //     academic_year_id: '3',
  //     capacity: '',
  //     description: ''
  //   });
  //   const [errors, setErrors] = useState({});

  //   const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setFormData(prev => ({ ...prev, [name]: value }));
  //     if (errors[name]) {
  //       setErrors(prev => ({ ...prev, [name]: '' }));
  //     }
  //   };

  //   const validateForm = () => {
  //     const newErrors = {};
  //     if (!formData.section_name.trim()) newErrors.section_name = 'Section name is required';
  //     if (!formData.class_id) newErrors.class_id = 'Parent class is required';
  //     if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
  //     if (!formData.capacity) newErrors.capacity = 'Capacity is required';
      
  //     const capacity = parseInt(formData.capacity);
  //     if (capacity && (capacity < 1 || capacity > 200)) {
  //       newErrors.capacity = 'Capacity must be between 1 and 200';
  //     }
      
  //     // Check for duplicate (class_id, section_name, academic_year_id) combination
  //     const existingSection = sections.find(s => 
  //       s.class_id === parseInt(formData.class_id) && 
  //       s.section_name.toLowerCase() === formData.section_name.toLowerCase() &&
  //       s.academic_year_id === parseInt(formData.academic_year_id) &&
  //       (!selectedSection || s.id !== selectedSection.id)
  //     );
  //     if (existingSection) {
  //       newErrors.section_name = `Section "${formData.section_name}" already exists for this class in the selected academic year`;
  //     }
      
  //     setErrors(newErrors);
  //     return Object.keys(newErrors).length === 0;
  //   };

  //   const handleSaveSection = () => {
  //     if (!validateForm()) return;

  //     if (view === 'edit' && selectedSection) {
  //       // Update existing section
  //       setSections(prev => prev.map(s => 
  //         s.id === selectedSection.id 
  //           ? { 
  //               ...s, 
  //               section_name: formData.section_name,
  //               class_id: parseInt(formData.class_id),
  //               class_name: getClassName(parseInt(formData.class_id)),
  //               academic_year_id: parseInt(formData.academic_year_id),
  //               academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
  //               capacity: parseInt(formData.capacity),
  //               description: formData.description || '',
  //               updated_at: new Date().toISOString()
  //             }
  //           : s
  //       ));
  //     } else {
  //       // Add new section
  //       const newSection = {
  //         id: Date.now(),
  //         section_name: formData.section_name,
  //         class_id: parseInt(formData.class_id),
  //         class_name: getClassName(parseInt(formData.class_id)),
  //         academic_year_id: parseInt(formData.academic_year_id),
  //         academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
  //         capacity: parseInt(formData.capacity),
  //         current_enrollment: 0,
  //         description: formData.description || '',
  //         created_at: new Date().toISOString()
  //       };
  //       setSections(prev => [...prev, newSection]);
  //     }
      
  //     resetForm();
  //     setView('list');
  //   };

  //   const handleEditSection = (section) => {
  //     setSelectedSection(section);
  //     setFormData({
  //       section_name: section.section_name,
  //       class_id: section.class_id.toString(),
  //       academic_year_id: section.academic_year_id.toString(),
  //       capacity: section.capacity.toString(),
  //       description: section.description || ''
  //     });
  //     setView('edit');
  //   };

  //   const handleDeleteSection = (section) => {
  //     if (section.current_enrollment > 0) {
  //       alert(`Cannot delete section ${section.section_name} because it has ${section.current_enrollment} students.`);
  //       return;
  //     }
  //     if (window.confirm(`Delete section "${section.section_name}" from ${section.class_name}?`)) {
  //       setSections(prev => prev.filter(s => s.id !== section.id));
  //     }
  //   };

  //   const resetForm = () => {
  //     setFormData({
  //       section_name: '',
  //       class_id: '',
  //       academic_year_id: '3',
  //       capacity: '',
  //       description: ''
  //     });
  //     setErrors({});
  //     setSelectedSection(null);
  //   };

  //   const getClassName = (classId) => {
  //     const classObj = classes.find(c => c.id === classId);
  //     return classObj ? classObj.class_name : 'Unknown Class';
  //   };

  //   const getAcademicYearLabel = (yearId) => {
  //     const year = academicYears.find(y => y.id === yearId);
  //     return year ? year.year_label : 'Unknown Year';
  //   };

  //   // Render List View
  //   if (view === 'list') {
  //     return (
  //       <div className="sections-container">
  //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
  //           <div>
  //             <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
  //               <Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />
  //               Sections
  //             </h1>
  //             <p style={{ color: 'var(--secondary)' }}>Subdivide classes into manageable sections</p>
  //           </div>
  //           <button className="button" onClick={() => { resetForm(); setView('create'); }}>
  //             <Plus size={16} /> Add Section
  //           </button>
  //         </div>
  //         <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

  //         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
  //           {sections.map(section => {
  //             const percentage = (section.current_enrollment / section.capacity) * 100;
  //             return (
  //               <div key={section.id} className="section-card">
  //                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
  //                   <div>
  //                     <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Section {section.section_name}</h3>
  //                     <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{section.class_name}</div>
  //                   </div>
  //                   <div className="action-buttons">
  //                     <button className="action-btn edit-btn" onClick={() => handleEditSection(section)}>
  //                       <Edit size={16} />
  //                     </button>
  //                     <button className="action-btn set-current-btn" onClick={() => { setSelectedSection(section); setShowStudentsModal(true); }}>
  //                       <Eye size={16} />
  //                     </button>
  //                     <button className="action-btn delete-btn" onClick={() => handleDeleteSection(section)}>
  //                       <Trash2 size={16} />
  //                     </button>
  //                   </div>
  //                 </div>
  //                 {section.description && (
  //                   <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{section.description}</p>
  //                 )}
  //                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
  //                   <span><Users size={14} style={{ display: 'inline', marginRight: '4px' }} />{section.current_enrollment}/{section.capacity}</span>
  //                   <span>{section.academic_year_label}</span>
  //                 </div>
  //                 <div className="capacity-bar" style={{ marginTop: '0.5rem' }}>
  //                   <div className="capacity-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
  //                 </div>
  //                 {percentage >= 90 && (
  //                   <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem' }}>
  //                     ⚠️ Capacity warning: {percentage.toFixed(0)}% full
  //                   </div>
  //                 )}
  //               </div>
  //             );
  //           })}
  //         </div>

  //         {/* Students Modal (kept as modal since it's a view-only action) */}
  //         {showStudentsModal && selectedSection && (
  //           <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
  //             <div className="modal-container" onClick={e => e.stopPropagation()}>
  //               <div className="modal-header">
  //                 <h2>Students - Section {selectedSection.section_name} ({selectedSection.class_name})</h2>
  //                 <X className="modal-close" size={20} onClick={() => setShowStudentsModal(false)} />
  //               </div>
  //               <div className="modal-body">
  //                 <p>Student list would appear here. Currently {selectedSection.current_enrollment} enrolled.</p>
  //               </div>
  //               <div className="modal-footer">
  //                 <button className="button" onClick={() => setShowStudentsModal(false)}>Close</button>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   }

  //   // Render Create/Edit Form View
  //   return (
  //     <div className="sections-container">
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
  //             <ArrowLeft size={16} /> Back to Sections
  //           </button>
  //           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
  //             {view === 'create' ? 'Add New Section' : `Edit Section: ${selectedSection?.section_name}`}
  //           </h1>
  //           <p style={{ color: 'var(--secondary)' }}>
  //             {view === 'create' ? 'Create a new section for a class' : 'Update section information'}
  //           </p>
  //         </div>
  //       </div>
  //       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

  //       <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
  //         <form onSubmit={(e) => { e.preventDefault(); handleSaveSection(); }}>
  //           <div className="form-section">
  //             <h2>Section Details</h2>
  //             <div className="form-grid">
  //               <div className="form-group">
  //                 <label>Section Name <span className="required">*</span></label>
  //                 <input
  //                   type="text"
  //                   name="section_name"
  //                   className={`form-input ${errors.section_name ? 'error' : ''}`}
  //                   value={formData.section_name}
  //                   onChange={handleInputChange}
  //                   placeholder="e.g., A, B, Morning, Afternoon"
  //                 />
  //                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
  //                   Name must be unique per class per academic year
  //                 </small>
  //                 {errors.section_name && <span className="error-message">{errors.section_name}</span>}
  //               </div>

  //               <div className="form-group">
  //                 <label>Parent Class <span className="required">*</span></label>
  //                 <select
  //                   name="class_id"
  //                   className={`form-select ${errors.class_id ? 'error' : ''}`}
  //                   value={formData.class_id}
  //                   onChange={handleInputChange}
  //                 >
  //                   <option value="">Select Class</option>
  //                   {classes.map(cls => (
  //                     <option key={cls.id} value={cls.id}>{cls.class_name} ({cls.class_code})</option>
  //                   ))}
  //                 </select>
  //                 {errors.class_id && <span className="error-message">{errors.class_id}</span>}
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
  //                     <option key={year.id} value={year.id}>{year.year_label}</option>
  //                   ))}
  //                 </select>
  //                 {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
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
  //                   max="200"
  //                 />
  //                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
  //                   Maximum students allowed in this section (1-200)
  //                 </small>
  //                 {errors.capacity && <span className="error-message">{errors.capacity}</span>}
  //               </div>

  //               <div className="form-group full-width">
  //                 <label>Description</label>
  //                 <textarea
  //                   name="description"
  //                   className="form-input"
  //                   value={formData.description}
  //                   onChange={handleInputChange}
  //                   placeholder="Optional description of this section"
  //                   rows="3"
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
  //               {view === 'create' ? 'Create Section' : 'Save Changes'}
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }

  // export default Sections;






  // src/components/Academics/Sections.jsx

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  X, 
  Layers, 
  ArrowLeft, 
  Save,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../../../styles/sections.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const sectionService = {
  async getAll(classId = null, academicYearId = null) {
    let url = `${API_BASE_URL}/sections/`;
    const params = [];
    if (classId) params.push(`class_id=${classId}`);
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getByClass(classId, academicYearId = null) {
    let url = `${API_BASE_URL}/sections/by-class/${classId}`;
    if (academicYearId) url += `?academic_year_id=${academicYearId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getStudents(sectionId) {
    const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/students`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(sectionData) {
    const response = await fetch(`${API_BASE_URL}/sections/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, sectionData) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

const classService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/classes/`);
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

function Sections() {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    section_name: '',
    class_id: '',
    academic_year_id: '',
    capacity: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sectionsData, classesData, academicYearsData] = await Promise.all([
        sectionService.getAll(),
        classService.getAll(),
        academicYearService.getAll()
      ]);
      
      setSections(sectionsData);
      setClasses(classesData);
      setAcademicYears(academicYearsData);
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSection = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const sectionData = {
        section_name: formData.section_name.trim(),
        class_id: parseInt(formData.class_id),
        academic_year_id: parseInt(formData.academic_year_id),
        capacity: parseInt(formData.capacity),
        description: formData.description || ''
      };

      if (view === 'edit' && selectedSection) {
        await sectionService.update(selectedSection.id, sectionData);
        showAlert('Section updated successfully!', 'success');
      } else {
        await sectionService.create(sectionData);
        showAlert('Section created successfully!', 'success');
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

  const handleDeleteSection = async (section) => {
    if (section.current_enrollment > 0) {
      showAlert(`Cannot delete section ${section.section_name} because it has ${section.current_enrollment} students.`, 'error');
      return;
    }
    
    if (window.confirm(`Delete section "${section.section_name}" from ${section.class_name}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await sectionService.delete(section.id);
        showAlert(`Section "${section.section_name}" deleted successfully`, 'success');
        await loadAllData();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleViewStudents = async (section) => {
    try {
      setSaving(true);
      const students = await sectionService.getStudents(section.id);
      setSectionStudents(students);
      setSelectedSection(section);
      setShowStudentsModal(true);
    } catch (error) {
      showAlert('Failed to load students: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      section_name: '',
      class_id: '',
      academic_year_id: '',
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

  if (loading) {
    return (
      <div className="sections-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="sections-container">
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
              <Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Sections
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Subdivide classes into manageable sections</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} /> Add Section
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {sections.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} />
            <p>No sections defined yet</p>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} />
              Add Your First Section
            </button>
          </div>
        ) : (
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
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditSection(section)}
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewStudents(section)}
                        disabled={saving}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteSection(section)}
                        disabled={saving}
                      >
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
        )}

        {/* Students Modal */}
        {showStudentsModal && selectedSection && (
          <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Students - Section {selectedSection.section_name} ({selectedSection.class_name})</h2>
                <X className="modal-close" size={20} onClick={() => setShowStudentsModal(false)} />
              </div>
              <div className="modal-body">
                {sectionStudents.length > 0 ? (
                  <div className="student-list">
                    {sectionStudents.map(student => (
                      <div key={student.id} className="student-item">
                        <span><strong>{student.surname}, {student.first_name}</strong></span>
                        <span className="student-admission">{student.admission_number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                    No students enrolled in this section yet.
                  </div>
                )}
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                  <strong>Total Enrolled:</strong> {selectedSection.current_enrollment} students
                </div>
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Section' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Sections;