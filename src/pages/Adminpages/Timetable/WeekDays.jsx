// // import { useState } from 'react';
// // import { Calendar, Edit, ChevronUp, ChevronDown, Power, X } from 'lucide-react';
// // import '../../../styles/week-days.css';

// // function WeekDays() {
// //   const [days, setDays] = useState([
// //     { id: 1, dayName: 'Monday', orderIndex: 1, isActive: true },
// //     { id: 2, dayName: 'Tuesday', orderIndex: 2, isActive: true },
// //     { id: 3, dayName: 'Wednesday', orderIndex: 3, isActive: true },
// //     { id: 4, dayName: 'Thursday', orderIndex: 4, isActive: true },
// //     { id: 5, dayName: 'Friday', orderIndex: 5, isActive: true },
// //     { id: 6, dayName: 'Saturday', orderIndex: 6, isActive: false }
// //   ]);

// //   const [showModal, setShowModal] = useState(false);
// //   const [editingDay, setEditingDay] = useState(null);
// //   const [formData, setFormData] = useState({ dayName: '', orderIndex: '' });

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleAddEditDay = () => {
// //     if (!formData.dayName) {
// //       alert('Please fill in all required fields');
// //       return;
// //     }

// //     if (editingDay) {
// //       setDays(prev => prev.map(d => d.id === editingDay.id ? { ...d, ...formData, orderIndex: parseInt(formData.orderIndex) } : d));
// //     }
// //     setShowModal(false);
// //     setEditingDay(null);
// //     setFormData({ dayName: '', orderIndex: '' });
// //   };

// //   const toggleActive = (day) => {
// //     setDays(prev => prev.map(d => d.id === day.id ? { ...d, isActive: !d.isActive } : d));
// //   };

// //   const moveDay = (day, direction) => {
// //     const activeDays = days.filter(d => d.isActive);
// //     const currentIndex = activeDays.findIndex(d => d.id === day.id);
// //     const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
// //     if (newIndex < 0 || newIndex >= activeDays.length) return;
    
// //     const newDays = [...days];
// //     const currentPos = newDays.findIndex(d => d.id === day.id);
// //     const targetPos = newDays.findIndex(d => d.id === activeDays[newIndex].id);
// //     [newDays[currentPos], newDays[targetPos]] = [newDays[targetPos], newDays[currentPos]];
// //     newDays.forEach((d, idx) => { d.orderIndex = idx + 1; });
// //     setDays(newDays);
// //   };

// //   return (
// //     <div className="week-days-container">
// //       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
// //         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />Week Days</h1>
// //         <p style={{ color: 'var(--secondary)' }}>Define school days and their order</p></div>
// //       </div>
// //       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

// //       <div style={{ display: 'grid', gap: '0.75rem' }}>
// //         {days.sort((a, b) => a.orderIndex - b.orderIndex).map(day => (
// //           <div key={day.id} className={`day-card ${!day.isActive ? 'inactive' : ''}`}>
// //             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
// //               <div className="day-order">{day.orderIndex}</div>
// //               <div><h3 style={{ fontWeight: 'bold' }}>{day.dayName}</h3></div>
// //             </div>
// //             <div className="action-buttons">
// //               {day.isActive && (
// //                 <>
// //                   <button className="action-btn edit-btn" onClick={() => moveDay(day, 'up')}><ChevronUp size={16} /></button>
// //                   <button className="action-btn edit-btn" onClick={() => moveDay(day, 'down')}><ChevronDown size={16} /></button>
// //                 </>
// //               )}
// //               <button className="action-btn edit-btn" onClick={() => { setEditingDay(day); setFormData({ dayName: day.dayName, orderIndex: day.orderIndex }); setShowModal(true); }}><Edit size={16} /></button>
// //               <button className={`action-btn ${day.isActive ? 'delete-btn' : 'set-current-btn'}`} onClick={() => toggleActive(day)}><Power size={16} /> {day.isActive ? 'Deactivate' : 'Activate'}</button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {showModal && (
// //         <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingDay(null); }}>
// //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// //             <div className="modal-header"><h2>Edit Day</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingDay(null); }} /></div>
// //             <div className="modal-body">
// //               <div className="form-group"><label>Day Name *</label><input type="text" name="dayName" className="form-input" value={formData.dayName} onChange={handleInputChange} /></div>
// //               <div className="form-group"><label>Order Index</label><input type="number" name="orderIndex" className="form-input" value={formData.orderIndex} onChange={handleInputChange} /></div>
// //             </div>
// //             <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingDay(null); }}>Cancel</button><button className="button" onClick={handleAddEditDay}>Save</button></div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default WeekDays;







// // src/components/Academics/WeekDays.jsx
// import { useState } from 'react';
// import { Calendar, Edit, ChevronUp, ChevronDown, Power, X, ArrowLeft, Save, Plus } from 'lucide-react';
// import '../../../styles/week-days.css';

// function WeekDays() {
//   const [days, setDays] = useState([
//     { id: 1, name: 'Monday', order_index: 1, is_active: true },
//     { id: 2, name: 'Tuesday', order_index: 2, is_active: true },
//     { id: 3, name: 'Wednesday', order_index: 3, is_active: true },
//     { id: 4, name: 'Thursday', order_index: 4, is_active: true },
//     { id: 5, name: 'Friday', order_index: 5, is_active: true },
//     { id: 6, name: 'Saturday', order_index: 6, is_active: false },
//     { id: 7, name: 'Sunday', order_index: 7, is_active: false }
//   ]);

//   const [view, setView] = useState('list'); // 'list', 'create', 'edit'
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     order_index: '',
//     is_active: true
//   });
//   const [errors, setErrors] = useState({});

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: type === 'checkbox' ? checked : value 
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Day name is required';
    
//     // Check for duplicate name (UNIQUE constraint)
//     const existingName = days.find(d => 
//       d.name.toLowerCase() === formData.name.toLowerCase() &&
//       (!selectedDay || d.id !== selectedDay.id)
//     );
//     if (existingName) {
//       newErrors.name = `Day "${formData.name}" already exists`;
//     }
    
//     // Validate order index if provided
//     if (formData.order_index) {
//       const orderIndex = parseInt(formData.order_index);
//       if (orderIndex < 1 || orderIndex > 7) {
//         newErrors.order_index = 'Order index must be between 1 and 7';
//       }
      
//       // Check for duplicate order index
//       const existingOrder = days.find(d => 
//         d.order_index === orderIndex &&
//         (!selectedDay || d.id !== selectedDay.id)
//       );
//       if (existingOrder) {
//         newErrors.order_index = `Order index ${orderIndex} is already used by ${existingOrder.name}`;
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveDay = () => {
//     if (!validateForm()) return;

//     if (view === 'edit' && selectedDay) {
//       // Update existing day
//       setDays(prev => prev.map(d => 
//         d.id === selectedDay.id 
//           ? { 
//               ...d, 
//               name: formData.name,
//               order_index: formData.order_index ? parseInt(formData.order_index) : d.order_index,
//               is_active: formData.is_active
//             }
//           : d
//       ));
//     } else if (view === 'create') {
//       // Add new day
//       const newOrderIndex = formData.order_index ? parseInt(formData.order_index) : days.length + 1;
//       const newDay = {
//         id: Date.now(),
//         name: formData.name,
//         order_index: newOrderIndex,
//         is_active: formData.is_active
//       };
//       setDays(prev => [...prev, newDay]);
//     }
    
//     resetForm();
//     setView('list');
//   };

//   const handleEditDay = (day) => {
//     setSelectedDay(day);
//     setFormData({
//       name: day.name,
//       order_index: day.order_index.toString(),
//       is_active: day.is_active
//     });
//     setView('edit');
//   };

//   const handleDeleteDay = (day) => {
//     if (day.is_active) {
//       alert(`Cannot delete active day "${day.name}". Please deactivate it first.`);
//       return;
//     }
//     if (window.confirm(`Delete "${day.name}"?`)) {
//       const remainingDays = days.filter(d => d.id !== day.id);
//       // Reorder remaining days
//       const activeDays = remainingDays.filter(d => d.is_active);
//       const reorderedDays = remainingDays.map(d => {
//         if (d.is_active) {
//           const newIndex = activeDays.findIndex(ad => ad.id === d.id) + 1;
//           return { ...d, order_index: newIndex };
//         }
//         return d;
//       });
//       setDays(reorderedDays);
//     }
//   };

//   const toggleActive = (day) => {
//     setDays(prev => prev.map(d => {
//       if (d.id === day.id) {
//         return { ...d, is_active: !d.is_active };
//       }
//       return d;
//     }));
//   };

//   const moveDay = (day, direction) => {
//     const activeDays = days.filter(d => d.is_active).sort((a, b) => a.order_index - b.order_index);
//     const currentIndex = activeDays.findIndex(d => d.id === day.id);
//     const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
//     if (newIndex < 0 || newIndex >= activeDays.length) return;
    
//     const newDays = [...days];
//     const currentPos = newDays.findIndex(d => d.id === day.id);
//     const targetPos = newDays.findIndex(d => d.id === activeDays[newIndex].id);
//     [newDays[currentPos], newDays[targetPos]] = [newDays[targetPos], newDays[currentPos]];
    
//     // Update order indices
//     const updatedActiveDays = newDays.filter(d => d.is_active);
//     updatedActiveDays.forEach((d, idx) => {
//       const dayToUpdate = newDays.find(nd => nd.id === d.id);
//       if (dayToUpdate) dayToUpdate.order_index = idx + 1;
//     });
    
//     setDays(newDays);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       order_index: '',
//       is_active: true
//     });
//     setErrors({});
//     setSelectedDay(null);
//   };

//   // Render List View
//   if (view === 'list') {
//     return (
//       <div className="week-days-container">
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//           <div>
//             <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//               <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
//               Week Days
//             </h1>
//             <p style={{ color: 'var(--secondary)' }}>Define school days and their order</p>
//           </div>
//           <button className="button" onClick={() => { resetForm(); setView('create'); }}>
//             <Plus size={16} /> Add Day
//           </button>
//         </div>
//         <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//         <div style={{ display: 'grid', gap: '0.75rem' }}>
//           {days.sort((a, b) => a.order_index - b.order_index).map(day => (
//             <div key={day.id} className={`day-card ${!day.is_active ? 'inactive' : ''}`}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//                 <div className="day-order">{day.order_index}</div>
//                 <div>
//                   <h3 style={{ fontWeight: 'bold' }}>{day.name}</h3>
//                   {!day.is_active && (
//                     <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Inactive</span>
//                   )}
//                 </div>
//               </div>
//               <div className="action-buttons">
//                 {day.is_active && (
//                   <div className="move-buttons">
//                     <button 
//                       className="action-btn edit-btn" 
//                       onClick={() => moveDay(day, 'up')}
//                       disabled={day.order_index === 1}
//                       style={{ opacity: day.order_index === 1 ? 0.5 : 1 }}
//                     >
//                       <ChevronUp size={16} />
//                     </button>
//                     <button 
//                       className="action-btn edit-btn" 
//                       onClick={() => moveDay(day, 'down')}
//                       disabled={day.order_index === days.filter(d => d.is_active).length}
//                       style={{ opacity: day.order_index === days.filter(d => d.is_active).length ? 0.5 : 1 }}
//                     >
//                       <ChevronDown size={16} />
//                     </button>
//                   </div>
//                 )}
//                 <button className="action-btn edit-btn" onClick={() => handleEditDay(day)}>
//                   <Edit size={16} />
//                 </button>
//                 <button 
//                   className={`action-btn ${day.is_active ? 'delete-btn' : 'set-current-btn'}`} 
//                   onClick={() => toggleActive(day)}
//                 >
//                   <Power size={16} /> {day.is_active ? 'Deactivate' : 'Activate'}
//                 </button>
//                 {!day.is_active && (
//                   <button className="action-btn delete-btn" onClick={() => handleDeleteDay(day)}>
//                     <X size={16} />
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Render Create/Edit Form View
//   return (
//     <div className="week-days-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <div>
//           <button 
//             onClick={() => { resetForm(); setView('list'); }}
//             style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '0.5rem',
//               background: 'none',
//               border: 'none',
//               color: 'var(--primary)',
//               cursor: 'pointer',
//               fontSize: '0.875rem',
//               marginBottom: '0.5rem'
//             }}
//           >
//             <ArrowLeft size={16} /> Back to Week Days
//           </button>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             {view === 'create' ? 'Add New Day' : `Edit: ${selectedDay?.name}`}
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>
//             {view === 'create' ? 'Add a new day to the week' : 'Update day information'}
//           </p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
//         <form onSubmit={(e) => { e.preventDefault(); handleSaveDay(); }}>
//           <div className="form-section">
//             <h2>Day Details</h2>
//             <div className="form-grid">
//               <div className="form-group">
//                 <label>Day Name <span className="required">*</span></label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`form-input ${errors.name ? 'error' : ''}`}
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Monday, Tuesday"
//                 />
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
//                   Must be unique (Monday, Tuesday, etc.)
//                 </small>
//                 {errors.name && <span className="error-message">{errors.name}</span>}
//               </div>

//               <div className="form-group">
//                 <label>Order Index (Optional)</label>
//                 <input
//                   type="number"
//                   name="order_index"
//                   className={`form-input ${errors.order_index ? 'error' : ''}`}
//                   value={formData.order_index}
//                   onChange={handleInputChange}
//                   placeholder="1-7"
//                   min="1"
//                   max="7"
//                 />
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
//                   Position in the week (1-7). Leave empty to auto-assign
//                 </small>
//                 {errors.order_index && <span className="error-message">{errors.order_index}</span>}
//               </div>

//               <div className="form-group">
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
//                   <input
//                     type="checkbox"
//                     name="is_active"
//                     checked={formData.is_active}
//                     onChange={handleInputChange}
//                   />
//                   Active (school day)
//                 </label>
//                 <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
//                   Inactive days are excluded from the school schedule
//                 </small>
//               </div>
//             </div>
//           </div>

//           <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
//             <button type="button" className="button button-secondary" onClick={() => { resetForm(); setView('list'); }}>
//               Cancel
//             </button>
//             <button type="submit" className="button">
//               <Save size={16} />
//               {view === 'create' ? 'Create Day' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default WeekDays;












// src/components/Academics/WeekDays.jsx

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  Power, 
  X, 
  ArrowLeft, 
  Save, 
  Plus,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../../../styles/week-days.css';
import { weekDayService } from '../../../services/weekDayService';

function WeekDays() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [selectedDay, setSelectedDay] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    order_index: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadWeekDays();
  }, []);

  const loadWeekDays = async () => {
    try {
      setLoading(true);
      const data = await weekDayService.getAll();
      setDays(data);
    } catch (error) {
      showAlert('Failed to load week days: ' + error.message, 'error');
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
    if (!formData.name.trim()) newErrors.name = 'Day name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDay = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const dayData = {
        name: formData.name,
        order_index: formData.order_index ? parseInt(formData.order_index) : null,
        is_active: formData.is_active
      };

      if (view === 'edit' && selectedDay) {
        await weekDayService.update(selectedDay.id, dayData);
        showAlert('Week day updated successfully!', 'success');
      } else {
        await weekDayService.create(dayData);
        showAlert('Week day created successfully!', 'success');
      }
      
      await loadWeekDays();
      resetForm();
      setView('list');
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDay = (day) => {
    setSelectedDay(day);
    setFormData({
      name: day.name,
      order_index: day.order_index?.toString() || '',
      is_active: day.is_active
    });
    setView('edit');
  };

  const handleDeleteDay = async (day) => {
    if (day.is_active) {
      showAlert(`Cannot delete active day "${day.name}". Please deactivate it first.`, 'error');
      return;
    }
    
    if (window.confirm(`Delete "${day.name}"? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await weekDayService.delete(day.id);
        showAlert(`${day.name} deleted successfully`, 'success');
        await loadWeekDays();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleActive = async (day) => {
    try {
      setSaving(true);
      const result = await weekDayService.toggleActive(day.id);
      showAlert(`Day "${day.name}" has been ${result.is_active ? 'activated' : 'deactivated'}`, 'success');
      await loadWeekDays();
    } catch (error) {
      showAlert('Failed to toggle status: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveDay = async (day, direction) => {
    const activeDays = days.filter(d => d.is_active).sort((a, b) => a.order_index - b.order_index);
    const currentIndex = activeDays.findIndex(d => d.id === day.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= activeDays.length) return;
    
    const newOrder = [...activeDays];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    try {
      setSaving(true);
      await weekDayService.reorder(newOrder.map(d => d.id));
      await loadWeekDays();
      showAlert('Order updated successfully', 'success');
    } catch (error) {
      showAlert('Failed to reorder: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      order_index: '',
      is_active: true
    });
    setErrors({});
    setSelectedDay(null);
  };

  if (loading) {
    return (
      <div className="week-days-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading week days...</p>
        </div>
      </div>
    );
  }

  // Render List View
  if (view === 'list') {
    return (
      <div className="week-days-container">
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
              <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
              Week Days
            </h1>
            <p style={{ color: 'var(--secondary)' }}>Define school days and their order</p>
          </div>
          <button 
            className="button" 
            onClick={() => { resetForm(); setView('create'); }}
            disabled={saving}
          >
            <Plus size={16} /> Add Day
          </button>
        </div>
        <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

        {days.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No week days defined yet</p>
            <button 
              className="button" 
              onClick={() => { resetForm(); setView('create'); }}
              disabled={saving}
            >
              <Plus size={16} />
              Add Your First Day
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {days.sort((a, b) => {
              if (a.is_active && !b.is_active) return -1;
              if (!a.is_active && b.is_active) return 1;
              if (a.is_active && b.is_active) return (a.order_index || 0) - (b.order_index || 0);
              return 0;
            }).map(day => (
              <div key={day.id} className={`day-card ${!day.is_active ? 'inactive' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="day-order">{day.order_index || '-'}</div>
                  <div>
                    <h3 style={{ fontWeight: 'bold' }}>{day.name}</h3>
                    {!day.is_active && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Inactive</span>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  {day.is_active && (
                    <div className="move-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => moveDay(day, 'up')}
                        disabled={day.order_index === 1 || saving}
                        style={{ opacity: day.order_index === 1 ? 0.5 : 1 }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => moveDay(day, 'down')}
                        disabled={day.order_index === days.filter(d => d.is_active).length || saving}
                        style={{ opacity: day.order_index === days.filter(d => d.is_active).length ? 0.5 : 1 }}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => handleEditDay(day)}
                    disabled={saving}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className={`action-btn ${day.is_active ? 'delete-btn' : 'set-current-btn'}`} 
                    onClick={() => toggleActive(day)}
                    disabled={saving}
                  >
                    <Power size={16} /> {day.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  {!day.is_active && (
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteDay(day)}
                      disabled={saving}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Create/Edit Form View
  return (
    <div className="week-days-container">
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
            <ArrowLeft size={16} /> Back to Week Days
          </button>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            {view === 'create' ? 'Add New Day' : `Edit: ${selectedDay?.name}`}
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            {view === 'create' ? 'Add a new day to the week' : 'Update day information'}
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveDay(); }}>
          <div className="form-section">
            <h2>Day Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Day Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Monday, Tuesday"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Must be unique (Monday, Tuesday, etc.)
                </small>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Order Index (Optional)</label>
                <input
                  type="number"
                  name="order_index"
                  className={`form-input ${errors.order_index ? 'error' : ''}`}
                  value={formData.order_index}
                  onChange={handleInputChange}
                  placeholder="1-7"
                  min="1"
                  max="7"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Position in the week (1-7). Leave empty to auto-assign
                </small>
                {errors.order_index && <span className="error-message">{errors.order_index}</span>}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  Active (school day)
                </label>
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Inactive days are excluded from the school schedule
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
              {saving ? 'Saving...' : (view === 'create' ? 'Create Day' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WeekDays;