import { useState } from 'react';
import { Calendar, Edit, ChevronUp, ChevronDown, Power, X } from 'lucide-react';
import '../../../styles/week-days.css';

function WeekDays() {
  const [days, setDays] = useState([
    { id: 1, dayName: 'Monday', orderIndex: 1, isActive: true },
    { id: 2, dayName: 'Tuesday', orderIndex: 2, isActive: true },
    { id: 3, dayName: 'Wednesday', orderIndex: 3, isActive: true },
    { id: 4, dayName: 'Thursday', orderIndex: 4, isActive: true },
    { id: 5, dayName: 'Friday', orderIndex: 5, isActive: true },
    { id: 6, dayName: 'Saturday', orderIndex: 6, isActive: false }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({ dayName: '', orderIndex: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditDay = () => {
    if (!formData.dayName) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingDay) {
      setDays(prev => prev.map(d => d.id === editingDay.id ? { ...d, ...formData, orderIndex: parseInt(formData.orderIndex) } : d));
    }
    setShowModal(false);
    setEditingDay(null);
    setFormData({ dayName: '', orderIndex: '' });
  };

  const toggleActive = (day) => {
    setDays(prev => prev.map(d => d.id === day.id ? { ...d, isActive: !d.isActive } : d));
  };

  const moveDay = (day, direction) => {
    const activeDays = days.filter(d => d.isActive);
    const currentIndex = activeDays.findIndex(d => d.id === day.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= activeDays.length) return;
    
    const newDays = [...days];
    const currentPos = newDays.findIndex(d => d.id === day.id);
    const targetPos = newDays.findIndex(d => d.id === activeDays[newIndex].id);
    [newDays[currentPos], newDays[targetPos]] = [newDays[targetPos], newDays[currentPos]];
    newDays.forEach((d, idx) => { d.orderIndex = idx + 1; });
    setDays(newDays);
  };

  return (
    <div className="week-days-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />Week Days</h1>
        <p style={{ color: 'var(--secondary)' }}>Define school days and their order</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {days.sort((a, b) => a.orderIndex - b.orderIndex).map(day => (
          <div key={day.id} className={`day-card ${!day.isActive ? 'inactive' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="day-order">{day.orderIndex}</div>
              <div><h3 style={{ fontWeight: 'bold' }}>{day.dayName}</h3></div>
            </div>
            <div className="action-buttons">
              {day.isActive && (
                <>
                  <button className="action-btn edit-btn" onClick={() => moveDay(day, 'up')}><ChevronUp size={16} /></button>
                  <button className="action-btn edit-btn" onClick={() => moveDay(day, 'down')}><ChevronDown size={16} /></button>
                </>
              )}
              <button className="action-btn edit-btn" onClick={() => { setEditingDay(day); setFormData({ dayName: day.dayName, orderIndex: day.orderIndex }); setShowModal(true); }}><Edit size={16} /></button>
              <button className={`action-btn ${day.isActive ? 'delete-btn' : 'set-current-btn'}`} onClick={() => toggleActive(day)}><Power size={16} /> {day.isActive ? 'Deactivate' : 'Activate'}</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingDay(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Day</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingDay(null); }} /></div>
            <div className="modal-body">
              <div className="form-group"><label>Day Name *</label><input type="text" name="dayName" className="form-input" value={formData.dayName} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Order Index</label><input type="number" name="orderIndex" className="form-input" value={formData.orderIndex} onChange={handleInputChange} /></div>
            </div>
            <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingDay(null); }}>Cancel</button><button className="button" onClick={handleAddEditDay}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeekDays;