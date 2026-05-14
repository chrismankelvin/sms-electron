// src/components/Academics/GradeBoundaries.jsx

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  X, 
  Award, 
  Star, 
  ArrowLeft, 
  Save,
  Loader,
  Check,
  AlertCircle
} from 'lucide-react';
import '../../../styles/grade-boundaries.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

// const gradeBoundaryService = {
//   async getAll(levelCategory = null) {
//     const url = levelCategory && levelCategory !== 'BOTH'
//       ? `${API_BASE_URL}/grade-boundaries/?level_category=${levelCategory}`
//       : `${API_BASE_URL}/grade-boundaries/`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

const gradeBoundaryService = {
  async getAll(levelCategory = 'BOTH') {
    const url = `${API_BASE_URL}/grade-boundaries/?level_category=${levelCategory}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || data.detail || 'Failed to fetch grade boundaries');
    }

    return data.data;
  },


  async create(gradeData) {
    const response = await fetch(`${API_BASE_URL}/grade-boundaries/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, gradeData) {
    const response = await fetch(`${API_BASE_URL}/grade-boundaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/grade-boundaries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async copyJhsToShs() {
    const response = await fetch(`${API_BASE_URL}/grade-boundaries/copy-jhs-to-shs`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async previewScore(score, levelCategory = 'BOTH') {
    const response = await fetch(`${API_BASE_URL}/grade-boundaries/preview-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, level_category: levelCategory })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function GradeBoundaries() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState('BOTH');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [previewData, setPreviewData] = useState([]);
  const [formData, setFormData] = useState({
    grade: '',
    min_score: '',
    max_score: '',
    grade_point: '',
    remark: '',
    level_category: 'BOTH'
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadGradeBoundaries();
  }, [filterCategory]);

  const loadGradeBoundaries = async () => {
    try {
      setLoading(true);
      const data = await gradeBoundaryService.getAll(filterCategory);
      setGrades(data);
    } catch (error) {
      showAlert('Failed to load grade boundaries: ' + error.message, 'error');
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
    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';
    if (!formData.min_score) newErrors.min_score = 'Min score is required';
    if (!formData.max_score) newErrors.max_score = 'Max score is required';
    if (!formData.grade_point && formData.grade_point !== 0) newErrors.grade_point = 'Grade point is required';
    
    const minScore = parseFloat(formData.min_score);
    const maxScore = parseFloat(formData.max_score);
    const gradePoint = parseFloat(formData.grade_point);
    
    if (minScore >= maxScore) {
      newErrors.min_score = 'Min score must be less than max score';
    }
    
    if (minScore < 0 || minScore > 100) {
      newErrors.min_score = 'Min score must be between 0 and 100';
    }
    
    if (maxScore < 0 || maxScore > 100) {
      newErrors.max_score = 'Max score must be between 0 and 100';
    }
    
    if (gradePoint < 0 || gradePoint > 4) {
      newErrors.grade_point = 'Grade point must be between 0 and 4';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveGrade = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const gradeData = {
        grade: formData.grade.trim(),
        min_score: parseFloat(formData.min_score),
        max_score: parseFloat(formData.max_score),
        grade_point: parseFloat(formData.grade_point),
        remark: formData.remark || '',
        level_category: formData.level_category,
        is_default: false
      };

      if (view === 'edit' && selectedGrade) {
        await gradeBoundaryService.update(selectedGrade.id, gradeData);
        showAlert('Grade boundary updated successfully!', 'success');
      } else {
        await gradeBoundaryService.create(gradeData);
        showAlert('Grade boundary created successfully!', 'success');
      }
      
      await loadGradeBoundaries();
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      grade: grade.grade,
      min_score: grade.min_score.toString(),
      max_score: grade.max_score.toString(),
      grade_point: grade.grade_point.toString(),
      remark: grade.remark || '',
      level_category: grade.level_category
    });
    setView('edit');
  };

  const handleDeleteGrade = async (grade) => {
    if (grade.is_default) {
      showAlert('Cannot delete default grade boundaries', 'error');
      return;
    }
    
    if (window.confirm(`Delete grade ${grade.grade}?`)) {
      try {
        setSaving(true);
        await gradeBoundaryService.delete(grade.id);
        showAlert(`Grade ${grade.grade} deleted successfully`, 'success');
        await loadGradeBoundaries();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCopyFromJHStoSHS = async () => {
    try {
      setSaving(true);
      const result = await gradeBoundaryService.copyJhsToShs();
      showAlert(result.message || `Successfully copied ${result.copied_count} grades from JHS to SHS`, 'success');
      await loadGradeBoundaries();
    } catch (error) {
      showAlert('Failed to copy grades: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewMapping = async () => {
    try {
      setSaving(true);
      const previewScores = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5];
      const previewResults = await Promise.all(
        previewScores.map(score => gradeBoundaryService.previewScore(score, filterCategory))
      );
      setPreviewData(previewResults);
      setShowPreview(true);
    } catch (error) {
      showAlert('Failed to load preview: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      grade: '',
      min_score: '',
      max_score: '',
      grade_point: '',
      remark: '',
      level_category: 'BOTH'
    });
    setErrors({});
    setSelectedGrade(null);
  };

  const getScoreGrade = (score) => {
    const grade = grades.find(g => score >= g.min_score && score <= g.max_score);
    return grade || { grade: 'N/A', remark: 'Invalid Score', grade_point: 0 };
  };

  if (loading) {
    return (
      <div className="grade-boundaries-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading grade boundaries...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="grade-boundaries-container">
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
              <Award size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Grade Boundaries
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define grading scales for JHS and SHS</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="button button-secondary" 
              onClick={handleCopyFromJHStoSHS}
              disabled={saving}
            >
              <Copy size={16} /> Copy JHS → SHS
            </button>
            <button 
              className="button button-secondary" 
              onClick={handlePreviewMapping}
              disabled={saving}
            >
              <Eye size={16} /> Preview Mapping
            </button>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} /> Add Grade
            </button>
          </div>
        </div>
        <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <label>Filter by Level:</label>
          <select 
            className="filter-select" 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            disabled={saving}
          >
            <option value="BOTH">All Levels</option>
            <option value="JHS">JHS Only</option>
            <option value="SHS">SHS Only</option>
          </select>
        </div>

        <div className="table-container">
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Min Score</th>
                <th>Max Score</th>
                <th>Grade Point</th>
                <th>Remark</th>
                <th>Level Category</th>
                <th>Default?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.sort((a, b) => b.min_score - a.min_score).map(grade => (
                  <tr key={grade.id} className="grade-row">
                    <td><strong>{grade.grade}</strong></td>
                    <td>{grade.min_score}</td>
                    <td>{grade.max_score}</td>
                    <td>{grade.grade_point}</td>
                    <td>{grade.remark}</td>
                    <td><span className="status-badge status-active">{grade.level_category}</span></td>
                    <td>{grade.is_default && <Star size={16} color="#f59e0b" />}</td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditGrade(grade)}
                        disabled={saving}
                      >
                        <Edit size={16} />
                      </button>
                      {!grade.is_default && (
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDeleteGrade(grade)}
                          disabled={saving}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <Award size={48} />
                      <p>No grade boundaries defined</p>
                      <button 
                        className="button" 
                        onClick={() => { resetForm(); setView('create'); }}
                        disabled={saving}
                      >
                        <Plus size={16} />
                        Add Your First Grade Boundary
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Score to Grade Preview</h2>
                <X className="modal-close" size={20} onClick={() => setShowPreview(false)} />
              </div>
              <div className="modal-body">
                <div className="grade-preview">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                    {previewData.map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{item.score}</div>
                        <div>{item.grade}</div>
                        <div style={{ fontSize: '0.75rem' }}>{item.remark}</div>
                        <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>{item.grade_point} GPA</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Grade Mapping:</h3>
                  {grades.sort((a, b) => b.min_score - a.min_score).map(g => (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span><strong>{g.grade}</strong> ({g.min_score}-{g.max_score})</span>
                      <span>{g.remark}</span>
                      <span>{g.grade_point} GPA</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="button" onClick={() => setShowPreview(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="grade-boundaries-container">
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
            <ArrowLeft size={16} /> Back to Grade Boundaries
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add Grade Boundary' : `Edit: ${selectedGrade?.grade}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new grade boundary' : 'Update grade boundary information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }}>
          <div className="form-section">
            <h2>Grade Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Grade <span className="required">*</span></label>
                <input
                  type="text"
                  name="grade"
                  className={`form-input ${errors.grade ? 'error' : ''}`}
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B+, C-"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Letter grade identifier (A, B, C, etc.)
                </small>
                {errors.grade && <span className="error-message">{errors.grade}</span>}
              </div>

              <div className="form-group">
                <label>Min Score <span className="required">*</span></label>
                <input
                  type="number"
                  name="min_score"
                  className={`form-input ${errors.min_score ? 'error' : ''}`}
                  value={formData.min_score}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  step="0.01"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Minimum percentage to achieve this grade
                </small>
                {errors.min_score && <span className="error-message">{errors.min_score}</span>}
              </div>

              <div className="form-group">
                <label>Max Score <span className="required">*</span></label>
                <input
                  type="number"
                  name="max_score"
                  className={`form-input ${errors.max_score ? 'error' : ''}`}
                  value={formData.max_score}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  step="0.01"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Maximum percentage for this grade
                </small>
                {errors.max_score && <span className="error-message">{errors.max_score}</span>}
              </div>

              <div className="form-group">
                <label>Grade Point <span className="required">*</span></label>
                <input
                  type="number"
                  name="grade_point"
                  className={`form-input ${errors.grade_point ? 'error' : ''}`}
                  value={formData.grade_point}
                  onChange={handleInputChange}
                  placeholder="0.0 - 4.0"
                  step="0.1"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  GPA value for this grade (0.0 to 4.0)
                </small>
                {errors.grade_point && <span className="error-message">{errors.grade_point}</span>}
              </div>

              <div className="form-group">
                <label>Remark</label>
                <input
                  type="text"
                  name="remark"
                  className="form-input"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="e.g., Excellent, Good, Pass"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Optional description or remark for this grade
                </small>
              </div>

              <div className="form-group">
                <label>Level Category <span className="required">*</span></label>
                <select
                  name="level_category"
                  className="form-select"
                  value={formData.level_category}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="BOTH">Both JHS & SHS</option>
                  <option value="JHS">JHS Only</option>
                  <option value="SHS">SHS Only</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Which educational level(s) this grade applies to
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Grade' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GradeBoundaries;