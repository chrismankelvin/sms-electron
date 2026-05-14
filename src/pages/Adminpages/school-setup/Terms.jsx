// src/components/Academics/Terms.jsx

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  X, 
  ArrowLeft, 
  Save,
  Loader,
  Trash2,
  Check
} from 'lucide-react';
import '../../../styles/terms.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const termService = {
  async getAll(academicYearId = null) {
    const url = academicYearId 
      ? `${API_BASE_URL}/terms/?academic_year_id=${academicYearId}`
      : `${API_BASE_URL}/terms/`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(termData) {
    const response = await fetch(`${API_BASE_URL}/terms/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(termData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, termData) {
    const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(termData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async activate(id) {
    const response = await fetch(`${API_BASE_URL}/terms/${id}/activate`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async deactivate(id) {
    const response = await fetch(`${API_BASE_URL}/terms/${id}/deactivate`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async publishResults(id) {
    const response = await fetch(`${API_BASE_URL}/terms/${id}/publish-results`, {
      method: 'POST'
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

function Terms() {
  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [warning, setWarning] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    term_number: '',
    academic_year_id: '',
    start_date: '',
    end_date: ''
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load terms when selected year changes
  useEffect(() => {
    if (selectedYearId) {
      loadTerms();
    }
  }, [selectedYearId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load academic years
      const years = await academicYearService.getAll();
      setAcademicYears(years);
      
      // Set default selected year to current year or first year
      const currentYear = years.find(y => y.is_current);
      if (currentYear) {
        setSelectedYearId(currentYear.id.toString());
      } else if (years.length > 0) {
        setSelectedYearId(years[0].id.toString());
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      setLoading(true);
      const data = await termService.getAll(parseInt(selectedYearId));
      setTerms(data);
    } catch (error) {
      showAlert('Failed to load terms: ' + error.message, 'error');
      setTerms([]);
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
    if (!formData.name.trim()) newErrors.name = 'Term name is required';
    if (!formData.term_number) newErrors.term_number = 'Term number is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Validate term number range
    const termNum = parseInt(formData.term_number);
    if (termNum && (termNum < 1 || termNum > 6)) {
      newErrors.term_number = 'Term number must be between 1 and 6';
    }
    
    // Validate that end date is after start date
    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTerm = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const termData = {
        name: formData.name,
        term_number: parseInt(formData.term_number),
        academic_year_id: parseInt(formData.academic_year_id),
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      if (view === 'edit' && selectedTerm) {
        await termService.update(selectedTerm.id, termData);
        showAlert('Term updated successfully!', 'success');
      } else {
        await termService.create(termData);
        showAlert('Term created successfully!', 'success');
      }
      
      await loadTerms(); // Refresh the list
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTerm = (term) => {
    setSelectedTerm(term);
    setFormData({
      name: term.name,
      term_number: term.term_number.toString(),
      academic_year_id: term.academic_year_id.toString(),
      start_date: term.start_date,
      end_date: term.end_date
    });
    setView('edit');
  };

  const handleActivateTerm = async (term) => {
    try {
      setSaving(true);
      await termService.activate(term.id);
      showAlert(`${term.name} has been activated`, 'success');
      await loadTerms(); // Refresh the list
    } catch (error) {
      showAlert('Failed to activate: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateTerm = async (term) => {
    try {
      setSaving(true);
      await termService.deactivate(term.id);
      showAlert(`${term.name} has been deactivated`, 'success');
      await loadTerms(); // Refresh the list
    } catch (error) {
      showAlert('Failed to deactivate: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTerm = async (term) => {
    if (window.confirm(`Are you sure you want to delete ${term.name}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await termService.delete(term.id);
        showAlert(`${term.name} has been deleted`, 'success');
        await loadTerms(); // Refresh the list
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePublishResults = async (term) => {
    try {
      setSaving(true);
      await termService.publishResults(term.id);
      showAlert(`Results for ${term.name} have been published`, 'success');
      await loadTerms(); // Refresh the list
    } catch (error) {
      showAlert('Failed to publish results: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      term_number: '',
      academic_year_id: selectedYearId || '',
      start_date: '',
      end_date: ''
    });
    setErrors({});
    setSelectedTerm(null);
    setWarning('');
  };

  const getAcademicYearLabel = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.year_label : 'Unknown';
  };

  const filteredTerms = terms.filter(t => t.academic_year_id === parseInt(selectedYearId));

  if (loading && academicYears.length === 0) {
    return (
      <div className="terms-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading academic terms...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="terms-container">
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

        <div className="terms-header">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Terms
            </h1>
            <p style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>Define terms within each academic year with date ranges</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} />
            Add Term
          </button>
        </div>

        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

        <div className="filter-bar">
          <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by Academic Year:</label>
          <select 
            className="filter-select" 
            value={selectedYearId} 
            onChange={(e) => setSelectedYearId(e.target.value)}
            disabled={saving}
          >
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_label} {year.is_current ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {warning && (
          <div className="warning-banner">
            <AlertCircle size={18} color="#f59e0b" />
            <span>{warning}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <Loader size={32} className="spinner" />
            <p>Loading terms...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {filteredTerms.length > 0 ? (
              filteredTerms.sort((a, b) => a.term_number - b.term_number).map(term => (
                <div key={term.id} className={`term-card ${term.is_active ? 'active' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{term.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Term {term.term_number}</span>
                        {term.is_active && <span className="status-badge status-active"><CheckCircle size={12} /> Active</span>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)' }}>
                        <span>📅 {new Date(term.start_date).toLocaleDateString()} → {new Date(term.end_date).toLocaleDateString()}</span>
                        <span>📊 Results: {term.results_published ? 'Published ✓' : 'Pending ⏳'}</span>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditTerm(term)}
                        title="Edit"
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      {!term.results_published && (
                        <button 
                          className="action-btn success-btn" 
                          onClick={() => handlePublishResults(term)}
                          title="Publish Results"
                          disabled={saving}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {term.is_active ? (
                        <button 
                          className="action-btn deactivate-btn" 
                          onClick={() => handleDeactivateTerm(term)}
                          title="Deactivate"
                          disabled={saving}
                        >
                          <X size={16} />
                        </button>
                      ) : (
                        <button 
                          className="action-btn set-current-btn" 
                          onClick={() => handleActivateTerm(term)}
                          title="Activate"
                          disabled={saving}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {!term.is_active && (
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDeleteTerm(term)}
                          title="Delete"
                          disabled={saving}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No terms defined for this academic year</p>
                <button 
                  className="button" 
                  onClick={() => { resetForm(); setView('create'); }}
                  disabled={saving}
                >
                  <Plus size={16} />
                  Add First Term
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="terms-container">
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
            <ArrowLeft size={16} /> Back to Terms
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Term' : `Edit: ${selectedTerm?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new academic term' : 'Update term information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTerm(); }}>
          <div className="form-section">
            <h2>Term Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Term Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., First Term, Second Term, etc."
                  disabled={saving}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Term Number <span className="required">*</span></label>
                <input
                  type="number"
                  name="term_number"
                  className={`form-input ${errors.term_number ? 'error' : ''}`}
                  value={formData.term_number}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3, etc."
                  min="1"
                  max="6"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Unique number for this term within the academic year (1-6)
                </small>
                {errors.term_number && <span className="error-message">{errors.term_number}</span>}
              </div>

              <div className="form-group">
                <label>Academic Year <span className="required">*</span></label>
                <select
                  name="academic_year_id"
                  className={`form-select ${errors.academic_year_id ? 'error' : ''}`}
                  value={formData.academic_year_id}
                  onChange={handleInputChange}
                  disabled={saving || view === 'edit'}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year_label} {year.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                {errors.academic_year_id && <span className="error-message">{errors.academic_year_id}</span>}
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Term' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Terms;