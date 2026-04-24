// src/components/Academics/AssignSubjects.jsx
import { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, UserCheck, AlertCircle, X, ArrowLeft, Save, Filter } from 'lucide-react';
import '../../../styles/assign-subjects.css';

function AssignSubjects() {
  const [assignments, setAssignments] = useState([
    { id: 1, staff_id: 1, staff_name: 'Mr. John Doe', class_id: 1, class_name: 'JHS 1 Science', subject_id: 1, subject_name: 'Mathematics', academic_year_id: 3, academic_year_label: '2024-2025', is_active: true },
    { id: 2, staff_id: 2, staff_name: 'Mrs. Jane Smith', class_id: 1, class_name: 'JHS 1 Science', subject_id: 2, subject_name: 'English', academic_year_id: 3, academic_year_label: '2024-2025', is_active: true },
    { id: 3, staff_id: 3, staff_name: 'Dr. James Wilson', class_id: 1, class_name: 'JHS 1 Science', subject_id: 3, subject_name: 'Science', academic_year_id: 3, academic_year_label: '2024-2025', is_active: true }
  ]);

  const [staff, setStaff] = useState([
    { id: 1, first_name: 'John', surname: 'Doe', full_name: 'Mr. John Doe' },
    { id: 2, first_name: 'Jane', surname: 'Smith', full_name: 'Mrs. Jane Smith' },
    { id: 3, first_name: 'James', surname: 'Wilson', full_name: 'Dr. James Wilson' },
    { id: 4, first_name: 'Sarah', surname: 'Johnson', full_name: 'Ms. Sarah Johnson' }
  ]);

  const [classes, setClasses] = useState([
    { id: 1, class_name: 'JHS 1 Science', class_code: 'JHS1-SCI-A' },
    { id: 2, class_name: 'JHS 2 Science', class_code: 'JHS2-SCI-A' },
    { id: 3, class_name: 'SHS 1 Science', class_code: 'SHS1-SCI-A' }
  ]);

  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', code: 'MATH101', type: 'core' },
    { id: 2, name: 'English', code: 'ENG101', type: 'core' },
    { id: 3, name: 'Science', code: 'SCI101', type: 'core' },
    { id: 4, name: 'Social Studies', code: 'SST101', type: 'core' },
    { id: 5, name: 'Biology', code: 'BIO201', type: 'elective' }
  ]);

  const [academicYears, setAcademicYears] = useState([
    { id: 1, year_label: '2022-2023' },
    { id: 2, year_label: '2023-2024' },
    { id: 3, year_label: '2024-2025' }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [filters, setFilters] = useState({ 
    academic_year_id: '3', 
    class_id: '', 
    subject_id: '' 
  });
  const [formData, setFormData] = useState({
    staff_id: '',
    class_id: '',
    subject_id: '',
    academic_year_id: '3',
    is_active: true
  });
  const [errors, setErrors] = useState({});

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

  const checkForConflicts = () => {
    // Check if teacher is already assigned to another class for the same subject/academic year
    const existingAssignment = assignments.find(a => 
      a.staff_id === parseInt(formData.staff_id) && 
      a.academic_year_id === parseInt(formData.academic_year_id) &&
      (!selectedAssignment || a.id !== selectedAssignment.id)
    );
    
    if (existingAssignment) {
      setConflictInfo({
        teacher: staff.find(s => s.id === parseInt(formData.staff_id))?.full_name,
        class: classes.find(c => c.id === existingAssignment.class_id)?.class_name,
        subject: subjects.find(s => s.id === existingAssignment.subject_id)?.name
      });
      setShowConflictWarning(true);
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.staff_id) newErrors.staff_id = 'Teacher is required';
    if (!formData.class_id) newErrors.class_id = 'Class is required';
    if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Academic year is required';
    
    // Check for duplicate UNIQUE constraint
    const existingAssignment = assignments.find(a => 
      a.staff_id === parseInt(formData.staff_id) && 
      a.class_id === parseInt(formData.class_id) && 
      a.subject_id === parseInt(formData.subject_id) && 
      a.academic_year_id === parseInt(formData.academic_year_id) &&
      (!selectedAssignment || a.id !== selectedAssignment.id)
    );
    
    if (existingAssignment) {
      newErrors.duplicate = 'This teacher is already assigned to teach this subject in this class for the selected academic year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAssignment = () => {
    if (!validateForm()) return;
    
    if (!checkForConflicts()) return;

    if (view === 'edit' && selectedAssignment) {
      // Update existing assignment
      setAssignments(prev => prev.map(a => 
        a.id === selectedAssignment.id 
          ? { 
              ...a, 
              staff_id: parseInt(formData.staff_id),
              staff_name: getStaffName(parseInt(formData.staff_id)),
              class_id: parseInt(formData.class_id),
              class_name: getClassName(parseInt(formData.class_id)),
              subject_id: parseInt(formData.subject_id),
              subject_name: getSubjectName(parseInt(formData.subject_id)),
              academic_year_id: parseInt(formData.academic_year_id),
              academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
              is_active: formData.is_active,
              updated_at: new Date().toISOString()
            }
          : a
      ));
    } else {
      // Add new assignment
      const newAssignment = {
        id: Date.now(),
        staff_id: parseInt(formData.staff_id),
        staff_name: getStaffName(parseInt(formData.staff_id)),
        class_id: parseInt(formData.class_id),
        class_name: getClassName(parseInt(formData.class_id)),
        subject_id: parseInt(formData.subject_id),
        subject_name: getSubjectName(parseInt(formData.subject_id)),
        academic_year_id: parseInt(formData.academic_year_id),
        academic_year_label: getAcademicYearLabel(parseInt(formData.academic_year_id)),
        is_active: formData.is_active,
        created_at: new Date().toISOString()
      };
      setAssignments(prev => [...prev, newAssignment]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      staff_id: assignment.staff_id.toString(),
      class_id: assignment.class_id.toString(),
      subject_id: assignment.subject_id.toString(),
      academic_year_id: assignment.academic_year_id.toString(),
      is_active: assignment.is_active
    });
    setView('edit');
  };

  const handleDeleteAssignment = (assignment) => {
    if (window.confirm(`Remove "${assignment.subject_name}" assignment from ${assignment.class_name}?`)) {
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
    }
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      class_id: '',
      subject_id: '',
      academic_year_id: '3',
      is_active: true
    });
    setErrors({});
    setSelectedAssignment(null);
    setShowConflictWarning(false);
    setConflictInfo(null);
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.full_name : 'Unknown';
  };

  const getClassName = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.class_name : 'Unknown';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getAcademicYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'Unknown';
  };

  const filteredAssignments = assignments.filter(a => {
    if (filters.academic_year_id && a.academic_year_id !== parseInt(filters.academic_year_id)) return false;
    if (filters.class_id && a.class_id !== parseInt(filters.class_id)) return false;
    if (filters.subject_id && a.subject_id !== parseInt(filters.subject_id)) return false;
    return true;
  });

  // Render List View
  if (view === 'list') {
    return (
      <div className="assign-subjects-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Assign Subjects
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Assign teachers to teach specific subjects in specific classes</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} /> Add Assignment
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            value={filters.academic_year_id} 
            onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
            style={{ width: 'auto' }}
          >
            <option value="">All Academic Years</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.year_label}</option>
            ))}
          </select>
          <select 
            className="form-select" 
            value={filters.class_id} 
            onChange={(e) => setFilters(prev => ({ ...prev, class_id: e.target.value }))}
            style={{ width: 'auto' }}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.class_name}</option>
            ))}
          </select>
          <select 
            className="form-select" 
            value={filters.subject_id} 
            onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
            style={{ width: 'auto' }}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {(filters.class_id || filters.subject_id || filters.academic_year_id) && (
            <button 
              className="button button-secondary" 
              onClick={() => setFilters({ academic_year_id: '3', class_id: '', subject_id: '' })}
              style={{ padding: '0.5rem 1rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="academic-years-table">
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
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.class_name}</td>
                    <td><strong>{a.subject_name}</strong></td>
                    <td>{a.staff_name}</td>
                    <td>{a.academic_year_label}</td>
                    <td>
                      <span className={`status-badge ${a.is_active ? 'status-active' : 'status-inactive'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => handleEditAssignment(a)}>
                        <Edit size={16} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteAssignment(a)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No assignments found. Click "Add Assignment" to create one.
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
            <ArrowLeft size={16} /> Back to Assignments
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add Assignment' : `Edit: ${selectedAssignment?.subject_name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Assign a teacher to teach a subject in a class' : 'Update assignment information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                >
                  <option value="">Select Teacher</option>
                  {staff.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
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
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name}</option>
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
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                {errors.subject_id && <span className="error-message">{errors.subject_id}</span>}
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
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.year_label}</option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
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
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Inactive assignments won't appear in timetables
                </small>
              </div>
            </div>

            {errors.duplicate && (
              <div className="alert-error" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.375rem', fontSize: '0.875rem', color: '#ef4444' }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {errors.duplicate}
              </div>
            )}

            <div className="alert-info" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Note: Each teacher can only be assigned to teach a specific subject in a specific class once per academic year.
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Assignment' : 'Save Changes'}
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
              <div className="alert-warning" style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.375rem' }}>
                <AlertCircle size={20} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
                <p><strong>{conflictInfo.teacher}</strong> is already assigned to teach <strong>{conflictInfo.subject}</strong> in <strong>{conflictInfo.class}</strong> for this academic year.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>This may cause timetable conflicts. Do you want to continue anyway?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowConflictWarning(false)}>
                Cancel
              </button>
              <button className="button" onClick={() => {
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