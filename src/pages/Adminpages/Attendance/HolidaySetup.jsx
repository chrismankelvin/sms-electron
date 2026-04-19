import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Repeat, X, Check } from 'lucide-react';
import '../../../styles/holiday-setup.css';

function HolidaySetup() {
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Independence Day', date: '2024-03-06', recurring: true, affectsClasses: 'All' },
    { id: 2, name: 'Mid-Term Break', date: '2024-04-10', recurring: false, affectsClasses: 'All' },
    { id: 3, name: 'Easter Monday', date: '2024-04-01', recurring: true, affectsClasses: 'All' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '', recurring: false, affectsClasses: 'All' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddEditHoliday = () => {
    if (!formData.name || !formData.date) { alert('Please fill in required fields'); return; }
    if (editingHoliday) { setHolidays(prev => prev.map(h => h.id === editingHoliday.id ? { ...h, ...formData } : h)); }
    else { const newHoliday = { id: Date.now(), ...formData }; setHolidays(prev => [...prev, newHoliday]); }
    setShowModal(false); setEditingHoliday(null); setFormData({ name: '', date: '', recurring: false, affectsClasses: 'All' });
  };

  const handleDeleteHoliday = (holiday) => { if (window.confirm(`Delete ${holiday.name}?`)) { setHolidays(prev => prev.filter(h => h.id !== holiday.id)); } };

  return (
    <div className="holiday-setup-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><CalendarIcon size={28} style={{ display: 'inline', marginRight: '12px' }} />Holiday Setup</h1>
        <p style={{ color: 'var(--secondary)' }}>Define non-school days (holidays, breaks)</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Holiday</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div>{holidays.map(holiday => (<div key={holiday.id} className="holiday-card"><div><strong>{holiday.name}</strong><div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{new Date(holiday.date).toLocaleDateString()} • Affects: {holiday.affectsClasses}</div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{holiday.recurring && <span className="holiday-recurring"><Repeat size={12} /> Recurring Yearly</span>}
      <div className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingHoliday(holiday); setFormData(holiday); setShowModal(true); }}><Edit size={16} /></button>
      <button className="action-btn delete-btn" onClick={() => handleDeleteHoliday(holiday)}><Trash2 size={16} /></button></div></div></div>))}</div>

      {showModal && (<div className="modal-overlay" onClick={() => { setShowModal(false); setEditingHoliday(null); }}><div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingHoliday(null); }} /></div>
        <div className="modal-body"><div className="form-group"><label>Holiday Name *</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} /></div>
        <div className="form-group"><label>Date *</label><input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} /></div>
        <div className="form-group"><label><input type="checkbox" name="recurring" checked={formData.recurring} onChange={handleInputChange} /> Recurring yearly?</label></div>
        <div className="form-group"><label>Affects Classes</label><select name="affectsClasses" className="form-select" value={formData.affectsClasses} onChange={handleInputChange}><option>All</option><option>JHS Only</option><option>SHS Only</option></select></div></div>
        <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingHoliday(null); }}>Cancel</button><button className="button" onClick={handleAddEditHoliday}>{editingHoliday ? 'Save' : 'Add'}</button></div>
      </div></div>)}
    </div>
  );
}

export default HolidaySetup;