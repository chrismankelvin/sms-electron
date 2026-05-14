// import { useState } from 'react';
// import { Building2, Plus, Edit, Trash2, X } from 'lucide-react';
// import '../../../styles/rooms.css';

// function Rooms() {
//   const [rooms, setRooms] = useState([
//     { id: 1, roomName: 'Room 101', capacity: 40, type: 'Classroom', building: 'Main Building', floor: '1st Floor' },
//     { id: 2, roomName: 'Science Lab A', capacity: 30, type: 'Lab', building: 'Science Block', floor: 'Ground Floor' },
//     { id: 3, roomName: 'Computer Lab', capacity: 25, type: 'Lab', building: 'ICT Center', floor: '1st Floor' },
//     { id: 4, roomName: 'Assembly Hall', capacity: 500, type: 'Hall', building: 'Main Building', floor: '2nd Floor' }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [editingRoom, setEditingRoom] = useState(null);
//   const [formData, setFormData] = useState({ roomName: '', capacity: '', type: 'Classroom', building: '', floor: '' });

//   const roomTypes = ['Classroom', 'Lab', 'Hall', 'Office'];

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddEditRoom = () => {
//     if (!formData.roomName || !formData.capacity) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingRoom) {
//       setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...formData, capacity: parseInt(formData.capacity) } : r));
//     } else {
//       const newRoom = { id: Date.now(), ...formData, capacity: parseInt(formData.capacity) };
//       setRooms(prev => [...prev, newRoom]);
//     }
//     setShowModal(false);
//     setEditingRoom(null);
//     setFormData({ roomName: '', capacity: '', type: 'Classroom', building: '', floor: '' });
//   };

//   const handleDeleteRoom = (room) => {
//     if (window.confirm(`Delete ${room.roomName}?`)) {
//       setRooms(prev => prev.filter(r => r.id !== room.id));
//     }
//   };

//   return (
//     <div className="rooms-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Building2 size={28} style={{ display: 'inline', marginRight: '12px' }} />Rooms</h1>
//         <p style={{ color: 'var(--secondary)' }}>Manage physical classrooms and labs</p></div>
//         <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Room</button>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="table-container">
//         <table className="academic-years-table">
//           <thead><tr><th>Room Name</th><th>Capacity</th><th>Type</th><th>Building</th><th>Floor</th><th>Actions</th></tr></thead>
//           <tbody>
//             {rooms.map(room => (
//               <tr key={room.id}>
//                 <td><strong>{room.roomName}</strong></td>
//                 <td>{room.capacity} students</td>
//                 <td><span className={`room-type room-type-${room.type.toLowerCase()}`}>{room.type}</span></td>
//                 <td>{room.building || '-'}</td>
//                 <td>{room.floor || '-'}</td>
//                 <td className="action-buttons">
//                   <button className="action-btn edit-btn" onClick={() => { setEditingRoom(room); setFormData(room); setShowModal(true); }}><Edit size={16} /></button>
//                   <button className="action-btn delete-btn" onClick={() => handleDeleteRoom(room)}><Trash2 size={16} /></button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingRoom(null); }}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header"><h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingRoom(null); }} /></div>
//             <div className="modal-body">
//               <div className="form-group"><label>Room Name *</label><input type="text" name="roomName" className="form-input" value={formData.roomName} onChange={handleInputChange} placeholder="Room 101, Science Lab..." /></div>
//               <div className="form-group"><label>Capacity *</label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
//               <div className="form-group"><label>Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}>{roomTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
//               <div className="form-group"><label>Building</label><input type="text" name="building" className="form-input" value={formData.building} onChange={handleInputChange} /></div>
//               <div className="form-group"><label>Floor</label><input type="text" name="floor" className="form-input" value={formData.floor} onChange={handleInputChange} /></div>
//             </div>
//             <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingRoom(null); }}>Cancel</button><button className="button" onClick={handleAddEditRoom}>{editingRoom ? 'Save' : 'Add'}</button></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Rooms;













// src/components/Facilities/Rooms.jsx

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import '../../../styles/rooms.css';
import { roomService } from '../../../services/roomService';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState(['Classroom', 'Lab', 'Hall', 'Office']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({ 
    room_name: '', 
    capacity: '', 
    type: 'Classroom', 
    building: '', 
    floor: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAll();
      setRooms(data);
    } catch (error) {
      showAlert('Failed to load rooms: ' + error.message, 'error');
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
    if (!formData.room_name.trim()) newErrors.room_name = 'Room name is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    
    const capacity = parseInt(formData.capacity);
    if (capacity && (capacity < 1 || capacity > 1000)) {
      newErrors.capacity = 'Capacity must be between 1 and 1000';
    }
    
    if (!formData.type) newErrors.type = 'Room type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEditRoom = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const roomData = {
        room_name: formData.room_name.trim(),
        capacity: parseInt(formData.capacity),
        type: formData.type,
        building: formData.building || null,
        floor: formData.floor || null,
        description: formData.description || null,
        is_active: formData.is_active
      };

      if (editingRoom) {
        await roomService.update(editingRoom.id, roomData);
        showAlert('Room updated successfully!', 'success');
      } else {
        await roomService.create(roomData);
        showAlert('Room created successfully!', 'success');
      }
      
      await loadRooms();
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (window.confirm(`Delete ${room.room_name}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        await roomService.delete(room.id);
        showAlert(`${room.room_name} deleted successfully`, 'success');
        await loadRooms();
      } catch (error) {
        showAlert('Failed to delete: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      room_name: room.room_name,
      capacity: room.capacity.toString(),
      type: room.type,
      building: room.building || '',
      floor: room.floor || '',
      description: room.description || '',
      is_active: room.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      room_name: '', 
      capacity: '', 
      type: 'Classroom', 
      building: '', 
      floor: '',
      description: '',
      is_active: true
    });
    setErrors({});
    setEditingRoom(null);
  };

  const getTypeClass = (type) => {
    return `room-type room-type-${type.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="rooms-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-container">
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
            <Building2 size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Rooms
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Manage physical classrooms and labs</p>
        </div>
        <button 
          className="button" 
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={saving}
        >
          <Plus size={16} /> Add Room
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {rooms.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <p>No rooms defined yet</p>
          <button 
            className="button" 
            onClick={() => { resetForm(); setShowModal(true); }}
            disabled={saving}
          >
            <Plus size={16} />
            Add Your First Room
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td><strong>{room.room_name}</strong></td>
                  <td>{room.capacity} students</td>
                  <td>
                    <span className={getTypeClass(room.type)}>{room.type}</span>
                   </td>
                  <td>{room.building || '-'}</td>
                  <td>{room.floor || '-'}</td>
                  <td>
                    <span className={`status-badge ${room.is_active ? 'status-active' : 'status-inactive'}`}>
                      {room.is_active ? 'Active' : 'Inactive'}
                    </span>
                   </td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => openEditModal(room)}
                      disabled={saving}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteRoom(room)}
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); resetForm(); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Room Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="room_name"
                  className={`form-input ${errors.room_name ? 'error' : ''}`}
                  value={formData.room_name}
                  onChange={handleInputChange}
                  placeholder="Room 101, Science Lab..."
                  disabled={saving}
                />
                {errors.room_name && <span className="error-message">{errors.room_name}</span>}
              </div>

              <div className="form-group">
                <label>Capacity <span className="required">*</span></label>
                <input
                  type="number"
                  name="capacity"
                  className={`form-input ${errors.capacity ? 'error' : ''}`}
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum number of students"
                  min="1"
                  max="1000"
                  disabled={saving}
                />
                <small style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                  Maximum number of students the room can accommodate
                </small>
                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
              </div>

              <div className="form-group">
                <label>Room Type <span className="required">*</span></label>
                <select
                  name="type"
                  className={`form-select ${errors.type ? 'error' : ''}`}
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Building</label>
                <input
                  type="text"
                  name="building"
                  className="form-input"
                  value={formData.building}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Building, Science Block"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Floor</label>
                <input
                  type="text"
                  name="floor"
                  className="form-input"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="e.g., 1st Floor, Ground Floor"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of the room"
                  rows="3"
                  disabled={saving}
                />
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
                  Active (available for scheduling)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="button button-secondary" 
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="button" 
                onClick={handleAddEditRoom}
                disabled={saving}
              >
                {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
                {saving ? 'Saving...' : (editingRoom ? 'Save Changes' : 'Add Room')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;