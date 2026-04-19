import { useState } from 'react';
import { Layers, Plus, Edit, Trash2, TrendingUp, AlertCircle, X } from 'lucide-react';
import '../../../styles/levels.css';

function Levels() {
  const [levels, setLevels] = useState([
    { id: 1, levelName: 'JHS 1', category: 'JHS', orderIndex: 1, description: 'Junior High School Year 1', hasClasses: true },
    { id: 2, levelName: 'JHS 2', category: 'JHS', orderIndex: 2, description: 'Junior High School Year 2', hasClasses: true },
    { id: 3, levelName: 'JHS 3', category: 'JHS', orderIndex: 3, description: 'Junior High School Year 3 - BECE', hasClasses: false },
    { id: 4, levelName: 'SHS 1', category: 'SHS', orderIndex: 4, description: 'Senior High School Year 1', hasClasses: false },
    { id: 5, levelName: 'SHS 2', category: 'SHS', orderIndex: 5, description: 'Senior High School Year 2', hasClasses: true },
    { id: 6, levelName: 'SHS 3', category: 'SHS', orderIndex: 6, description: 'Senior High School Year 3 - WASSCE', hasClasses: false }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [formData, setFormData] = useState({ levelName: '', category: 'JHS', orderIndex: '', description: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditLevel = () => {
    if (!formData.levelName || !formData.orderIndex) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingLevel) {
      setLevels(prev => prev.map(l => l.id === editingLevel.id ? { ...l, ...formData, hasClasses: l.hasClasses } : l));
    } else {
      const newLevel = { id: Date.now(), ...formData, hasClasses: false };
      setLevels(prev => [...prev, newLevel]);
    }
    setShowModal(false);
    setEditingLevel(null);
    setFormData({ levelName: '', category: 'JHS', orderIndex: '', description: '' });
  };

  const handleDeleteLevel = (level) => {
    if (level.hasClasses) {
      alert(`Cannot delete ${level.levelName} because it has existing classes. Please reassign or delete classes first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${level.levelName}?`)) {
      setLevels(prev => prev.filter(l => l.id !== level.id));
    }
  };

  const openEditModal = (level) => {
    setEditingLevel(level);
    setFormData({ levelName: level.levelName, category: level.category, orderIndex: level.orderIndex, description: level.description || '' });
    setShowModal(true);
  };

  return (
    <div className="levels-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Layers size={28} style={{ display: 'inline', marginRight: '12px' }} />Academic Levels</h1>
        <p style={{ color: 'var(--secondary)' }}>Define hierarchical levels (JHS/SHS) for promotion tracking</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Level</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {levels.sort((a, b) => a.orderIndex - b.orderIndex).map(level => (
          <div key={level.id} className="level-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div><h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{level.levelName}</h3>
              <span className={`status-badge ${level.category === 'JHS' ? 'level-badge-jhs' : 'level-badge-shs'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>{level.category}</span></div>
              <div className="action-buttons"><button className="action-btn edit-btn" onClick={() => openEditModal(level)}><Edit size={16} /></button>
              <button className="action-btn delete-btn" onClick={() => handleDeleteLevel(level)}><Trash2 size={16} /></button></div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Order: {level.orderIndex} {level.orderIndex === 1 && '(Entry Level)'} {level.orderIndex === levels.length && '(Graduating)'}</div>
            {level.description && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{level.description}</p>}
            {level.hasClasses && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> Has existing classes - cannot delete</div>}
          </div>
        ))}
      </div>

      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingLevel(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingLevel ? 'Edit Level' : 'Add New Level'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingLevel(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Level Name <span className="required">*</span></label>
              <input type="text" name="levelName" className="form-input" value={formData.levelName} onChange={handleInputChange} placeholder="e.g., JHS 1" /></div>
            <div className="form-group"><label className="form-label">Category <span className="required">*</span></label>
              <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                <option value="JHS">JHS (Junior High School)</option><option value="SHS">SHS (Senior High School)</option></select></div>
            <div className="form-group"><label className="form-label">Order Index <span className="required">*</span></label>
              <input type="number" name="orderIndex" className="form-input" value={formData.orderIndex} onChange={handleInputChange} placeholder="1, 2, 3..." /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Optional description"></textarea></div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingLevel(null); }}>Cancel</button>
          <button className="button" onClick={handleAddEditLevel}>{editingLevel ? 'Save Changes' : 'Add Level'}</button></div>
        </div>
      </div>}
    </div>
  );
}

export default Levels;