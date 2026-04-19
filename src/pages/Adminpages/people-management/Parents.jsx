import { useState } from 'react';
import { Users, Plus, Eye, Edit, Link, MessageSquare, Mail, Phone, MapPin, X, UserPlus } from 'lucide-react';
import '../../../styles/parents.css';

function Parents() {
  const [parents, setParents] = useState([
    { id: 1, name: 'Mr. & Mrs. Johnson', phone: '+233 20 123 4567', email: 'johnson@email.com', linkedStudents: [{ id: 1, name: 'Alice Johnson', class: 'JHS 1 Science', relationship: 'Father' }], loginStatus: true },
    { id: 2, name: 'Mrs. Smith', phone: '+233 20 123 4568', email: 'smith@email.com', linkedStudents: [{ id: 2, name: 'Bob Smith', class: 'JHS 1 Science', relationship: 'Mother' }], loginStatus: false }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const communications = [
    { date: '2024-03-01', type: 'Email', subject: 'PTA Meeting Reminder', status: 'Sent' },
    { date: '2024-02-25', type: 'SMS', subject: 'Fee Payment Due', status: 'Delivered' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditParent = () => {
    if (!formData.name || !formData.phone) { 
      alert('Please fill in required fields'); 
      return; 
    }
    if (editingParent) { 
      setParents(prev => prev.map(p => p.id === editingParent.id ? { ...p, ...formData } : p)); 
    } else { 
      const newParent = { id: Date.now(), ...formData, linkedStudents: [], loginStatus: false }; 
      setParents(prev => [...prev, newParent]); 
    }
    setShowModal(false); 
    setEditingParent(null); 
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  const handleSendMessage = (parent) => {
    alert(`Message composer opened for ${parent.name}`);
  };

  return (
    <div className="parents-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Parents/Guardians
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Manage parent/guardian records and link to students</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Parent
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Linked Student(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.map(parent => (
              <tr key={parent.id}>
                <td>
                  <strong>{parent.name}</strong>
                </td>
                <td>{parent.phone}</td>
                <td>{parent.email}</td>
                <td>
                  {parent.linkedStudents.map(s => (
                    <span key={s.id} className="linked-student">{s.name} ({s.relationship})</span>
                  ))}
                </td>
                <td className="action-buttons">
                  <button className="action-btn edit-btn" onClick={() => { setSelectedParent(parent); setShowDetailModal(true); }}>
                    <Eye size={16} />
                  </button>
                  <button className="action-btn edit-btn" onClick={() => { setEditingParent(parent); setFormData(parent); setShowModal(true); }}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn set-current-btn" onClick={() => { setSelectedParent(parent); setShowLinkModal(true); }}>
                    <Link size={16} />
                  </button>
                  <button className="action-btn archive-btn" onClick={() => handleSendMessage(parent)}>
                    <MessageSquare size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedParent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedParent.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} />
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <h3>Personal Information</h3>
                <div><strong>Phone:</strong> {selectedParent.phone}</div>
                <div><strong>Email:</strong> {selectedParent.email}</div>
                <div><strong>Login Status:</strong> {selectedParent.loginStatus ? 'Active' : 'Inactive'}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3>Children</h3>
                {selectedParent.linkedStudents.map(s => (
                  <div key={s.id} className="student-item">
                    <span><strong>{s.name}</strong> - {s.class}</span>
                    <span>{s.relationship}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3>Communication History</h3>
                <div className="communication-log">
                  {communications.map((c, i) => (
                    <div key={i} className="communication-item">
                      <div><strong>{c.type}</strong> - {c.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{c.date} • Status: {c.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingParent(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingParent ? 'Edit Parent' : 'Add Parent/Guardian'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingParent(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" className="form-textarea" value={formData.address} onChange={handleInputChange} rows="2"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingParent(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditParent}>
                {editingParent ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link to Student Modal */}
      {showLinkModal && selectedParent && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Link Student to {selectedParent.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowLinkModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Student</label>
                <select className="form-select">
                  <option>Alice Johnson - JHS 1 Science</option>
                  <option>Bob Smith - JHS 1 Science</option>
                </select>
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select className="form-select">
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button" onClick={() => setShowLinkModal(false)}>Link Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Parents;