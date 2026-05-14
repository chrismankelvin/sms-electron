// src/components/Academics/Levels.jsx

import { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  ArrowLeft, 
  Save,
  Loader,
  Check,
  X
} from 'lucide-react';
import '../../../styles/levels.css';

// API Service
const API_BASE_URL = 'http://localhost:8000/api';

const levelService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/levels/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/levels/category/${category}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getNextOrderIndex(category) {
    const response = await fetch(`${API_BASE_URL}/levels/next-order/${category}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data.next_order_index;
  },

  async create(levelData) {
    const response = await fetch(`${API_BASE_URL}/levels/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levelData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, levelData) {
    const response = await fetch(`${API_BASE_URL}/levels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levelData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/levels/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  },

  async reorder(category, order) {
    const response = await fetch(`${API_BASE_URL}/levels/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, order })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return true;
  }
};

function Levels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    category: 'JHS',
    order_index: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const data = await levelService.getAll();
      setLevels(data);
    } catch (error) {
      showAlert('Failed to load levels: ' + error.message, 'error');
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
    if (!formData.name.trim()) newErrors.name = 'Level name is required';
    if (!formData.order_index) newErrors.order_index = 'Order index is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    const orderIndex = parseInt(formData.order_index);
    if (orderIndex && (orderIndex < 1 || orderIndex > 20)) {
      newErrors.order_index = 'Order index must be between 1 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLevel = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const levelData = {
        name: formData.name,
        category: formData.category,
        order_index: parseInt(formData.order_index),
        description: formData.description || ''
      };

      if (view === 'edit' && selectedLevel) {
        await levelService.update(selectedLevel.id, levelData);
        showAlert('Level updated successfully!', 'success');
      } else {
        await levelService.create(levelData);
        showAlert('Level created successfully!', 'success');
      }
      
      await loadLevels();
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditLevel = (level) => {
    setSelectedLevel(level);
    setFormData({
      name: level.name,
      category: level.category,
      order_index: level.order_index.toString(),
      description: level.description || ''
    });
    setView('edit');
  };

  const handleDeleteLevel = async (level) => {
    if (level.has_classes) {
      showAlert(`Cannot delete ${level.name} because it has existing classes. Please reassign or delete classes first.`, 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${level.name}?`)) {
      try {
        setSaving(true);
        await levelService.delete(level.id);
        showAlert(`${level.name} has been deleted`, 'success');
        await loadLevels();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleQuickAdd = async (category) => {
    try {
      const nextIndex = await levelService.getNextOrderIndex(category);
      const categoryNum = category === 'JHS' ? nextIndex : nextIndex;
      
      setFormData({
        name: `${category} ${categoryNum}`,
        category: category,
        order_index: nextIndex.toString(),
        description: ''
      });
      setView('create');
    } catch (error) {
      showAlert('Failed to get next order index: ' + error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'JHS',
      order_index: '',
      description: ''
    });
    setErrors({});
    setSelectedLevel(null);
  };

  const getCategoryBadgeClass = (category) => {
    return category === 'JHS' ? 'level-badge-jhs' : 'level-badge-shs';
  };

  if (loading) {
    return (
      <div className="levels-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading academic levels...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="levels-container">
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
              <Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Levels
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define hierarchical levels (JHS/SHS) for promotion tracking</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="button button-secondary" 
              onClick={() => handleQuickAdd('JHS')}
              disabled={saving}
            >
              <Plus size={16} /> Quick Add JHS
            </button>
            <button 
              className="button button-secondary" 
              onClick={() => handleQuickAdd('SHS')}
              disabled={saving}
            >
              <Plus size={16} /> Quick Add SHS
            </button>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} /> Add Level
            </button>
          </div>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {levels.sort((a, b) => a.order_index - b.order_index).map(level => {
            const categoryLevels = levels.filter(l => l.category === level.category);
            const isGraduating = level.order_index === categoryLevels.length;
            
            return (
              <div key={level.id} className="level-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{level.name}</h3>
                    <span className={`status-badge ${getCategoryBadgeClass(level.category)}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                      {level.category}
                    </span>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEditLevel(level)}
                      disabled={saving}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteLevel(level)}
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                  Order: {level.order_index} 
                  {level.order_index === 1 && ' (Entry Level)'} 
                  {isGraduating && ' (Graduating)'}
                </div>
                {level.description && (
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{level.description}</p>
                )}
                {level.has_classes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> Has existing classes - cannot delete
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="levels-container">
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
            <ArrowLeft size={16} /> Back to Levels
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Level' : `Edit: ${selectedLevel?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Create a new academic level' : 'Update level information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveLevel(); }}>
          <div className="form-section">
            <h2>Level Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Level Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., JHS 1, SHS 2"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Unique name within the selected category
                </small>
                {errors.name && <span className="error-message">{errors.name}</span>}
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
                  <option value="JHS">JHS (Junior High School)</option>
                  <option value="SHS">SHS (Senior High School)</option>
                </select>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Determines which educational level this belongs to
                </small>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>Order Index <span className="required">*</span></label>
                <input
                  type="number"
                  name="order_index"
                  className={`form-input ${errors.order_index ? 'error' : ''}`}
                  value={formData.order_index}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3..."
                  min="1"
                  max="20"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Unique per category. Determines promotion order (1 = entry level)
                </small>
                {errors.order_index && <span className="error-message">{errors.order_index}</span>}
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of this academic level"
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Level' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Levels;