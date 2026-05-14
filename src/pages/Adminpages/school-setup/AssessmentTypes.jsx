// src/components/Academics/AssessmentTypes.jsx

import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Scale, 
  BookOpen,
  Loader,
  Save,
  ArrowLeft
} from 'lucide-react';
import '../../../styles/assessment-types.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api/assessments';

const assessmentService = {
  async getTypes() {
    const response = await fetch(`${API_BASE_URL}/types`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createType(typeData) {
    const response = await fetch(`${API_BASE_URL}/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateType(id, typeData) {
    const response = await fetch(`${API_BASE_URL}/types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteType(id) {
    const response = await fetch(`${API_BASE_URL}/types/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async getWeightSummary() {
    const response = await fetch(`${API_BASE_URL}/types/weight-summary`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function AssessmentTypes() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({ 
    name: '', 
    default_weight: '', 
    max_score: 100, 
    applicable_levels: 'BOTH' 
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadAssessmentTypes();
  }, []);

  const loadAssessmentTypes = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getTypes();
      setAssessments(data);
    } catch (error) {
      showAlert('Failed to load assessment types: ' + error.message, 'error');
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

  const totalWeight = assessments.reduce((sum, a) => sum + (a.default_weight || 0), 0);
  const showWarning = totalWeight !== 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Assessment name is required';
    if (!formData.default_weight) newErrors.default_weight = 'Default weight is required';
    if (!formData.max_score) newErrors.max_score = 'Max score is required';
    
    const weight = parseFloat(formData.default_weight);
    if (weight && (weight < 0 || weight > 100)) {
      newErrors.default_weight = 'Weight must be between 0 and 100';
    }
    
    const maxScore = parseFloat(formData.max_score);
    if (maxScore && maxScore <= 0) {
      newErrors.max_score = 'Max score must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEditAssessment = async () => {
    if (!validateForm()) return;

    const newTotal = editingAssessment 
      ? totalWeight - editingAssessment.default_weight + parseFloat(formData.default_weight)
      : totalWeight + parseFloat(formData.default_weight);

    if (newTotal > 100) {
      showAlert(`Total weight would exceed 100% (Current: ${totalWeight}%, Adding: ${formData.default_weight}%, New Total: ${newTotal}%)`, 'error');
      return;
    }

    try {
      setSaving(true);
      
      const typeData = {
        name: formData.name.trim(),
        default_weight: parseFloat(formData.default_weight),
        max_score: parseFloat(formData.max_score),
        applicable_levels: formData.applicable_levels
      };

      if (editingAssessment) {
        await assessmentService.updateType(editingAssessment.id, typeData);
        showAlert('Assessment type updated successfully!', 'success');
      } else {
        await assessmentService.createType(typeData);
        showAlert('Assessment type created successfully!', 'success');
      }
      
      await loadAssessmentTypes();
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async (assessment) => {
    if (window.confirm(`Delete ${assessment.name}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await assessmentService.deleteType(assessment.id);
        showAlert(`${assessment.name} deleted successfully`, 'success');
        await loadAssessmentTypes();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const openEditModal = (assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      name: assessment.name,
      default_weight: assessment.default_weight.toString(),
      max_score: assessment.max_score.toString(),
      applicable_levels: assessment.applicable_levels
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      default_weight: '', 
      max_score: 100, 
      applicable_levels: 'BOTH' 
    });
    setErrors({});
    setEditingAssessment(null);
  };

  if (loading) {
    return (
      <div className="assessment-types-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading assessment types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-types-container">
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
            <ClipboardList size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Assessment Types
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Define assessment categories with weights per term</p>
        </div>
        <button 
          className="button" 
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={saving}
        >
          <Plus size={16} /> Add Assessment
        </button>
      </div>
      <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

      <div className={`weight-summary ${showWarning ? 'warning' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showWarning ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span><strong>Total Assessment Weight:</strong> {totalWeight}%</span>
          </div>
          {showWarning ? (
            <span>⚠️ Total must equal 100% for accurate grade calculation</span>
          ) : (
            <span>✓ Perfect! Total weight is 100%</span>
          )}
        </div>
        <div className="weight-bar">
          <div className="weight-bar-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }}></div>
        </div>
      </div>

      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Assessment Name</th>
              <th>Default Weight (%)</th>
              <th>Max Score</th>
              <th>Applicable Levels</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length > 0 ? (
              assessments.map(assessment => (
                <tr key={assessment.id}>
                  <td><strong>{assessment.name}</strong></td>
                  <td>
                    <span className="status-badge status-active">{assessment.default_weight}%</span>
                  </td>
                  <td>{assessment.max_score}</td>
                  <td>
                    <span className="status-badge status-inactive">{assessment.applicable_levels}</span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => openEditModal(assessment)}
                      disabled={saving}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteAssessment(assessment)}
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <ClipboardList size={48} />
                    <p>No assessment types defined</p>
                    <button 
                      className="button" 
                      onClick={() => { resetForm(); setShowModal(true); }}
                      disabled={saving}
                    >
                      <Plus size={16} />
                      Add Your First Assessment Type
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '0.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={16} /> Weight Distribution Example
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {assessments.map(a => (
            <div key={a.id} style={{ flex: 1, minWidth: '100px' }}>
              <div style={{ 
                height: `${a.default_weight * 2}px`, 
                backgroundColor: 'var(--primary)', 
                borderRadius: '4px', 
                marginBottom: '0.25rem' 
              }}></div>
              <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                {a.name}<br />
                {a.default_weight}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssessment ? 'Edit Assessment Type' : 'Add Assessment Type'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); resetForm(); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Assessment Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Quiz, Test, Exam, Project..."
                  disabled={saving}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Default Weight (%) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="default_weight"
                  className={`form-input ${errors.default_weight ? 'error' : ''}`}
                  value={formData.default_weight}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                  disabled={saving}
                />
                {errors.default_weight && <span className="error-message">{errors.default_weight}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Max Score <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="max_score"
                  className={`form-input ${errors.max_score ? 'error' : ''}`}
                  value={formData.max_score}
                  onChange={handleInputChange}
                  min="1"
                  disabled={saving}
                />
                {errors.max_score && <span className="error-message">{errors.max_score}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Applicable Levels</label>
                <select
                  name="applicable_levels"
                  className="form-select"
                  value={formData.applicable_levels}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="JHS">JHS Only</option>
                  <option value="SHS">SHS Only</option>
                  <option value="BOTH">Both JHS & SHS</option>
                </select>
              </div>

              <div className="alert-info" style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '0.375rem', 
                fontSize: '0.875rem' 
              }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Current total weight: {totalWeight}%. Adding this will make it {totalWeight + (parseFloat(formData.default_weight) || 0)}%
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="button button-secondary" 
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="button" 
                onClick={handleAddEditAssessment}
                disabled={saving}
              >
                {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
                {saving ? 'Saving...' : (editingAssessment ? 'Save Changes' : 'Add Assessment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentTypes;