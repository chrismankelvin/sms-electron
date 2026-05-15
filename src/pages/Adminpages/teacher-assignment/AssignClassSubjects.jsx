// src/components/Academics/AssignClassSubjects.jsx

import { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, X, Save, Loader, CheckCircle, AlertCircle,
  RefreshCw, Search, Filter, ChevronDown, ChevronRight, CheckSquare, Square,
  Layers, GraduationCap
} from 'lucide-react';
import '../../../styles/assign-class-subjects.css';

const API_BASE_URL = 'http://localhost:8000/api';

// API Services
const classSubjectService = {
  async getAllAssignments(academicYearId, classId = null) {
    let url = `${API_BASE_URL}/class-subjects/`;
    const params = [];
    if (academicYearId) params.push(`academic_year_id=${academicYearId}`);
    if (classId) params.push(`class_id=${classId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getClassSubjects(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/class/${classId}?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAvailableSubjects(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/available-subjects/${classId}?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async assignSubject(classId, subjectId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_id: classId,
        subject_id: subjectId,
        academic_year_id: academicYearId,
        is_required: true
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async bulkAssignSubjects(classId, academicYearId, subjectIds) {
    const url = new URL(`${API_BASE_URL}/class-subjects/bulk`);
    url.searchParams.append('class_id', classId);
    url.searchParams.append('academic_year_id', academicYearId);
    subjectIds.forEach(id => url.searchParams.append('subject_ids', id));
    
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async removeAssignment(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/${assignmentId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async updateAssignment(assignmentId, isRequired) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_required: isRequired })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSummary(academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/summary/${academicYearId}`);
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

const classService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/classes/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function AssignClassSubjects() {
  const [view, setView] = useState('list'); // 'list', 'matrix', 'assignment'
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && view === 'matrix') {
      loadSummary();
    }
  }, [selectedAcademicYear, view]);

  useEffect(() => {
    if (selectedAcademicYear && selectedClass && view === 'assignment') {
      loadClassSubjects();
      loadAvailableSubjects();
    }
  }, [selectedAcademicYear, selectedClass, view]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [yearsData, classesData] = await Promise.all([
        academicYearService.getAll(),
        classService.getAll()
      ]);
      
      setAcademicYears(yearsData);
      setClasses(classesData);
      
      // Set default selections
      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id.toString());
      } else if (yearsData.length > 0) {
        setSelectedAcademicYear(yearsData[0].id.toString());
      }
      
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id.toString());
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async () => {
    if (!selectedClass || !selectedAcademicYear) return;
    
    try {
      const data = await classSubjectService.getClassSubjects(
        parseInt(selectedClass),
        parseInt(selectedAcademicYear)
      );
      setClassSubjects(data.subjects);
    } catch (error) {
      showAlert('Failed to load class subjects: ' + error.message, 'error');
      setClassSubjects([]);
    }
  };

  const loadAvailableSubjects = async () => {
    if (!selectedClass || !selectedAcademicYear) return;
    
    try {
      const data = await classSubjectService.getAvailableSubjects(
        parseInt(selectedClass),
        parseInt(selectedAcademicYear)
      );
      setAvailableSubjects(data);
    } catch (error) {
      showAlert('Failed to load available subjects: ' + error.message, 'error');
      setAvailableSubjects([]);
    }
  };

  const loadSummary = async () => {
    if (!selectedAcademicYear) return;
    
    try {
      const data = await classSubjectService.getSummary(parseInt(selectedAcademicYear));
      setSummaryData(data);
    } catch (error) {
      showAlert('Failed to load summary: ' + error.message, 'error');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleSubjectSelection = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedSubjects.length === 0) {
      showAlert('Please select at least one subject', 'error');
      return;
    }
    
    try {
      setSaving(true);
      await classSubjectService.bulkAssignSubjects(
        parseInt(selectedClass),
        parseInt(selectedAcademicYear),
        selectedSubjects
      );
      
      showAlert(`Successfully assigned ${selectedSubjects.length} subjects to class`, 'success');
      setSelectedSubjects([]);
      await loadClassSubjects();
      await loadAvailableSubjects();
    } catch (error) {
      showAlert('Failed to assign subjects: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubject = async (subjectId) => {
    try {
      setSaving(true);
      await classSubjectService.assignSubject(
        parseInt(selectedClass),
        subjectId,
        parseInt(selectedAcademicYear)
      );
      
      showAlert('Subject assigned successfully', 'success');
      await loadClassSubjects();
      await loadAvailableSubjects();
    } catch (error) {
      showAlert('Failed to assign subject: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSubject = async (assignmentId, subjectName) => {
    if (window.confirm(`Remove "${subjectName}" from this class?`)) {
      try {
        setSaving(true);
        await classSubjectService.removeAssignment(assignmentId);
        showAlert('Subject removed successfully', 'success');
        await loadClassSubjects();
        await loadAvailableSubjects();
      } catch (error) {
        showAlert('Failed to remove subject: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleToggleRequired = async (assignmentId, currentRequired) => {
    try {
      await classSubjectService.updateAssignment(assignmentId, !currentRequired);
      await loadClassSubjects();
    } catch (error) {
      showAlert('Failed to update: ' + error.message, 'error');
    }
  };

  const clearFilters = () => {
    const currentYear = academicYears.find(y => y.is_current);
    setSelectedAcademicYear(currentYear ? currentYear.id.toString() : (academicYears[0]?.id.toString() || ''));
    if (classes.length > 0) {
      setSelectedClass(classes[0].id.toString());
    }
  };

  // Render Matrix View
  if (view === 'matrix' && summaryData) {
    return (
      <div className="assign-class-subjects-container">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`alert-${alert.type}`}>
            <span><CheckCircle size={18} /> {alert.message}</span>
            <X className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })} />
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div>
            <h1><Layers size={28} /> Class-Subject Matrix</h1>
            <p>View which subjects are assigned to which classes</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setView('list')}>
              List View
            </button>
            <button className="btn-secondary" onClick={loadSummary}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
        <hr className="divider" />

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Academic Year</label>
            <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>{year.year_label}</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => setView('assignment')}>
            Manage Assignments
          </button>
        </div>

        {/* Matrix Table */}
        <div className="matrix-container">
          <div className="matrix-header">
            <div className="matrix-corner">Classes / Subjects</div>
            <div className="matrix-subjects">
              {summaryData.subjects.map(subject => (
                <div key={subject.id} className="matrix-subject-cell" title={subject.name}>
                  {subject.name.substring(0, 15)}{subject.name.length > 15 ? '...' : ''}
                </div>
              ))}
            </div>
          </div>
          <div className="matrix-body">
            {summaryData.matrix.map(row => (
              <div key={row.class_id} className="matrix-row">
                <div className="matrix-class-cell">{row.class_name}</div>
                <div className="matrix-subjects-list">
                  {row.subjects.map(subject => (
                    <div key={subject.subject_id} className="matrix-subject-cell">
                      {subject.assigned ? (
                        <CheckSquare size={18} className="assigned" />
                      ) : (
                        <Square size={18} className="unassigned" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Assignment View
  if (view === 'assignment') {
    return (
      <div className="assign-class-subjects-container">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`alert-${alert.type}`}>
            <span><CheckCircle size={18} /> {alert.message}</span>
            <X className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })} />
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div>
            <h1><BookOpen size={28} /> Assign Subjects to Classes</h1>
            <p>Select which subjects each class offers</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setView('matrix')}>
              Matrix View
            </button>
          </div>
        </div>
        <hr className="divider" />

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Academic Year</label>
            <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>{year.year_label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {/* Available Subjects Section */}
        <div className="subjects-section">
          <div className="section-header">
            <h3>Available Subjects to Assign</h3>
            {availableSubjects.length > 0 && (
              <div className="bulk-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleBulkAssign}
                  disabled={saving || selectedSubjects.length === 0}
                >
                  {saving ? <Loader size={16} className="spinner" /> : <Plus size={16} />}
                  Assign Selected ({selectedSubjects.length})
                </button>
              </div>
            )}
          </div>
          
          {availableSubjects.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>All subjects are already assigned to this class</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {availableSubjects.map(subject => (
                <div 
                  key={subject.id} 
                  className={`subject-card ${selectedSubjects.includes(subject.id) ? 'selected' : ''}`}
                  onClick={() => handleToggleSubjectSelection(subject.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => {}} 
                  />
                  <div className="subject-info">
                    <strong>{subject.name}</strong>
                    <span className="subject-code">{subject.code}</span>
                    <span className="subject-type">{subject.type}</span>
                  </div>
                  <button 
                    className="assign-btn"
                    onClick={(e) => { e.stopPropagation(); handleAssignSubject(subject.id); }}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Subjects Section */}
        <div className="subjects-section">
          <div className="section-header">
            <h3>Subjects Assigned to {classes.find(c => c.id.toString() === selectedClass)?.class_name}</h3>
          </div>
          
          {classSubjects.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>No subjects assigned yet. Add subjects from above.</p>
            </div>
          ) : (
            <div className="assigned-subjects-table">
              <table>
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classSubjects.map(subject => (
                    <tr key={subject.id}>
                      <td><strong>{subject.subject_name}</strong></td>
                      <td>{subject.subject_code}</td>
                      <td><span className={`type-badge ${subject.subject_type}`}>{subject.subject_type}</span></td>
                      <td>
                        <button 
                          className={`required-btn ${subject.is_required ? 'active' : ''}`}
                          onClick={() => handleToggleRequired(subject.id, subject.is_required)}
                        >
                          {subject.is_required ? 'Required' : 'Optional'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleRemoveSubject(subject.id, subject.subject_name)}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render List View
  return (
    <div className="assign-class-subjects-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span><CheckCircle size={18} /> {alert.message}</span>
          <X className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })} />
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1><GraduationCap size={28} /> Class Subject Assignments</h1>
          <p>Manage subjects taught in each class</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setView('assignment')}>
            <Plus size={16} /> Manage Assignments
          </button>
          <button className="btn-secondary" onClick={() => setView('matrix')}>
            <Layers size={16} /> Matrix View
          </button>
          <button className="btn-secondary" onClick={loadInitialData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>
      <hr className="divider" />

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Academic Year</label>
          <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year_label}</option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading assignments...</p>
        </div>
      ) : (
        <div className="classes-list">
          {classes.map(classItem => (
            <ClassSubjectsCard
              key={classItem.id}
              classItem={classItem}
              academicYearId={selectedAcademicYear}
              onRefresh={loadInitialData}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component for list view
function ClassSubjectsCard({ classItem, academicYearId, onRefresh }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && academicYearId) {
      loadSubjects();
    }
  }, [expanded, academicYearId]);

  const loadSubjects = async () => {
    try {
      const data = await classSubjectService.getClassSubjects(classItem.id, parseInt(academicYearId));
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="class-card">
      <div className="class-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="class-info">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <strong>{classItem.class_name}</strong>
          <span className="subject-count">({subjects.length} subjects)</span>
        </div>
      </div>
      
      {expanded && (
        <div className="class-card-body">
          {loading ? (
            <Loader size={24} className="spinner" />
          ) : subjects.length === 0 ? (
            <div className="no-subjects">No subjects assigned</div>
          ) : (
            <div className="subjects-list">
              {subjects.map(subject => (
                <div key={subject.id} className="subject-tag">
                  <span>{subject.subject_name}</span>
                  {subject.is_required && <span className="required-tag">Required</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignClassSubjects;