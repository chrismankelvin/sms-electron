// src/components/Academics/TimeSlots.jsx
import { useState } from 'react';
import { Clock, Plus, Edit, Trash2, ChevronUp, ChevronDown, Coffee, X, ArrowLeft, Save } from 'lucide-react';
import '../../../styles/time-slots.css';

function TimeSlots() {
  const [slots, setSlots] = useState([
    { id: 1, name: 'Period 1', start_time: '08:00', end_time: '08:45', order_index: 1, is_break: false },
    { id: 2, name: 'Period 2', start_time: '08:45', end_time: '09:30', order_index: 2, is_break: false },
    { id: 3, name: 'Break', start_time: '09:30', end_time: '10:00', order_index: 3, is_break: true },
    { id: 4, name: 'Period 3', start_time: '10:00', end_time: '10:45', order_index: 4, is_break: false },
    { id: 5, name: 'Period 4', start_time: '10:45', end_time: '11:30', order_index: 5, is_break: false },
    { id: 6, name: 'Lunch', start_time: '11:30', end_time: '12:15', order_index: 6, is_break: true },
    { id: 7, name: 'Period 5', start_time: '12:15', end_time: '13:00', order_index: 7, is_break: false }
  ]);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    is_break: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Slot name is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    
    // Validate time range
    if (formData.start_time && formData.end_time) {
      const start = formData.start_time;
      const end = formData.end_time;
      
      if (start >= end) {
        newErrors.end_time = 'End time must be after start time';
      }
    }
    
    // Check for overlapping time slots
    const overlapping = slots.find(slot => {
      if (selectedSlot && slot.id === selectedSlot.id) return false;
      
      const existingStart = slot.start_time;
      const existingEnd = slot.end_time;
      const newStart = formData.start_time;
      const newEnd = formData.end_time;
      
      return (newStart >= existingStart && newStart < existingEnd) ||
             (newEnd > existingStart && newEnd <= existingEnd) ||
             (newStart <= existingStart && newEnd >= existingEnd);
    });
    
    if (overlapping) {
      newErrors.start_time = `Time overlaps with "${overlapping.name}" (${overlapping.start_time} - ${overlapping.end_time})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSlot = () => {
    if (!validateForm()) return;

    if (view === 'edit' && selectedSlot) {
      // Update existing slot
      setSlots(prev => prev.map(s => 
        s.id === selectedSlot.id 
          ? { 
              ...s, 
              name: formData.name,
              start_time: formData.start_time,
              end_time: formData.end_time,
              is_break: formData.is_break,
              updated_at: new Date().toISOString()
            }
          : s
      ));
    } else {
      // Add new slot
      const newOrderIndex = slots.length + 1;
      const newSlot = {
        id: Date.now(),
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        order_index: newOrderIndex,
        is_break: formData.is_break,
        created_at: new Date().toISOString()
      };
      setSlots(prev => [...prev, newSlot]);
    }
    
    resetForm();
    setView('list');
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      name: slot.name,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_break: slot.is_break
    });
    setView('edit');
  };

  const handleDeleteSlot = (slot) => {
    if (window.confirm(`Delete "${slot.name}"?`)) {
      const remainingSlots = slots.filter(s => s.id !== slot.id);
      // Reorder remaining slots
      const reorderedSlots = remainingSlots.map((s, idx) => ({ ...s, order_index: idx + 1 }));
      setSlots(reorderedSlots);
    }
  };

  const moveSlot = (slot, direction) => {
    const currentIndex = slots.findIndex(s => s.id === slot.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= slots.length) return;
    
    const newSlots = [...slots];
    [newSlots[currentIndex], newSlots[newIndex]] = [newSlots[newIndex], newSlots[currentIndex]];
    newSlots.forEach((s, idx) => { s.order_index = idx + 1; });
    setSlots(newSlots);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      is_break: false
    });
    setErrors({});
    setSelectedSlot(null);
  };

  // Render List View
  if (view === 'list') {
    return (
      <div className="time-slots-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              <Clock size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Time Slots
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define school periods and break times</p>
          </div>
          <button className="button" onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={16} /> Add Time Slot
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {slots.sort((a, b) => a.order_index - b.order_index).map(slot => (
            <div key={slot.id} className={`slot-card ${slot.is_break ? 'break' : ''}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 'bold' }}>{slot.name}</h3>
                  {slot.is_break && (
                    <span className="status-badge status-active">
                      <Coffee size={12} /> Break
                    </span>
                  )}
                  <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
                    {slot.start_time} → {slot.end_time}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    Order: {slot.order_index}
                  </span>
                </div>
              </div>
              <div className="action-buttons">
                <div className="move-buttons">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => moveSlot(slot, 'up')}
                    disabled={slot.order_index === 1}
                    style={{ opacity: slot.order_index === 1 ? 0.5 : 1 }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => moveSlot(slot, 'down')}
                    disabled={slot.order_index === slots.length}
                    style={{ opacity: slot.order_index === slots.length ? 0.5 : 1 }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <button className="action-btn edit-btn" onClick={() => handleEditSlot(slot)}>
                  <Edit size={16} />
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDeleteSlot(slot)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="time-slots-container">
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
            <ArrowLeft size={16} /> Back to Time Slots
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add Time Slot' : `Edit: ${selectedSlot?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Define a new time slot' : 'Update time slot information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSlot(); }}>
          <div className="form-section">
            <h2>Time Slot Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Slot Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Period 1, Break, Lunch"
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Descriptive name for this time slot
                </small>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Start Time <span className="required">*</span></label>
                <input
                  type="time"
                  name="start_time"
                  className={`form-input ${errors.start_time ? 'error' : ''}`}
                  value={formData.start_time}
                  onChange={handleInputChange}
                  step="60"
                />
                {errors.start_time && <span className="error-message">{errors.start_time}</span>}
              </div>

              <div className="form-group">
                <label>End Time <span className="required">*</span></label>
                <input
                  type="time"
                  name="end_time"
                  className={`form-input ${errors.end_time ? 'error' : ''}`}
                  value={formData.end_time}
                  onChange={handleInputChange}
                  step="60"
                />
                {errors.end_time && <span className="error-message">{errors.end_time}</span>}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_break"
                    checked={formData.is_break}
                    onChange={handleInputChange}
                  />
                  This is a break period
                </label>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Break periods are highlighted differently in the schedule
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
              Cancel
            </button>
            <button type="submit" className="button">
              <Save size={16} />
              {view === 'create' ? 'Create Time Slot' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TimeSlots;