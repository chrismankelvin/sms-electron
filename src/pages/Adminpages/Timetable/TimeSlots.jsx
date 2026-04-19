import { useState } from 'react';
import { Clock, Plus, Edit, Trash2, ChevronUp, ChevronDown, Coffee, X } from 'lucide-react';
import '../../../styles/time-slots.css';

function TimeSlots() {
  const [slots, setSlots] = useState([
    { id: 1, slotName: 'Period 1', startTime: '08:00', endTime: '08:45', orderIndex: 1, isBreak: false },
    { id: 2, slotName: 'Period 2', startTime: '08:45', endTime: '09:30', orderIndex: 2, isBreak: false },
    { id: 3, slotName: 'Break', startTime: '09:30', endTime: '10:00', orderIndex: 3, isBreak: true },
    { id: 4, slotName: 'Period 3', startTime: '10:00', endTime: '10:45', orderIndex: 4, isBreak: false },
    { id: 5, slotName: 'Period 4', startTime: '10:45', endTime: '11:30', orderIndex: 5, isBreak: false },
    { id: 6, slotName: 'Lunch', startTime: '11:30', endTime: '12:15', orderIndex: 6, isBreak: true },
    { id: 7, slotName: 'Period 5', startTime: '12:15', endTime: '13:00', orderIndex: 7, isBreak: false }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({ slotName: '', startTime: '', endTime: '', isBreak: false });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddEditSlot = () => {
    if (!formData.slotName || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingSlot) {
      setSlots(prev => prev.map(s => s.id === editingSlot.id ? { ...s, ...formData } : s));
    } else {
      const newSlot = { id: Date.now(), ...formData, orderIndex: slots.length + 1 };
      setSlots(prev => [...prev, newSlot]);
    }
    setShowModal(false);
    setEditingSlot(null);
    setFormData({ slotName: '', startTime: '', endTime: '', isBreak: false });
  };

  const handleDeleteSlot = (slot) => {
    if (window.confirm(`Delete ${slot.slotName}?`)) {
      setSlots(prev => prev.filter(s => s.id !== slot.id));
    }
  };

  const moveSlot = (slot, direction) => {
    const currentIndex = slots.findIndex(s => s.id === slot.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= slots.length) return;
    
    const newSlots = [...slots];
    [newSlots[currentIndex], newSlots[newIndex]] = [newSlots[newIndex], newSlots[currentIndex]];
    newSlots.forEach((s, idx) => { s.orderIndex = idx + 1; });
    setSlots(newSlots);
  };

  return (
    <div className="time-slots-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Clock size={28} style={{ display: 'inline', marginRight: '12px' }} />Time Slots</h1>
        <p style={{ color: 'var(--secondary)' }}>Define school periods and break times</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Time Slot</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {slots.sort((a, b) => a.orderIndex - b.orderIndex).map(slot => (
          <div key={slot.id} className={`slot-card ${slot.isBreak ? 'break' : ''}`}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontWeight: 'bold' }}>{slot.slotName}</h3>
                {slot.isBreak && <span className="status-badge status-active"><Coffee size={12} /> Break</span>}
                <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
                  {slot.startTime} → {slot.endTime}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Order: {slot.orderIndex}</span>
              </div>
            </div>
            <div className="action-buttons">
              <div className="move-buttons">
                <button className="action-btn edit-btn" onClick={() => moveSlot(slot, 'up')}><ChevronUp size={16} /></button>
                <button className="action-btn edit-btn" onClick={() => moveSlot(slot, 'down')}><ChevronDown size={16} /></button>
              </div>
              <button className="action-btn edit-btn" onClick={() => { setEditingSlot(slot); setFormData(slot); setShowModal(true); }}><Edit size={16} /></button>
              <button className="action-btn delete-btn" onClick={() => handleDeleteSlot(slot)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSlot(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingSlot(null); }} /></div>
            <div className="modal-body">
              <div className="form-group"><label>Slot Name *</label><input type="text" name="slotName" className="form-input" value={formData.slotName} onChange={handleInputChange} placeholder="Period 1, Break, Lunch..." /></div>
              <div className="form-group"><label>Start Time *</label><input type="time" name="startTime" className="form-input" value={formData.startTime} onChange={handleInputChange} /></div>
              <div className="form-group"><label>End Time *</label><input type="time" name="endTime" className="form-input" value={formData.endTime} onChange={handleInputChange} /></div>
              <div className="form-group"><label><input type="checkbox" name="isBreak" checked={formData.isBreak} onChange={handleInputChange} /> This is a break period</label></div>
            </div>
            <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingSlot(null); }}>Cancel</button><button className="button" onClick={handleAddEditSlot}>{editingSlot ? 'Save' : 'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeSlots;