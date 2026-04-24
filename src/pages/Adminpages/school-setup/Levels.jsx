// import { useState } from 'react';
// import { Layers, Plus, Edit, Trash2, TrendingUp, AlertCircle, X } from 'lucide-react';
// import '../../../styles/levels.css';

// function Levels() {
//   const [levels, setLevels] = useState([
//     { id: 1, levelName: 'JHS 1', category: 'JHS', orderIndex: 1, description: 'Junior High School Year 1', hasClasses: true },
//     { id: 2, levelName: 'JHS 2', category: 'JHS', orderIndex: 2, description: 'Junior High School Year 2', hasClasses: true },
//     { id: 3, levelName: 'JHS 3', category: 'JHS', orderIndex: 3, description: 'Junior High School Year 3 - BECE', hasClasses: false },
//     { id: 4, levelName: 'SHS 1', category: 'SHS', orderIndex: 4, description: 'Senior High School Year 1', hasClasses: false },
//     { id: 5, levelName: 'SHS 2', category: 'SHS', orderIndex: 5, description: 'Senior High School Year 2', hasClasses: true },
//     { id: 6, levelName: 'SHS 3', category: 'SHS', orderIndex: 6, description: 'Senior High School Year 3 - WASSCE', hasClasses: false }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [editingLevel, setEditingLevel] = useState(null);
//   const [formData, setFormData] = useState({ levelName: '', category: 'JHS', orderIndex: '', description: '' });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditLevel = () => {
//     if (!formData.levelName || !formData.orderIndex) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingLevel) {
//       setLevels(prev => prev.map(l => l.id === editingLevel.id ? { ...l, ...formData, hasClasses: l.hasClasses } : l));
//     } else {
//       const newLevel = { id: Date.now(), ...formData, hasClasses: false };
//       setLevels(prev => [...prev, newLevel]);
//     }
//     setShowModal(false);
//     setEditingLevel(null);
//     setFormData({ levelName: '', category: 'JHS', orderIndex: '', description: '' });
//   };

//   const handleDeleteLevel = (level) => {
//     if (level.hasClasses) {
//       alert(`Cannot delete ${level.levelName} because it has existing classes. Please reassign or delete classes first.`);
//       return;
//     }
//     if (window.confirm(`Are you sure you want to delete ${level.levelName}?`)) {
//       setLevels(prev => prev.filter(l => l.id !== level.id));
//     }
//   };

//   const openEditModal = (level) => {
//     setEditingLevel(level);
//     setFormData({ levelName: level.levelName, category: level.category, orderIndex: level.orderIndex, description: level.description || '' });
//     setShowModal(true);
//   };

//   return (
//     <div className="levels-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />Academic Levels</h1>
//         <p style={{ color: 'var(--secondary)' }}>Define hierarchical levels (JHS/SHS) for promotion tracking</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Level</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
//         {levels.sort((a, b) => a.orderIndex - b.orderIndex).map(level => (
//           <div key={level.id} className="level-card">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
//               <div><h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{level.levelName}</h3>
//               <span className={`status-badge ${level.category === 'JHS' ? 'level-badge-jhs' : 'level-badge-shs'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>{level.category}</span></div>
//               <div className="action-buttons"><button className="action-btn edit-btn" onClick={() => openEditModal(level)}><Edit size={16} /></button>
//               <button className="action-btn delete-btn" onClick={() => handleDeleteLevel(level)}><Trash2 size={16} /></button></div>
//             </div>
//             <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Order: {level.orderIndex} {level.orderIndex === 1 && '(Entry Level)'} {level.orderIndex === levels.length && '(Graduating)'}</div>
//             {level.description && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{level.description}</p>}
//             {level.hasClasses && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> Has existing classes - cannot delete</div>}
//           </div>
//         ))}
//       </div>

//       {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingLevel(null); }}>
//         <div className="modal-container" onClick={e => e.stopPropagation()}>
//           <div className="modal-header"><h2>{editingLevel ? 'Edit Level' : 'Add New Level'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingLevel(null); }} /></div>
//           <div className="modal-body">
//             <div className="form-group"><label className="form-label">Level Name <span className="required">*</span></label>
//               <input type="text" name="levelName" className="form-input" value={formData.levelName} onChange={handleInputChange} placeholder="e.g., JHS 1" /></div>
//             <div className="form-group"><label className="form-label">Category <span className="required">*</span></label>
//               <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
//                 <option value="JHS">JHS (Junior High School)</option><option value="SHS">SHS (Senior High School)</option></select></div>
//             <div className="form-group"><label className="form-label">Order Index <span className="required">*</span></label>
//               <input type="number" name="orderIndex" className="form-input" value={formData.orderIndex} onChange={handleInputChange} placeholder="1, 2, 3..." /></div>
//             <div className="form-group"><label className="form-label">Description</label>
//               <textarea name="description" className="form-textarea" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Optional description"></textarea></div>
//           </div>
//           <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingLevel(null); }}>Cancel</button>
//           <button className="button" onClick={handleAddEditLevel}>{editingLevel ? 'Save Changes' : 'Add Level'}</button></div>
//         </div>
//       </div>}
//     </div>
//   );
// }

// export default Levels;





// src/components/Academics/Levels.jsx
import { useState } from 'react';
import { Layers, Plus, Edit, Trash2, TrendingUp, AlertCircle, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/levels.css';

function Levels() {
  const [levels, setLevels] = useState([
    { id: 1, name: 'JHS 1', category: 'JHS', order_index: 1, description: 'Junior High School Year 1', has_classes: true },
    { id: 2, name: 'JHS 2', category: 'JHS', order_index: 2, description: 'Junior High School Year 2', has_classes: true },
    { id: 3, name: 'JHS 3', category: 'JHS', order_index: 3, description: 'Junior High School Year 3 - BECE', has_classes: false },
    { id: 4, name: 'SHS 1', category: 'SHS', order_index: 4, description: 'Senior High School Year 1', has_classes: false },
    { id: 5, name: 'SHS 2', category: 'SHS', order_index: 5, description: 'Senior High School Year 2', has_classes: true },
    { id: 6, name: 'SHS 3', category: 'SHS', order_index: 6, description: 'Senior High School Year 3 - WASSCE', has_classes: false }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'JHS',
    order_index: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

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
    
    // Validate order index is a positive number
    const orderIndex = parseInt(formData.order_index);
    if (orderIndex && (orderIndex < 1 || orderIndex > 20)) {
      newErrors.order_index = 'Order index must be between 1 and 20';
    }
    
    // Check for duplicate category + order_index combination
    const existingLevel = levels.find(l => 
      l.category === formData.category && 
      l.order_index === orderIndex &&
      (!selectedLevel || l.id !== selectedLevel.id)
    );
    if (existingLevel) {
      newErrors.order_index = `Order index ${orderIndex} already exists for ${formData.category}. Must be unique per category.`;
    }
    
    // Check for duplicate name within same category
    const existingName = levels.find(l => 
      l.category === formData.category && 
      l.name.toLowerCase() === formData.name.toLowerCase() &&
      (!selectedLevel || l.id !== selectedLevel.id)
    );
    if (existingName) {
      newErrors.name = `"${formData.name}" already exists in ${formData.category}.`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLevel = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedLevel) {
      // Update existing level
      setLevels(prev => prev.map(l => 
        l.id === selectedLevel.id 
          ? { 
              ...l, 
              name: formData.name,
              category: formData.category,
              order_index: parseInt(formData.order_index),
              description: formData.description || '',
              updated_at: new Date().toISOString()
            }
          : l
      ));
    } else {
      // Add new level
      const newLevel = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        order_index: parseInt(formData.order_index),
        description: formData.description || '',
        has_classes: false,
        created_at: new Date().toISOString()
      };
      setLevels(prev => [...prev, newLevel]);
    }
    
    resetForm();
    setView('list');
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

  const handleDeleteLevel = (level) => {
    if (level.has_classes) {
      alert(`Cannot delete ${level.name} because it has existing classes. Please reassign or delete classes first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${level.name}?`)) {
      setLevels(prev => prev.filter(l => l.id !== level.id));
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

  const getNextOrderIndex = (category) => {
    const categoryLevels = levels.filter(l => l.category === category);
    if (categoryLevels.length === 0) return 1;
    return Math.max(...categoryLevels.map(l => l.order_index)) + 1;
  };

  const handleQuickAdd = (category) => {
    const nextIndex = getNextOrderIndex(category);
    const categoryNum = category === 'JHS' ? nextIndex : nextIndex - 3;
    setFormData({
      name: `${category} ${categoryNum}`,
      category: category,
      order_index: nextIndex.toString(),
      description: ''
    });
    setView('create');
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="levels-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Academic Levels
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define hierarchical levels (JHS/SHS) for promotion tracking</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button button-secondary" onClick={() => handleQuickAdd('JHS')}>
              <Plus size={16} /> Quick Add JHS
            </button>
            <button className="button button-secondary" onClick={() => handleQuickAdd('SHS')}>
              <Plus size={16} /> Quick Add SHS
            </button>
            <button className="button" onClick={() => { resetForm(); setView('create'); }}>
              <Plus size={16} /> Add Level
            </button>
          </div>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {levels.sort((a, b) => a.order_index - b.order_index).map(level => (
            <div key={level.id} className="level-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{level.name}</h3>
                  <span className={`status-badge ${getCategoryBadgeClass(level.category)}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                    {level.category}
                  </span>
                </div>
                <div className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => handleEditLevel(level)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteLevel(level)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                Order: {level.order_index} 
                {level.order_index === 1 && ' (Entry Level)'} 
                {level.order_index === levels.filter(l => l.category === level.category).length && ' (Graduating)'}
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
          ))}
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="levels-container">
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
                />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Level' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Levels;