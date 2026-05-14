// src/components/Academics/Programmes.jsx

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  GraduationCap, 
  Bookmark, 
  ArrowLeft, 
  Save,
  Loader,
  Check,
  AlertCircle
} from 'lucide-react';
import '../../../styles/programmes.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const programmeService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/programmes/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(programmeData) {
    const response = await fetch(`${API_BASE_URL}/programmes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programmeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, programmeData) {
    const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programmeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

function Programmes() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'SHS',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadProgrammes();
  }, []);

  const loadProgrammes = async () => {
    try {
      setLoading(true);
      const data = await programmeService.getAll();
      setProgrammes(data);
    } catch (error) {
      showAlert('Failed to load programmes: ' + error.message, 'error');
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
    if (!formData.name.trim()) newErrors.name = 'Programme name is required';
    if (!formData.code.trim()) newErrors.code = 'Programme code is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Validate code format (should be uppercase letters)
    if (formData.code && !/^[A-Za-z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code should contain only letters and numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProgramme = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const programmeData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        description: formData.description || ''
      };

      if (view === 'edit' && selectedProgramme) {
        await programmeService.update(selectedProgramme.id, programmeData);
        showAlert('Programme updated successfully!', 'success');
      } else {
        await programmeService.create(programmeData);
        showAlert('Programme created successfully!', 'success');
      }
      
      await loadProgrammes();
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProgramme = (programme) => {
    setSelectedProgramme(programme);
    setFormData({
      name: programme.name,
      code: programme.code || '',
      category: programme.category || 'SHS',
      description: programme.description || ''
    });
    setView('edit');
  };

  const handleDeleteProgramme = async (programme) => {
    if (window.confirm(`Are you sure you want to delete ${programme.name}?`)) {
      try {
        setSaving(true);
        await programmeService.delete(programme.id);
        showAlert(`${programme.name} has been deleted`, 'success');
        await loadProgrammes();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'SHS',
      description: ''
    });
    setErrors({});
    setSelectedProgramme(null);
  };

  const viewSubjects = (programme) => {
    setSelectedProgramme(programme);
    setShowSubjectsModal(true);
  };

  if (loading) {
    return (
      <div className="programmes-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading academic programmes...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="programmes-container">
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <GraduationCap size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Programmes
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define SHS programmes (Science, Arts, Business, etc.) and JHS curriculum</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} /> Add Programme
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {programmes.length > 0 ? (
            programmes.map(prog => (
              <div key={prog.id} className="programme-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{prog.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {prog.code && (
                        <span className="status-badge status-active" style={{ fontSize: '0.7rem' }}>{prog.code}</span>
                      )}
                      <span className={`status-badge ${prog.category === 'JHS' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.7rem' }}>
                        {prog.category}
                      </span>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEditProgramme(prog)}
                      disabled={saving}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteProgramme(prog)}
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {prog.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.75rem' }}>{prog.description}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    {/* Note: Subjects count would come from a subjects API endpoint */}
                    0 Core Subjects
                  </span>
                  <button 
                    className="button" 
                    style={{ 
                      padding: '0.25rem 0.75rem', 
                      fontSize: '0.75rem', 
                      backgroundColor: 'transparent', 
                      border: '1px solid var(--primary)', 
                      color: 'var(--primary)' 
                    }} 
                    onClick={() => viewSubjects(prog)}
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <GraduationCap size={48} />
              <p>No programmes defined yet</p>
              <button 
                className="button" 
                onClick={() => { resetForm(); setView('create'); }}
                disabled={saving}
              >
                <Plus size={16} />
                Add Your First Programme
              </button>
            </div>
          )}
        </div>

        {/* Programme Details Modal */}
        {showSubjectsModal && selectedProgramme && (
          <div className="modal-overlay" onClick={() => setShowSubjectsModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Programme Details - {selectedProgramme.name}</h2>
                <X className="modal-close" size={20} onClick={() => setShowSubjectsModal(false)} />
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Code:</strong> {selectedProgramme.code || 'N/A'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Category:</strong> {selectedProgramme.category}
                </div>
                {selectedProgramme.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '0.5rem', color: 'var(--secondary)' }}>{selectedProgramme.description}</p>
                  </div>
                )}
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                  <strong>Note:</strong> Subjects are managed in the Subjects section. This programme can be assigned to students in the student enrollment section.
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowSubjectsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="programmes-container">
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
            <ArrowLeft size={16} /> Back to Programmes
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Programme' : `Edit: ${selectedProgramme?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new academic programme' : 'Update programme information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProgramme(); }}>
          <div className="form-section">
            <h2>Programme Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Programme Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., General Science, General Arts, Business"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Must be unique across all programmes
                </small>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Programme Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  className={`form-input ${errors.code ? 'error' : ''}`}
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SCI, ART, BUS"
                  style={{ textTransform: 'uppercase' }}
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Short unique code (will be stored in uppercase)
                </small>
                {errors.code && <span className="error-message">{errors.code}</span>}
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
                  <option value="SHS">SHS (Senior High School)</option>
                  <option value="JHS">JHS (Junior High School)</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Determines which educational level this programme belongs to
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
                  placeholder="Optional description of this academic programme"
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Programme' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Programmes;