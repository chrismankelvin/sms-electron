import { useState } from 'react';
import { Building2, Plus, Edit, Trash2, X } from 'lucide-react';
import '../../../styles/rooms.css';

function Rooms() {
  const [rooms, setRooms] = useState([
    { id: 1, roomName: 'Room 101', capacity: 40, type: 'Classroom', building: 'Main Building', floor: '1st Floor' },
    { id: 2, roomName: 'Science Lab A', capacity: 30, type: 'Lab', building: 'Science Block', floor: 'Ground Floor' },
    { id: 3, roomName: 'Computer Lab', capacity: 25, type: 'Lab', building: 'ICT Center', floor: '1st Floor' },
    { id: 4, roomName: 'Assembly Hall', capacity: 500, type: 'Hall', building: 'Main Building', floor: '2nd Floor' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ roomName: '', capacity: '', type: 'Classroom', building: '', floor: '' });

  const roomTypes = ['Classroom', 'Lab', 'Hall', 'Office'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditRoom = () => {
    if (!formData.roomName || !formData.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...formData, capacity: parseInt(formData.capacity) } : r));
    } else {
      const newRoom = { id: Date.now(), ...formData, capacity: parseInt(formData.capacity) };
      setRooms(prev => [...prev, newRoom]);
    }
    setShowModal(false);
    setEditingRoom(null);
    setFormData({ roomName: '', capacity: '', type: 'Classroom', building: '', floor: '' });
  };

  const handleDeleteRoom = (room) => {
    if (window.confirm(`Delete ${room.roomName}?`)) {
      setRooms(prev => prev.filter(r => r.id !== room.id));
    }
  };

  return (
    <div className="rooms-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Building2 size={28} style={{ display: 'inline', marginRight: '12px' }} />Rooms</h1>
        <p style={{ color: 'var(--secondary)' }}>Manage physical classrooms and labs</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Room</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container">
        <table className="academic-years-table">
          <thead><tr><th>Room Name</th><th>Capacity</th><th>Type</th><th>Building</th><th>Floor</th><th>Actions</th></tr></thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td><strong>{room.roomName}</strong></td>
                <td>{room.capacity} students</td>
                <td><span className={`room-type room-type-${room.type.toLowerCase()}`}>{room.type}</span></td>
                <td>{room.building || '-'}</td>
                <td>{room.floor || '-'}</td>
                <td className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => { setEditingRoom(room); setFormData(room); setShowModal(true); }}><Edit size={16} /></button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteRoom(room)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingRoom(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingRoom(null); }} /></div>
            <div className="modal-body">
              <div className="form-group"><label>Room Name *</label><input type="text" name="roomName" className="form-input" value={formData.roomName} onChange={handleInputChange} placeholder="Room 101, Science Lab..." /></div>
              <div className="form-group"><label>Capacity *</label><input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Type</label><select name="type" className="form-select" value={formData.type} onChange={handleInputChange}>{roomTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Building</label><input type="text" name="building" className="form-input" value={formData.building} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Floor</label><input type="text" name="floor" className="form-input" value={formData.floor} onChange={handleInputChange} /></div>
            </div>
            <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingRoom(null); }}>Cancel</button><button className="button" onClick={handleAddEditRoom}>{editingRoom ? 'Save' : 'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;