import { useState } from 'react';
import { Users, Plus, Eye, Edit, UserX, Calendar, BookOpen, School, X, Trash2 } from 'lucide-react';
import '../../../styles/teaching-assistants.css';
import { useNavigate } from 'react-router-dom';

function TeachingAssistants() {
  const navigate = useNavigate();
   const handleNavigation = (path) => {
    navigate(path);
  };
  const [tas, setTas] = useState([
    { 
      id: 1, 
      taNumber: 'TA-001', 
      name: 'Michael Appiah', 
      college: 'University of Education', 
      course: 'B.Ed Mathematics', 
      currentLevel: '400', 
      menteeType: 'Student Teacher', 
      supervisingTeacher: 'Mr. John Doe', 
      status: 'Active', 
      authDate: '2024-01-15', 
      termDate: '' 
    },
    { 
      id: 2, 
      taNumber: 'TA-002', 
      name: 'Sarah Mensah', 
      college: 'University of Ghana', 
      course: 'B.Ed Science', 
      currentLevel: '300', 
      menteeType: 'National Service', 
      supervisingTeacher: 'Mrs. Jane Smith', 
      status: 'Active', 
      authDate: '2024-02-10', 
      termDate: '' 
    },
    { 
      id: 3, 
      taNumber: 'TA-003', 
      name: 'David Kwame', 
      college: 'Cape Coast Technical University', 
      course: 'Diploma in Education', 
      currentLevel: '200', 
      menteeType: 'Intern', 
      supervisingTeacher: 'Dr. James Wilson', 
      status: 'Completed', 
      authDate: '2023-09-01', 
      termDate: '2024-06-15' 
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTA, setSelectedTA] = useState(null);
  const [editingTA, setEditingTA] = useState(null);
  const [formData, setFormData] = useState({ 
    taNumber: '', 
    name: '', 
    college: '', 
    course: '', 
    currentLevel: '', 
    menteeType: '', 
    supervisingTeacher: '', 
    status: 'Active', 
    authDate: '', 
    termDate: '' 
  });

  const menteeTypes = ['Student Teacher', 'National Service', 'Intern', 'Volunteer'];
  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson'];
  const statuses = ['Active', 'Completed', 'Terminated'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditTA = () => {
    if (!formData.name || !formData.college) { 
      alert('Please fill in all required fields'); 
      return; 
    }
    
    if (editingTA) { 
      setTas(prev => prev.map(t => t.id === editingTA.id ? { ...t, ...formData } : t)); 
    } else { 
      const newTA = { 
        id: Date.now(), 
        ...formData, 
        taNumber: `TA-${String(tas.length + 1).padStart(3, '0')}` 
      }; 
      setTas(prev => [...prev, newTA]); 
    }
    
    setShowModal(false); 
    setEditingTA(null); 
    setFormData({ 
      taNumber: '', name: '', college: '', course: '', currentLevel: '', 
      menteeType: '', supervisingTeacher: '', status: 'Active', authDate: '', termDate: '' 
    });
  };

  const handleTerminate = (ta) => {
    if (window.confirm(`Are you sure you want to terminate ${ta.name}?`)) { 
      setTas(prev => prev.map(t => t.id === ta.id ? { 
        ...t, 
        status: 'Terminated', 
        termDate: new Date().toISOString().split('T')[0] 
      } : t)); 
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'completed': return 'status-inactive';
      case 'terminated': return 'status-withdrawn';
      default: return 'status-inactive';
    }
  };

  return (
    <div className="ta-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Teaching Assistants
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Manage TAs, student teachers, and national service personnel</p>
        </div>
        <button className="button" onClick={() => handleNavigation("/registration/teaching-assistants")}>
          <Plus size={16} /> Add Teaching Assistant
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Table */}
      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>TA #</th>
              <th>Name</th>
              <th>College/University</th>
              <th>Course</th>
              <th>Level</th>
              <th>Mentee Type</th>
              <th>Supervising Teacher</th>
              <th>Status</th>
              <th>Auth Date</th>
              <th>Term Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tas.map(ta => (
              <tr key={ta.id}>
                <td>{ta.taNumber}</td>
                <td><strong>{ta.name}</strong></td>
                <td>{ta.college}</td>
                <td>{ta.course}</td>
                <td>{ta.currentLevel}</td>
                <td><span className="mentee-type">{ta.menteeType}</span></td>
                <td>{ta.supervisingTeacher}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(ta.status)}`}>
                    {ta.status}
                  </span>
                </td>
                <td>{new Date(ta.authDate).toLocaleDateString()}</td>
                <td>{ta.termDate ? new Date(ta.termDate).toLocaleDateString() : '-'}</td>
                <td className="action-buttons">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => { 
                      setSelectedTA(ta); 
                      setShowDetailModal(true); 
                    }}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => { 
                      setEditingTA(ta); 
                      setFormData(ta); 
                      setShowModal(true); 
                    }}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  {ta.status === 'Active' && (
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleTerminate(ta)}
                      title="Terminate"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTA(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTA ? 'Edit Teaching Assistant' : 'Add New Teaching Assistant'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingTA(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>College/University <span className="required">*</span></label>
                <input type="text" name="college" className="form-input" value={formData.college} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Course of Study</label>
                <input type="text" name="course" className="form-input" value={formData.course} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Current Level</label>
                <input type="text" name="currentLevel" className="form-input" value={formData.currentLevel} onChange={handleInputChange} placeholder="100, 200, 300, 400" />
              </div>
              <div className="form-group">
                <label>Mentee Type</label>
                <select name="menteeType" className="form-select" value={formData.menteeType} onChange={handleInputChange}>
                  <option value="">Select Mentee Type</option>
                  {menteeTypes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Supervising Teacher</label>
                <select name="supervisingTeacher" className="form-select" value={formData.supervisingTeacher} onChange={handleInputChange}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date of Authorization</label>
                <input type="date" name="authDate" className="form-input" value={formData.authDate} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {editingTA && (
                <div className="form-group">
                  <label>Termination Date</label>
                  <input type="date" name="termDate" className="form-input" value={formData.termDate} onChange={handleInputChange} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingTA(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditTA}>
                {editingTA ? 'Save Changes' : 'Add Teaching Assistant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTA && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>TA Details: {selectedTA.name}</h2>
              <X className="modal-close" size={20} onClick={() => setShowDetailModal(false)} />
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div><strong>TA Number:</strong> {selectedTA.taNumber}</div>
                <div><strong>Name:</strong> {selectedTA.name}</div>
                <div><strong>College:</strong> {selectedTA.college}</div>
                <div><strong>Course:</strong> {selectedTA.course}</div>
                <div><strong>Current Level:</strong> {selectedTA.currentLevel}</div>
                <div><strong>Mentee Type:</strong> {selectedTA.menteeType}</div>
                <div><strong>Supervising Teacher:</strong> {selectedTA.supervisingTeacher}</div>
                <div><strong>Status:</strong> {selectedTA.status}</div>
                <div><strong>Authorization Date:</strong> {new Date(selectedTA.authDate).toLocaleDateString()}</div>
                <div><strong>Termination Date:</strong> {selectedTA.termDate ? new Date(selectedTA.termDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingAssistants;