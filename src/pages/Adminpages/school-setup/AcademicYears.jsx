// import { useState } from 'react';
// import {
//   Calendar,
//   Plus,
//   Copy,
//   Edit,
//   Archive,
//   Star,
//   Trash2,
//   X,
//   Check,
//   AlertCircle,
//   ChevronRight,
//   FileText,
//   BookOpen,
//   Users,
//   Clock
// } from 'lucide-react';
// import '../../../styles/academic-years.css';

// function AcademicYears() {
//   const [academicYears, setAcademicYears] = useState([
//     {
//       id: 1,
//       yearLabel: '2022-2023',
//       startDate: '2022-08-15',
//       endDate: '2023-06-10',
//       status: 'Archived',
//       isCurrent: false
//     },
//     {
//       id: 2,
//       yearLabel: '2023-2024',
//       startDate: '2023-08-14',
//       endDate: '2024-06-08',
//       status: 'Inactive',
//       isCurrent: false
//     },
//     {
//       id: 3,
//       yearLabel: '2024-2025',
//       startDate: '2024-08-12',
//       endDate: '2025-06-06',
//       status: 'Active',
//       isCurrent: true
//     }
//   ]);

//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showCloneModal, setShowCloneModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedYear, setSelectedYear] = useState(null);
//   const [formData, setFormData] = useState({
//     yearLabel: '',
//     startDate: '',
//     endDate: '',
//     status: 'Active'
//   });
//   const [cloneOptions, setCloneOptions] = useState({
//     classes: true,
//     subjects: true,
//     assignments: true,
//     fees: false,
//     exams: false
//   });

//   const statusOptions = ['Active', 'Inactive', 'Archived'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCloneOptionChange = (option) => {
//     setCloneOptions(prev => ({
//       ...prev,
//       [option]: !prev[option]
//     }));
//   };

//   const handleAddYear = () => {
//     if (!formData.yearLabel || !formData.startDate || !formData.endDate) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     const newYear = {
//       id: Date.now(),
//       ...formData,
//       isCurrent: false
//     };

//     setAcademicYears(prev => [...prev, newYear]);
//     setShowAddModal(false);
//     setFormData({
//       yearLabel: '',
//       startDate: '',
//       endDate: '',
//       status: 'Active'
//     });
//   };

//   const handleEditYear = () => {
//     if (!selectedYear) return;

//     setAcademicYears(prev => prev.map(year =>
//       year.id === selectedYear.id
//         ? { ...year, ...formData }
//         : year
//     ));
//     setShowEditModal(false);
//     setSelectedYear(null);
//     setFormData({
//       yearLabel: '',
//       startDate: '',
//       endDate: '',
//       status: 'Active'
//     });
//   };

//   const handleSetAsCurrent = (year) => {
//     setAcademicYears(prev => prev.map(y => ({
//       ...y,
//       isCurrent: y.id === year.id,
//       status: y.id === year.id ? 'Active' : y.status === 'Active' ? 'Inactive' : y.status
//     })));
//   };

//   const handleArchiveYear = (year) => {
//     if (year.isCurrent) {
//       alert('Cannot archive the current academic year. Please set another year as current first.');
//       return;
//     }
    
//     setAcademicYears(prev => prev.map(y =>
//       y.id === year.id
//         ? { ...y, status: 'Archived' }
//         : y
//     ));
//   };

//   const handleDeleteYear = (year) => {
//     if (year.isCurrent) {
//       alert('Cannot delete the current academic year. Please set another year as current first.');
//       return;
//     }
    
//     if (window.confirm(`Are you sure you want to delete ${year.yearLabel}? This action cannot be undone.`)) {
//       setAcademicYears(prev => prev.filter(y => y.id !== year.id));
//     }
//   };

//   const handleCloneFromPrevious = () => {
//     const previousYear = academicYears.find(y => y.isCurrent);
//     if (!previousYear) {
//       alert('No active academic year found to clone from.');
//       return;
//     }

//     const newYearLabel = `${parseInt(previousYear.yearLabel.split('-')[0]) + 1}-${parseInt(previousYear.yearLabel.split('-')[1]) + 1}`;
    
//     setFormData({
//       yearLabel: newYearLabel,
//       startDate: '',
//       endDate: '',
//       status: 'Active'
//     });
    
//     setShowCloneModal(true);
//   };

//   const confirmClone = () => {
//     if (!formData.yearLabel || !formData.startDate || !formData.endDate) {
//       alert('Please fill in year details');
//       return;
//     }

//     const newYear = {
//       id: Date.now(),
//       ...formData,
//       isCurrent: false
//     };

//     setAcademicYears(prev => [...prev, newYear]);
//     setShowCloneModal(false);
//     setFormData({
//       yearLabel: '',
//       startDate: '',
//       endDate: '',
//       status: 'Active'
//     });
//     setCloneOptions({
//       classes: true,
//       subjects: true,
//       assignments: true,
//       fees: false,
//       exams: false
//     });
    
//     // Here you would actually clone the data from previous year
//     console.log('Cloning with options:', cloneOptions);
//   };

//   const openEditModal = (year) => {
//     setSelectedYear(year);
//     setFormData({
//       yearLabel: year.yearLabel,
//       startDate: year.startDate,
//       endDate: year.endDate,
//       status: year.status
//     });
//     setShowEditModal(true);
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'Active': return 'status-active';
//       case 'Inactive': return 'status-inactive';
//       case 'Archived': return 'status-archived';
//       default: return 'status-inactive';
//     }
//   };

//   return (
//     <div className="academic-years-container">
//       {/* Page Header */}
//       <div className="header-actions">
//         <div className="page-title-section">
//           <h1>
//             <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Academic Years
//           </h1>
//           <p>Define school calendar years and manage academic sessions</p>
//         </div>
//         <div style={{ display: 'flex', gap: '0.75rem' }}>
//           <button className="button clone-btn" onClick={handleCloneFromPrevious}>
//             <Copy size={16} />
//             Clone from Previous Year
//           </button>
//           <button className="button" onClick={() => setShowAddModal(true)}>
//             <Plus size={16} />
//             Add Academic Year
//           </button>
//         </div>
//       </div>

//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {/* Academic Years Table */}
//       <div className="table-container">
//         <table className="academic-years-table">
//           <thead>
//             <tr>
//               <th>Year Label</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Status</th>
//               <th>Is Current?</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {academicYears.length > 0 ? (
//               academicYears.map(year => (
//                 <tr key={year.id}>
//                   <td>
//                     <strong>{year.yearLabel}</strong>
//                   </td>
//                   <td>{new Date(year.startDate).toLocaleDateString()}</td>
//                   <td>{new Date(year.endDate).toLocaleDateString()}</td>
//                   <td>
//                     <span className={`status-badge ${getStatusColor(year.status)}`}>
//                       {year.status === 'Active' && <Check size={12} />}
//                       {year.status === 'Archived' && <Archive size={12} />}
//                       {year.status}
//                     </span>
//                   </td>
//                   <td>
//                     {year.isCurrent ? (
//                       <span className="current-badge">
//                         <Star size={12} />
//                         Current
//                       </span>
//                     ) : (
//                       <span className="not-current">No</span>
//                     )}
//                   </td>
//                   <td>
//                     <div className="action-buttons">
//                       <button
//                         className="action-btn edit-btn"
//                         onClick={() => openEditModal(year)}
//                         title="Edit"
//                       >
//                         <Edit size={16} />
//                       </button>
//                       {!year.isCurrent && year.status !== 'Archived' && (
//                         <button
//                           className="action-btn archive-btn"
//                           onClick={() => handleArchiveYear(year)}
//                           title="Archive"
//                         >
//                           <Archive size={16} />
//                         </button>
//                       )}
//                       {!year.isCurrent && (
//                         <button
//                           className="action-btn set-current-btn"
//                           onClick={() => handleSetAsCurrent(year)}
//                           title="Set as Current"
//                         >
//                           <Star size={16} />
//                         </button>
//                       )}
//                       {!year.isCurrent && year.status === 'Archived' && (
//                         <button
//                           className="action-btn delete-btn"
//                           onClick={() => handleDeleteYear(year)}
//                           title="Delete"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6">
//                   <div className="empty-state">
//                     <Calendar size={48} />
//                     <p>No academic years defined yet</p>
//                     <button className="button" onClick={() => setShowAddModal(true)}>
//                       <Plus size={16} />
//                       Add Your First Academic Year
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Year Modal */}
//       {showAddModal && (
//         <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Add Academic Year</h2>
//               <X className="modal-close" size={20} onClick={() => setShowAddModal(false)} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">
//                   Year Label <span className="required">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="yearLabel"
//                   className="form-input"
//                   value={formData.yearLabel}
//                   onChange={handleInputChange}
//                   placeholder="e.g., 2024-2025"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   Start Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   className="form-input"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   End Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   className="form-input"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Status</label>
//                 <select
//                   name="status"
//                   className="form-select"
//                   value={formData.status}
//                   onChange={handleInputChange}
//                 >
//                   {statusOptions.map(option => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => setShowAddModal(false)}>
//                 Cancel
//               </button>
//               <button className="button" onClick={handleAddYear}>
//                 Add Year
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Year Modal */}
//       {showEditModal && selectedYear && (
//         <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Edit Academic Year</h2>
//               <X className="modal-close" size={20} onClick={() => setShowEditModal(false)} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">
//                   Year Label <span className="required">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="yearLabel"
//                   className="form-input"
//                   value={formData.yearLabel}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   Start Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   className="form-input"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   End Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   className="form-input"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Status</label>
//                 <select
//                   name="status"
//                   className="form-select"
//                   value={formData.status}
//                   onChange={handleInputChange}
//                 >
//                   {statusOptions.map(option => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => setShowEditModal(false)}>
//                 Cancel
//               </button>
//               <button className="button" onClick={handleEditYear}>
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Clone from Previous Year Modal */}
//       {showCloneModal && (
//         <div className="modal-overlay" onClick={() => setShowCloneModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Clone from Previous Year</h2>
//               <X className="modal-close" size={20} onClick={() => setShowCloneModal(false)} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">
//                   New Year Label <span className="required">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="yearLabel"
//                   className="form-input"
//                   value={formData.yearLabel}
//                   onChange={handleInputChange}
//                   placeholder="e.g., 2025-2026"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   Start Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   className="form-input"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   End Date <span className="required">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   className="form-input"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                 />
//               </div>
              
//               <div className="form-section-title" style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
//                 <Copy size={16} />
//                 What to clone from previous year?
//               </div>
              
//               <div className="clone-options">
//                 <div className={`clone-option ${cloneOptions.classes ? 'selected' : ''}`}>
//                   <input
//                     type="checkbox"
//                     id="clone-classes"
//                     checked={cloneOptions.classes}
//                     onChange={() => handleCloneOptionChange('classes')}
//                   />
//                   <label htmlFor="clone-classes">
//                     Classes & Sections
//                     <div className="clone-option-description">Copy all class structures and section divisions</div>
//                   </label>
//                 </div>
                
//                 <div className={`clone-option ${cloneOptions.subjects ? 'selected' : ''}`}>
//                   <input
//                     type="checkbox"
//                     id="clone-subjects"
//                     checked={cloneOptions.subjects}
//                     onChange={() => handleCloneOptionChange('subjects')}
//                   />
//                   <label htmlFor="clone-subjects">
//                     Subjects & Syllabus
//                     <div className="clone-option-description">Copy subject allocations and syllabus structure</div>
//                   </label>
//                 </div>
                
//                 <div className={`clone-option ${cloneOptions.assignments ? 'selected' : ''}`}>
//                   <input
//                     type="checkbox"
//                     id="clone-assignments"
//                     checked={cloneOptions.assignments}
//                     onChange={() => handleCloneOptionChange('assignments')}
//                   />
//                   <label htmlFor="clone-assignments">
//                     Assignments & Exams
//                     <div className="clone-option-description">Copy assignment templates and exam schedules</div>
//                   </label>
//                 </div>
                
//                 <div className={`clone-option ${cloneOptions.fees ? 'selected' : ''}`}>
//                   <input
//                     type="checkbox"
//                     id="clone-fees"
//                     checked={cloneOptions.fees}
//                     onChange={() => handleCloneOptionChange('fees')}
//                   />
//                   <label htmlFor="clone-fees">
//                     Fee Structures
//                     <div className="clone-option-description">Copy fee categories and amounts (optional)</div>
//                   </label>
//                 </div>
                
//                 <div className={`clone-option ${cloneOptions.exams ? 'selected' : ''}`}>
//                   <input
//                     type="checkbox"
//                     id="clone-exams"
//                     checked={cloneOptions.exams}
//                     onChange={() => handleCloneOptionChange('exams')}
//                   />
//                   <label htmlFor="clone-exams">
//                     Exam Templates
//                     <div className="clone-option-description">Copy exam patterns and grading scales (optional)</div>
//                   </label>
//                 </div>
//               </div>
              
//               <div className="alert-info" style={{ 
//                 marginTop: '1rem', 
//                 padding: '0.75rem', 
//                 backgroundColor: 'rgba(59, 130, 246, 0.1)', 
//                 borderRadius: '0.375rem',
//                 fontSize: '0.875rem',
//                 display: 'flex',
//                 alignItems: 'start',
//                 gap: '0.5rem'
//               }}>
//                 <AlertCircle size={16} style={{ marginTop: '2px' }} />
//                 <span>Student and staff data will not be cloned. Only structure and templates will be copied.</span>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => setShowCloneModal(false)}>
//                 Cancel
//               </button>
//               <button className="button clone-btn" onClick={confirmClone}>
//                 <Copy size={16} />
//                 Clone & Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AcademicYears;








// src/components/Academics/AcademicYears.jsx
import { useState } from 'react';
import {
  Calendar,
  Plus,
  Copy,
  Edit,
  Archive,
  Star,
  Trash2,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Save
} from 'lucide-react';
import '../../../styles/academic-years.css';

function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([
    {
      id: 1,
      year_label: '2022-2023',
      start_date: '2022-08-15',
      end_date: '2023-06-10',
      status: 'archived',
      is_current: false
    },
    {
      id: 2,
      year_label: '2023-2024',
      start_date: '2023-08-14',
      end_date: '2024-06-08',
      status: 'inactive',
      is_current: false
    },
    {
      id: 3,
      year_label: '2024-2025',
      start_date: '2024-08-12',
      end_date: '2025-06-06',
      status: 'active',
      is_current: true
    }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedYear, setSelectedYear] = useState(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [formData, setFormData] = useState({
    year_label: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });
  const [cloneOptions, setCloneOptions] = useState({
    classes: true,
    subjects: true,
    assignments: true,
    fees: false,
    exams: false
  });
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCloneOptionChange = (option) => {
    setCloneOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.year_label.trim()) newErrors.year_label = 'Year label is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Validate that end date is after start date
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveYear = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedYear) {
      // Update existing year
      setAcademicYears(prev => prev.map(year =>
        year.id === selectedYear.id
          ? { 
              ...year, 
              ...formData,
              updated_at: new Date().toISOString()
            }
          : year
      ));
    } else {
      // Add new year
      const newYear = {
        id: Date.now(),
        ...formData,
        is_current: false,
        created_at: new Date().toISOString()
      };
      setAcademicYears(prev => [...prev, newYear]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditYear = (year) => {
    setSelectedYear(year);
    setFormData({
      year_label: year.year_label,
      start_date: year.start_date,
      end_date: year.end_date,
      status: year.status
    });
    setView('edit');
  };

  const handleSetAsCurrent = (year) => {
    if (year.status === 'archived') {
      alert('Cannot set an archived year as current. Please activate it first.');
      return;
    }
    
    setAcademicYears(prev => prev.map(y => ({
      ...y,
      is_current: y.id === year.id,
      status: y.id === year.id ? 'active' : y.status
    })));
  };

  const handleArchiveYear = (year) => {
    if (year.is_current) {
      alert('Cannot archive the current academic year. Please set another year as current first.');
      return;
    }
    
    setAcademicYears(prev => prev.map(y =>
      y.id === year.id
        ? { ...y, status: 'archived' }
        : y
    ));
  };

  const handleActivateYear = (year) => {
    if (year.is_current) {
      alert('This year is already current. To activate another year, set it as current.');
      return;
    }
    
    setAcademicYears(prev => prev.map(y =>
      y.id === year.id
        ? { ...y, status: 'active' }
        : y
    ));
  };

  const handleDeleteYear = (year) => {
    if (year.is_current) {
      alert('Cannot delete the current academic year. Please set another year as current first.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${year.year_label}? This action cannot be undone.`)) {
      setAcademicYears(prev => prev.filter(y => y.id !== year.id));
    }
  };

  const handleCloneFromPrevious = () => {
    const previousYear = academicYears.find(y => y.is_current);
    if (!previousYear) {
      alert('No active academic year found to clone from.');
      return;
    }

    const newYearLabel = `${parseInt(previousYear.year_label.split('-')[0]) + 1}-${parseInt(previousYear.year_label.split('-')[1]) + 1}`;
    
    setFormData({
      year_label: newYearLabel,
      start_date: '',
      end_date: '',
      status: 'active'
    });
    
    setShowCloneModal(true);
  };

  const confirmClone = () => {
    if (!formData.year_label || !formData.start_date || !formData.end_date) {
      alert('Please fill in year details');
      return;
    }

    const newYear = {
      id: Date.now(),
      year_label: formData.year_label,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'active',
      is_current: false,
      created_at: new Date().toISOString()
    };

    setAcademicYears(prev => [...prev, newYear]);
    setShowCloneModal(false);
    setFormData({
      year_label: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setCloneOptions({
      classes: true,
      subjects: true,
      assignments: true,
      fees: false,
      exams: false
    });
    
    // Here you would actually clone the data from previous year
    console.log('Cloning with options:', cloneOptions);
  };

  const resetForm = () => {
    setFormData({
      year_label: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setErrors({});
    setSelectedYear(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'archived': return 'status-archived';
      default: return 'status-inactive';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="academic-years-container">
        {/* Page Header */}
        <div className="header-actions">
          <div className="page-title-section">
            <h1>
              <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Years
            </h1>
            <p>Define school calendar years and manage academic sessions</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button clone-btn" onClick={handleCloneFromPrevious}>
              <Copy size={16} />
              Clone from Previous Year
            </button>
            <button className="button" onClick={() => { resetForm(); setView('create'); }}>
              <Plus size={16} />
              Add Academic Year
            </button>
          </div>
        </div>

        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {/* Academic Years Table */}
        <div className="table-container">
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Year Label</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Is Current?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.length > 0 ? (
                academicYears.map(year => (
                  <tr key={year.id}>
                    <td><strong>{year.year_label}</strong></td>
                    <td>{new Date(year.start_date).toLocaleDateString()}</td>
                    <td>{new Date(year.end_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(year.status)}`}>
                        {year.status === 'active' && <Check size={12} />}
                        {year.status === 'archived' && <Archive size={12} />}
                        {getStatusLabel(year.status)}
                      </span>
                    </td>
                    <td>
                      {year.is_current ? (
                        <span className="current-badge">
                          <Star size={12} />
                          Current
                        </span>
                      ) : (
                        <span className="not-current">No</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditYear(year)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {year.status !== 'archived' && !year.is_current && (
                          <button
                            className="action-btn archive-btn"
                            onClick={() => handleArchiveYear(year)}
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        {year.status === 'archived' && !year.is_current && (
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleActivateYear(year)}
                            title="Activate"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {!year.is_current && year.status !== 'archived' && (
                          <button
                            className="action-btn set-current-btn"
                            onClick={() => handleSetAsCurrent(year)}
                            title="Set as Current"
                          >
                            <Star size={16} />
                          </button>
                        )}
                        {!year.is_current && year.status === 'archived' && (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteYear(year)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <Calendar size={48} />
                      <p>No academic years defined yet</p>
                      <button className="button" onClick={() => { resetForm(); setView('create'); }}>
                        <Plus size={16} />
                        Add Your First Academic Year
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clone from Previous Year Modal */}
        {showCloneModal && (
          <div className="modal-overlay" onClick={() => setShowCloneModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Clone from Previous Year</h2>
                <X className="modal-close" size={20} onClick={() => setShowCloneModal(false)} />
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    New Year Label <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="year_label"
                    className="form-input"
                    value={formData.year_label}
                    onChange={handleInputChange}
                    placeholder="e.g., 2025-2026"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-input"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-input"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-section-title" style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                  <Copy size={16} />
                  What to clone from previous year?
                </div>
                
                <div className="clone-options">
                  <div className={`clone-option ${cloneOptions.classes ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id="clone-classes"
                      checked={cloneOptions.classes}
                      onChange={() => handleCloneOptionChange('classes')}
                    />
                    <label htmlFor="clone-classes">
                      Classes & Sections
                      <div className="clone-option-description">Copy all class structures and section divisions</div>
                    </label>
                  </div>
                  
                  <div className={`clone-option ${cloneOptions.subjects ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id="clone-subjects"
                      checked={cloneOptions.subjects}
                      onChange={() => handleCloneOptionChange('subjects')}
                    />
                    <label htmlFor="clone-subjects">
                      Subjects & Syllabus
                      <div className="clone-option-description">Copy subject allocations and syllabus structure</div>
                    </label>
                  </div>
                  
                  <div className={`clone-option ${cloneOptions.assignments ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id="clone-assignments"
                      checked={cloneOptions.assignments}
                      onChange={() => handleCloneOptionChange('assignments')}
                    />
                    <label htmlFor="clone-assignments">
                      Assignments & Exams
                      <div className="clone-option-description">Copy assignment templates and exam schedules</div>
                    </label>
                  </div>
                  
                  <div className={`clone-option ${cloneOptions.fees ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id="clone-fees"
                      checked={cloneOptions.fees}
                      onChange={() => handleCloneOptionChange('fees')}
                    />
                    <label htmlFor="clone-fees">
                      Fee Structures
                      <div className="clone-option-description">Copy fee categories and amounts (optional)</div>
                    </label>
                  </div>
                  
                  <div className={`clone-option ${cloneOptions.exams ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id="clone-exams"
                      checked={cloneOptions.exams}
                      onChange={() => handleCloneOptionChange('exams')}
                    />
                    <label htmlFor="clone-exams">
                      Exam Templates
                      <div className="clone-option-description">Copy exam patterns and grading scales (optional)</div>
                    </label>
                  </div>
                </div>
                
                <div className="alert-info" style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} style={{ marginTop: '2px' }} />
                  <span>Student and staff data will not be cloned. Only structure and templates will be copied.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="button button-secondary" onClick={() => setShowCloneModal(false)}>
                  Cancel
                </button>
                <button className="button clone-btn" onClick={confirmClone}>
                  <Copy size={16} />
                  Clone & Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="academic-years-container">
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
            <ArrowLeft size={16} /> Back to Academic Years
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add Academic Year' : `Edit: ${selectedYear?.year_label}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new academic calendar year' : 'Update academic year information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveYear(); }}>
          <div className="form-section">
            <h2>Academic Year Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Year Label <span className="required">*</span></label>
                <input
                  type="text"
                  name="year_label"
                  className={`form-input ${errors.year_label ? 'error' : ''}`}
                  value={formData.year_label}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-2025"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Format: YYYY-YYYY (e.g., 2024-2025)
                </small>
                {errors.year_label && <span className="error-message">{errors.year_label}</span>}
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

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Active: Currently in use | Inactive: Not in use | Archived: Historical record
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
              {view === 'create' ? 'Create Academic Year' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcademicYears;