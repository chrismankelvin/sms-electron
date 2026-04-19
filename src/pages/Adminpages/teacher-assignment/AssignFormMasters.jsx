import { useState } from 'react';
import { UserCheck, Edit, X, Users } from 'lucide-react';
import '../../../styles/assign-form-masters.css';

function AssignFormMasters() {
  const [assignments, setAssignments] = useState([
    { id: 1, academicYear: '2024-2025', class: 'JHS 1 Science', formMaster: 'Mr. John Doe', previousFormMaster: 'Mrs. Jane Smith' },
    { id: 2, academicYear: '2024-2025', class: 'JHS 2 Science', formMaster: 'Mrs. Jane Smith', previousFormMaster: 'Mr. John Doe' },
    { id: 3, academicYear: '2024-2025', class: 'SHS 1 Science', formMaster: '', previousFormMaster: '' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson'];

  const handleAssign = () => {
    if (!selectedTeacher) {
      alert('Please select a teacher');
      return;
    }

    setAssignments(prev => prev.map(a => 
      a.id === selectedAssignment.id 
        ? { ...a, formMaster: selectedTeacher, previousFormMaster: a.formMaster } 
        : a
    ));
    setShowModal(false);
    setSelectedAssignment(null);
    setSelectedTeacher('');
  };

  return (
    <div className="form-master-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <UserCheck size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Assign Form Masters
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            Assign class teachers (form masters) to each class
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Academic Year</th>
              <th>Class</th>
              <th>Form Master</th>
              <th>Previous Form Master</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id}>
                <td>{a.academicYear}</td>
                <td><strong>{a.class}</strong></td>
                <td>
                  {a.formMaster ? (
                    <span className="status-badge status-active">{a.formMaster}</span>
                  ) : (
                    <span className="status-badge status-inactive">Not Assigned</span>
                  )}
                </td>
                <td>{a.previousFormMaster || '-'}</td>
                <td>
                  <button 
                    className="button button-secondary" 
                    onClick={() => { 
                      setSelectedAssignment(a); 
                      setSelectedTeacher(a.formMaster); 
                      setShowModal(true); 
                    }}
                  >
                    <Edit size={16} /> {a.formMaster ? 'Change' : 'Assign'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedAssignment.formMaster ? 'Change' : 'Assign'} Form Master - {selectedAssignment.class}
              </h2>
              <X className="modal-close" size={20} onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Teacher</label>
                <select 
                  className="form-select" 
                  value={selectedTeacher} 
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="button" onClick={handleAssign}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignFormMasters;