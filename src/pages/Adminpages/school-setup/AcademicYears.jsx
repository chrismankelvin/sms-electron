// src/components/Academics/AcademicYears.jsx

import { useState, useEffect } from 'react';
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
  Save,
  Loader
} from 'lucide-react';
import '../../../styles/academic-years.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api/academic-years';

const academicYearService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getCurrent() {
    const response = await fetch(`${API_BASE_URL}/current`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(yearData) {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yearData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, yearData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yearData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async setCurrent(id) {
    const response = await fetch(`${API_BASE_URL}/${id}/set-current`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async clone(cloneData) {
    const response = await fetch(`${API_BASE_URL}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloneData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedYear, setSelectedYear] = useState(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [formData, setFormData] = useState({
    year_label: '',
    start_date: '',
    end_date: '',
    status: 'active',
    is_current: false
  });
  const [cloneOptions, setCloneOptions] = useState({
    classes: true,
    subjects: true,
    assignments: true,
    fees: false,
    exams: false
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      const data = await academicYearService.getAll();
      setAcademicYears(data);
    } catch (error) {
      showAlert('Failed to load academic years: ' + error.message, 'error');
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
    if (!formData.year_label.trim()) {
      newErrors.year_label = 'Year label is required';
    } else if (!/^\d{4}-\d{4}$/.test(formData.year_label)) {
      newErrors.year_label = 'Year label must be in format YYYY-YYYY';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    // Validate that end date is after start date
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveYear = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (view === 'edit' && selectedYear) {
        // Update existing year
        await academicYearService.update(selectedYear.id, formData);
        showAlert('Academic year updated successfully!', 'success');
      } else {
        // Create new year
        await academicYearService.create(formData);
        showAlert('Academic year created successfully!', 'success');
      }
      
      await loadAcademicYears(); // Refresh the list
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditYear = (year) => {
    setSelectedYear(year);
    setFormData({
      year_label: year.year_label,
      start_date: year.start_date,
      end_date: year.end_date,
      status: year.status,
      is_current: year.is_current
    });
    setView('edit');
  };

  const handleSetAsCurrent = async (year) => {
    if (year.status === 'archived') {
      showAlert('Cannot set an archived year as current. Please activate it first.', 'error');
      return;
    }
    
    try {
      setSaving(true);
      await academicYearService.setCurrent(year.id);
      showAlert(`${year.year_label} is now the current academic year`, 'success');
      await loadAcademicYears(); // Refresh the list
    } catch (error) {
      showAlert('Failed to set as current: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveYear = async (year) => {
    if (year.is_current) {
      showAlert('Cannot archive the current academic year. Please set another year as current first.', 'error');
      return;
    }
    
    try {
      setSaving(true);
      await academicYearService.update(year.id, { status: 'archived' });
      showAlert(`${year.year_label} has been archived`, 'success');
      await loadAcademicYears(); // Refresh the list
    } catch (error) {
      showAlert('Failed to archive: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateYear = async (year) => {
    if (year.is_current) {
      showAlert('This year is already current. To activate another year, set it as current.', 'error');
      return;
    }
    
    try {
      setSaving(true);
      await academicYearService.update(year.id, { status: 'active' });
      showAlert(`${year.year_label} has been activated`, 'success');
      await loadAcademicYears(); // Refresh the list
    } catch (error) {
      showAlert('Failed to activate: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (year) => {
    if (year.is_current) {
      showAlert('Cannot delete the current academic year. Please set another year as current first.', 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${year.year_label}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await academicYearService.delete(year.id);
        showAlert(`${year.year_label} has been deleted`, 'success');
        await loadAcademicYears(); // Refresh the list
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCloneFromPrevious = () => {
    const currentYear = academicYears.find(y => y.is_current);
    if (!currentYear) {
      showAlert('No active academic year found to clone from.', 'error');
      return;
    }

    const years = currentYear.year_label.split('-');
    const newYearLabel = `${parseInt(years[0]) + 1}-${parseInt(years[1]) + 1}`;
    
    setFormData({
      year_label: newYearLabel,
      start_date: '',
      end_date: '',
      status: 'active',
      is_current: false
    });
    
    setShowCloneModal(true);
  };

  const confirmClone = async () => {
    if (!formData.year_label || !formData.start_date || !formData.end_date) {
      showAlert('Please fill in year details', 'error');
      return;
    }

    const currentYear = academicYears.find(y => y.is_current);
    if (!currentYear) {
      showAlert('No source year found to clone from', 'error');
      return;
    }

    try {
      setSaving(true);
      const result = await academicYearService.clone({
        new_year_label: formData.year_label,
        start_date: formData.start_date,
        end_date: formData.end_date,
        source_year_id: currentYear.id,
        options: cloneOptions
      });
      
      showAlert(`Academic year created successfully with cloned data!`, 'success');
      await loadAcademicYears(); // Refresh the list
      setShowCloneModal(false);
      
    } catch (error) {
      showAlert('Failed to clone: ' + error.message, 'error');
    } finally {
      setSaving(false);
      resetForm();
      setCloneOptions({
        classes: true,
        subjects: true,
        assignments: true,
        fees: false,
        exams: false
      });
    }
  };

  const resetForm = () => {
    setFormData({
      year_label: '',
      start_date: '',
      end_date: '',
      status: 'active',
      is_current: false
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

  if (loading) {
    return (
      <div className="academic-years-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading academic years...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="academic-years-container">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`alert-${alert.type}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {alert.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {alert.message}
            </span>
            <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
              <X size={18} />
            </span>
          </div>
        )}

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
            <button 
              className="button clone-btn" 
              onClick={handleCloneFromPrevious}
              disabled={saving}
            >
              <Copy size={16} />
              Clone from Previous Year
            </button>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
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
                          disabled={saving}
                        >
                          <Edit size={16} />
                        </button>
                        {year.status !== 'archived' && !year.is_current && (
                          <button
                            className="action-btn archive-btn"
                            onClick={() => handleArchiveYear(year)}
                            title="Archive"
                            disabled={saving}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        {year.status === 'archived' && !year.is_current && (
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleActivateYear(year)}
                            title="Activate"
                            disabled={saving}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {!year.is_current && year.status !== 'archived' && (
                          <button
                            className="action-btn set-current-btn"
                            onClick={() => handleSetAsCurrent(year)}
                            title="Set as Current"
                            disabled={saving}
                          >
                            <Star size={16} />
                          </button>
                        )}
                        {!year.is_current && year.status === 'archived' && (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteYear(year)}
                            title="Delete"
                            disabled={saving}
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
                      <button 
                        className="button" 
                        onClick={() => { resetForm(); setView('create'); }}
                        disabled={saving}
                      >
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
                <button 
                  className="button button-secondary" 
                  onClick={() => setShowCloneModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="button clone-btn" 
                  onClick={confirmClone}
                  disabled={saving}
                >
                  {saving ? <Loader size={16} className="spinner" /> : <Copy size={16} />}
                  {saving ? 'Cloning...' : 'Clone & Create'}
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
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Academic Year' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcademicYears;