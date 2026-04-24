// import { useState } from 'react';
// import { Users, Plus, Edit, Eye, Trash2, UserCheck, AlertTriangle, X, BookOpen,CheckCircle, School, TrendingUp } from 'lucide-react';
// import '../../../styles/classes.css';

// function Classes() {
//   const [classes, setClasses] = useState([
//     { id: 1, className: 'JHS 1 Science A', classCode: 'JHS1-SCI-A', level: 'JHS 1', programme: null, academicYear: '2024-2025', formMaster: 'Mr. John Doe', capacity: 40, currentEnrollment: 38, isActive: true },
//     { id: 2, className: 'JHS 1 Science B', classCode: 'JHS1-SCI-B', level: 'JHS 1', programme: null, academicYear: '2024-2025', formMaster: 'Mrs. Jane Smith', capacity: 40, currentEnrollment: 37, isActive: true },
//     { id: 3, className: 'SHS 1 Science A', classCode: 'SHS1-SCI-A', level: 'SHS 1', programme: 'General Science', academicYear: '2024-2025', formMaster: 'Dr. James Wilson', capacity: 45, currentEnrollment: 44, isActive: true },
//     { id: 4, className: 'SHS 1 Arts A', classCode: 'SHS1-ART-A', level: 'SHS 1', programme: 'General Arts', academicYear: '2024-2025', formMaster: 'Ms. Sarah Johnson', capacity: 45, currentEnrollment: 30, isActive: true },
//     { id: 5, className: 'JHS 2 Science A', classCode: 'JHS2-SCI-A', level: 'JHS 2', programme: null, academicYear: '2024-2025', formMaster: 'Mr. Michael Brown', capacity: 40, currentEnrollment: 25, isActive: false }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [showRosterModal, setShowRosterModal] = useState(false);
//   const [showFormMasterModal, setShowFormMasterModal] = useState(false);
//   const [editingClass, setEditingClass] = useState(null);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [formData, setFormData] = useState({
//     className: '',
//     classCode: '',
//     level: '',
//     programme: '',
//     academicYear: '2024-2025',
//     formMaster: '',
//     capacity: '',
//     isActive: true
//   });

//   const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];
//   const programmes = ['General Science', 'General Arts', 'Business', 'Visual Arts', 'Home Economics'];
//   const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson', 'Mr. Michael Brown', 'Mrs. Emily Davis'];
//   const academicYears = ['2022-2023', '2023-2024', '2024-2025'];

//   const students = [
//     { id: 1, name: 'Alice Johnson', admissionNo: '2024-001', gender: 'Female', parentContact: '+1234567890' },
//     { id: 2, name: 'Bob Smith', admissionNo: '2024-002', gender: 'Male', parentContact: '+1234567891' },
//     { id: 3, name: 'Charlie Brown', admissionNo: '2024-003', gender: 'Male', parentContact: '+1234567892' },
//     { id: 4, name: 'Diana Prince', admissionNo: '2024-004', gender: 'Female', parentContact: '+1234567893' },
//   ];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditClass = () => {
//     if (!formData.className || !formData.classCode || !formData.level || !formData.capacity) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingClass) {
//       setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...formData, currentEnrollment: c.currentEnrollment } : c));
//     } else {
//       const newClass = { id: Date.now(), ...formData, currentEnrollment: 0 };
//       setClasses(prev => [...prev, newClass]);
//     }
//     setShowModal(false);
//     setEditingClass(null);
//     setFormData({ className: '', classCode: '', level: '', programme: '', academicYear: '2024-2025', formMaster: '', capacity: '', isActive: true });
//   };

//   const handleDeleteClass = (classItem) => {
//     if (classItem.currentEnrollment > 0) {
//       alert(`Cannot delete ${classItem.className} because it has ${classItem.currentEnrollment} enrolled students.`);
//       return;
//     }
//     if (window.confirm(`Delete ${classItem.className}?`)) {
//       setClasses(prev => prev.filter(c => c.id !== classItem.id));
//     }
//   };

//   const getCapacityPercentage = (current, capacity) => (current / capacity) * 100;
//   const getCapacityStatus = (percentage) => {
//     if (percentage >= 90) return 'danger';
//     if (percentage >= 75) return 'warning';
//     return 'normal';
//   };

//   return (
//     <div className="classes-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Classes</h1>
//         <p style={{ color: 'var(--secondary)' }}>Manage all classes with form masters and capacity tracking</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Class</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div style={{ display: 'grid', gap: '1rem' }}>
//         {classes.map(classItem => {
//           const capacityPercent = getCapacityPercentage(classItem.currentEnrollment, classItem.capacity);
//           const capacityStatus = getCapacityStatus(capacityPercent);
//           return (
//             <div key={classItem.id} className={`class-card ${capacityStatus === 'warning' || capacityStatus === 'danger' ? 'warning' : ''}`}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
//                     <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{classItem.className}</h3>
//                     <span className="status-badge status-active">{classItem.classCode}</span>
//                     {classItem.isActive ? <span className="status-badge status-active"><CheckCircle size={12} /> Active</span> : <span className="status-badge status-inactive">Inactive</span>}
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
//                     <span><School size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.level}</span>
//                     {classItem.programme && <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.programme}</span>}
//                     <span><UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />Form Master: {classItem.formMaster || 'Not Assigned'}</span>
//                     <span><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.currentEnrollment}/{classItem.capacity} Students</span>
//                   </div>
//                   <div className="capacity-bar">
//                     <div className={`capacity-fill ${capacityStatus === 'warning' ? 'warning' : capacityStatus === 'danger' ? 'danger' : ''}`} style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
//                   </div>
//                   {capacityPercent >= 90 && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> Capacity warning: {capacityPercent.toFixed(0)}% full</div>}
//                 </div>
//                 <div className="action-buttons">
//                   <button className="action-btn edit-btn" onClick={() => { setEditingClass(classItem); setFormData(classItem); setShowModal(true); }}><Edit size={16} /></button>
//                   <button className="action-btn set-current-btn" onClick={() => { setSelectedClass(classItem); setShowRosterModal(true); }}><Eye size={16} /> Roster</button>
//                   <button className="action-btn edit-btn" onClick={() => { setSelectedClass(classItem); setShowFormMasterModal(true); }}><UserCheck size={16} /> Assign Master</button>
//                   <button className="action-btn delete-btn" onClick={() => handleDeleteClass(classItem)}><Trash2 size={16} /></button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Class Modal */}
//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingClass(null); }}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingClass(null); }} /></div>
//           <div className="modal-body">
//             <div className="form-group"><label>Class Name <span className="required">*</span></label><input type="text" name="className" className="form-input" value={formData.className} onChange={handleInputChange} /></div>
//             <div className="form-group"><label>Class Code <span className="required">*</span></label><input type="text" name="classCode" className="form-input" value={formData.classCode} onChange={handleInputChange} /></div>
//             <div className="form-group"><label>Level <span className="required">*</span></label><select name="level" className="form-select" value={formData.level} onChange={handleInputChange}><option value="">Select Level</option>{levels.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
//             <div className="form-group"><label>Programme (SHS only)</label><select name="programme" className="form-select" value={formData.programme} onChange={handleInputChange}><option value="">None</option>{programmes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
//             <div className="form-group"><label>Form Master</label><select name="formMaster" className="form-select" value={formData.formMaster} onChange={handleInputChange}><option value="">Select Teacher</option>{teachers.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
//             <div className="form-group"><label>Capacity <span className="required">*</span></label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
//             <div className="form-group"><label>Academic Year</label><select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>{academicYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
//             <div className="form-group"><label><input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} /> Is Active?</label></div>
//           </div>
//           <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingClass(null); }}>Cancel</button><button className="button" onClick={handleAddEditClass}>{editingClass ? 'Save' : 'Add'}</button></div>
//         </div>
//       </div>}

//       {/* Roster Modal */}
//       {showRosterModal && selectedClass && <div className="modal-overlay" onClick={() => setShowRosterModal(false)}>
//         <div className="modal-container roster-modal" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>Student Roster - {selectedClass.className}</h2><X className="modal-close" size={20} onClick={() => setShowRosterModal(false)} /></div>
//           <div className="modal-body"><div className="student-list">{students.map(s => <div key={s.id} className="student-item"><div><strong>{s.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Admission: {s.admissionNo} | {s.gender}</div></div><div style={{ fontSize: '0.75rem' }}>{s.parentContact}</div></div>)}</div></div>
//           <div className="modal-footer"><button className="button" onClick={() => setShowRosterModal(false)}>Close</button></div>
//         </div>
//       </div>}

//       {/* Assign Form Master Modal */}
//       {showFormMasterModal && selectedClass && <div className="modal-overlay" onClick={() => setShowFormMasterModal(false)}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>Assign Form Master - {selectedClass.className}</h2><X className="modal-close" size={20} onClick={() => setShowFormMasterModal(false)} /></div>
//           <div className="modal-body"><div className="form-group"><label>Select Form Master</label><select className="form-select" value={selectedClass.formMaster || ''} onChange={(e) => setClasses(prev => prev.map(c => c.id === selectedClass.id ? { ...c, formMaster: e.target.value } : c))}><option value="">None</option>{teachers.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
//           <div className="modal-footer"><button className="button" onClick={() => setShowFormMasterModal(false)}>Close</button></div>
//         </div>
//       </div>}
//     </div>
//   );
// }

// export default Classes;




// src/components/Classes/Classes.jsx
import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Eye, Trash2, UserCheck,Save, AlertTriangle, X, BookOpen, CheckCircle, School, TrendingUp, ArrowLeft } from 'lucide-react';
import '../../../styles/classes.css';

function Classes() {
  const [classes, setClasses] = useState([
    { id: 1, class_name: 'JHS 1 Science A', class_code: 'JHS1-SCI-A', level_id: 1, programme_id: null, academic_year_id: 1, form_master_id: 1, description: 'JHS 1 Science Class A', capacity: 40, currentEnrollment: 38, is_active: true },
    { id: 2, class_name: 'JHS 1 Science B', class_code: 'JHS1-SCI-B', level_id: 1, programme_id: null, academic_year_id: 1, form_master_id: 2, description: 'JHS 1 Science Class B', capacity: 40, currentEnrollment: 37, is_active: true },
    { id: 3, class_name: 'SHS 1 Science A', class_code: 'SHS1-SCI-A', level_id: 4, programme_id: 1, academic_year_id: 1, form_master_id: 3, description: 'SHS 1 Science Class A', capacity: 45, currentEnrollment: 44, is_active: true },
    { id: 4, class_name: 'SHS 1 Arts A', class_code: 'SHS1-ART-A', level_id: 4, programme_id: 2, academic_year_id: 1, form_master_id: 4, description: 'SHS 1 Arts Class A', capacity: 45, currentEnrollment: 30, is_active: true },
    { id: 5, class_name: 'JHS 2 Science A', class_code: 'JHS2-SCI-A', level_id: 2, programme_id: null, academic_year_id: 1, form_master_id: 5, description: 'JHS 2 Science Class A', capacity: 40, currentEnrollment: 25, is_active: false }
  ]);

  const [levels, setLevels] = useState([
    { id: 1, name: 'JHS 1' },
    { id: 2, name: 'JHS 2' },
    { id: 3, name: 'JHS 3' },
    { id: 4, name: 'SHS 1' },
    { id: 5, name: 'SHS 2' },
    { id: 6, name: 'SHS 3' }
  ]);

  const [programmes, setProgrammes] = useState([
    { id: 1, name: 'General Science' },
    { id: 2, name: 'General Arts' },
    { id: 3, name: 'Business' },
    { id: 4, name: 'Visual Arts' },
    { id: 5, name: 'Home Economics' }
  ]);

  const [academicYears, setAcademicYears] = useState([
    { id: 1, name: '2022-2023' },
    { id: 2, name: '2023-2024' },
    { id: 3, name: '2024-2025' }
  ]);

  const [staff, setStaff] = useState([
    { id: 1, first_name: 'John', surname: 'Doe', full_name: 'Mr. John Doe' },
    { id: 2, first_name: 'Jane', surname: 'Smith', full_name: 'Mrs. Jane Smith' },
    { id: 3, first_name: 'James', surname: 'Wilson', full_name: 'Dr. James Wilson' },
    { id: 4, first_name: 'Sarah', surname: 'Johnson', full_name: 'Ms. Sarah Johnson' },
    { id: 5, first_name: 'Michael', surname: 'Brown', full_name: 'Mr. Michael Brown' },
    { id: 6, first_name: 'Emily', surname: 'Davis', full_name: 'Mrs. Emily Davis' }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedClass, setSelectedClass] = useState(null);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [formData, setFormData] = useState({
    class_name: '',
    class_code: '',
    level_id: '',
    programme_id: '',
    academic_year_id: '3',
    form_master_id: '',
    description: '',
    capacity: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  // Generate class code automatically based on class name and level
  const generateClassCode = (className, levelId) => {
    if (!className || !levelId) return '';
    const level = levels.find(l => l.id === parseInt(levelId));
    if (!level) return '';
    
    const levelAbbr = level.name.replace(/\s/g, '').toUpperCase();
    const words = className.split(' ');
    let classAbbr = '';
    
    if (words.length >= 3) {
      classAbbr = `${words[0].substring(0, 2)}${words[2].substring(0, 1)}`.toUpperCase();
    } else {
      classAbbr = words.map(w => w[0]).join('').toUpperCase();
    }
    
    return `${levelAbbr}-${classAbbr}`;
  };

  // Auto-generate class code when class name or level changes
  useEffect(() => {
    if (formData.class_name && formData.level_id) {
      const generatedCode = generateClassCode(formData.class_name, formData.level_id);
      setFormData(prev => ({ ...prev, class_code: generatedCode }));
    }
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

  const handleSaveClass = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedClass) {
      // Update existing class
      setClasses(prev => prev.map(c => 
        c.id === selectedClass.id 
          ? { 
              ...c, 
              ...formData, 
              currentEnrollment: c.currentEnrollment,
              updated_at: new Date().toISOString()
            } 
          : c
      ));
    } else {
      // Add new class
      const newClass = { 
        id: Date.now(), 
        ...formData, 
        currentEnrollment: 0,
        created_at: new Date().toISOString()
      };
      setClasses(prev => [...prev, newClass]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      class_name: classItem.class_name,
      class_code: classItem.class_code,
      level_id: classItem.level_id,
      programme_id: classItem.programme_id || '',
      academic_year_id: classItem.academic_year_id,
      form_master_id: classItem.form_master_id || '',
      description: classItem.description || '',
      capacity: classItem.capacity,
      is_active: classItem.is_active
    });
    setView('edit');
  };

  const handleDeleteClass = (classItem) => {
    if (classItem.currentEnrollment > 0) {
      alert(`Cannot delete ${classItem.class_name} because it has ${classItem.currentEnrollment} enrolled students.`);
      return;
    }
    if (window.confirm(`Delete ${classItem.class_name}?`)) {
      setClasses(prev => prev.filter(c => c.id !== classItem.id));
    }
  };

  const resetForm = () => {
    setFormData({
      class_name: '',
      class_code: '',
      level_id: '',
      programme_id: '',
      academic_year_id: '3',
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

  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.name : 'N/A';
  };

  const getFormMasterName = (staffId) => {
    if (!staffId) return 'Not Assigned';
    const master = staff.find(s => s.id === staffId);
    return master ? master.full_name : 'Not Assigned';
  };

  // Render Class List View
  if (view === 'list') {
    return (
      <div className="classes-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Classes
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Manage all classes with form masters and capacity tracking</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} /> Add Class
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gap: '1rem' }}>
          {classes.map(classItem => {
            const capacityPercent = getCapacityPercentage(classItem.currentEnrollment, classItem.capacity);
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
                      <span><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />{classItem.currentEnrollment}/{classItem.capacity} Students</span>
                      <span><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />{getAcademicYearName(classItem.academic_year_id)}</span>
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
                    <button className="action-btn edit-btn" onClick={() => handleEditClass(classItem)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn set-current-btn" onClick={() => { setSelectedClass(classItem); setShowRosterModal(true); }}>
                      <Eye size={16} /> Roster
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteClass(classItem)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
                  {/* Student list would go here - fetch from API */}
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                    No students enrolled yet.
                  </div>
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
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
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
                >
                  <option value="">Select Form Master</option>
                  {staff.map(master => (
                    <option key={master.id} value={master.id}>{master.full_name}</option>
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
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Is Active?
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Class' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Classes;