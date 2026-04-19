import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Copy, Eye, X, Save } from 'lucide-react';
import '../../../styles/templates.css';

function Templates() {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Result Published', category: 'Academic', type: 'Email', variables: ['student_name', 'average', 'grade'], lastUsed: '2024-03-20' },
    { id: 2, name: 'Fee Reminder', category: 'Fee', type: 'SMS', variables: ['amount', 'due_date'], lastUsed: '2024-03-15' },
    { id: 3, name: 'Attendance Alert', category: 'Attendance', type: 'Email', variables: ['student_name', 'days_absent', 'percentage'], lastUsed: '2024-03-10' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', type: 'Email', titleTemplate: '', bodyTemplate: '' });

  const categories = ['Academic', 'Fee', 'Attendance', 'Event', 'System'];
  const types = ['Email', 'SMS', 'Push', 'In-App'];
  const availableVariables = ['student_name', 'student_number', 'parent_name', 'class', 'average', 'grade', 'position', 'amount', 'due_date', 'days_absent', 'percentage'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const insertVariable = (variable) => {
    setFormData(prev => ({ ...prev, bodyTemplate: prev.bodyTemplate + ` {{${variable}}}` }));
  };

  const handleAddEditTemplate = () => {
    if (!formData.name || !formData.bodyTemplate) { alert('Please fill in required fields'); return; }
    const variables = formData.bodyTemplate.match(/{{(.*?)}}/g)?.map(v => v.replace(/[{}]/g, '')) || [];
    
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...formData, variables } : t));
    } else {
      const newTemplate = { id: Date.now(), ...formData, variables, lastUsed: '-' };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setShowModal(false); setEditingTemplate(null);
    setFormData({ name: '', category: '', type: 'Email', titleTemplate: '', bodyTemplate: '' });
  };

  const handleDeleteTemplate = (template) => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    }
  };

  const handleUseTemplate = (template) => {
    alert(`Using template: ${template.name}`);
  };

  return (
    <div className="templates-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />Notification Templates</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage reusable notification templates</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Create Template</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Template Name</th><th>Category</th><th>Type</th><th>Variables</th><th>Last Used</th><th>Actions</th></tr></thead>
      <tbody>{templates.map(t => (<tr key={t.id}><td><strong>{t.name}</strong></td>
      <td><span className="status-badge status-active">{t.category}</span></td>
      <td><span className={`type-badge type-${t.type.toLowerCase()}`}>{t.type}</span></td>
      <td>{t.variables.map(v => <span key={v} className="variable-chip" style={{ background: '#6b7280' }}>{v}</span>)}</td>
      <td>{t.lastUsed}</td><td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingTemplate(t); setFormData(t); setShowModal(true); }}><Edit size={16} /></button>
      <button className="action-btn set-current-btn" onClick={() => handleUseTemplate(t)}><Copy size={16} /> Use</button>
      <button className="action-btn delete-btn" onClick={() => handleDeleteTemplate(t)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>

      {showModal && (<div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTemplate(null); }}><div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{editingTemplate ? 'Edit Template' : 'Create Template'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingTemplate(null); }} /></div>
        <div className="modal-body"><div className="form-group"><label>Template Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Category</label><select name="category" className="form-select" value={formData.category} onChange={handleInputChange}><option value="">Select</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="form-group"><label>Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div className="form-group"><label>Title Template</label><input type="text" name="titleTemplate" className="form-input" value={formData.titleTemplate} onChange={handleInputChange} placeholder="e.g., {{student_name}} - Results Available" /></div>
        <div className="form-group"><label>Body Template *</label><textarea name="bodyTemplate" className="form-textarea" rows="6" value={formData.bodyTemplate} onChange={handleInputChange} placeholder="Write your template here... Use {{variable}} for dynamic content"></textarea></div>
        <div className="form-group"><label>Available Variables (click to insert)</label><div>{availableVariables.map(v => <span key={v} className="variable-chip" onClick={() => insertVariable(v)}>{v}</span>)}</div></div>
        <div className="template-preview"><strong>Preview:</strong><div style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{formData.bodyTemplate.replace(/\{\{(.*?)\}\}/g, '<span style="background:var(--primary);color:white;padding:0 0.25rem;border-radius:0.25rem;">[$1]</span>')}</div></div></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingTemplate(null); }}>Cancel</button><button className="button" onClick={handleAddEditTemplate}>{editingTemplate ? 'Save' : 'Create'}</button></div>
      </div></div>)}
    </div>
  );
}

export default Templates;