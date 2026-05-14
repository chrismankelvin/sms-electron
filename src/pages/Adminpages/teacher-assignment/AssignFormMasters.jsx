// import { useState } from 'react';
// import { UserCheck, Edit, X, Users } from 'lucide-react';
// import '../../../styles/assign-form-masters.css';

// function AssignFormMasters() {
//   const [assignments, setAssignments] = useState([
//     { id: 1, academicYear: '2024-2025', class: 'JHS 1 Science', formMaster: 'Mr. John Doe', previousFormMaster: 'Mrs. Jane Smith' },
//     { id: 2, academicYear: '2024-2025', class: 'JHS 2 Science', formMaster: 'Mrs. Jane Smith', previousFormMaster: 'Mr. John Doe' },
//     { id: 3, academicYear: '2024-2025', class: 'SHS 1 Science', formMaster: '', previousFormMaster: '' }
//   ]);

//   const [showModal, setShowModal] = useState(false);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [selectedTeacher, setSelectedTeacher] = useState('');

//   const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson'];

//   const handleAssign = () => {
//     if (!selectedTeacher) {
//       alert('Please select a teacher');
//       return;
//     }

//     setAssignments(prev => prev.map(a => 
//       a.id === selectedAssignment.id 
//         ? { ...a, formMaster: selectedTeacher, previousFormMaster: a.formMaster } 
//         : a
//     ));
//     setShowModal(false);
//     setSelectedAssignment(null);
//     setSelectedTeacher('');
//   };

//   return (
//     <div className="form-master-container">
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: '1.5rem', 
//         flexWrap: 'wrap', 
//         gap: '1rem' 
//       }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <UserCheck size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Assign Form Masters
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>
//             Assign class teachers (form masters) to each class
//           </p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="table-container">
//         <table className="academic-years-table">
//           <thead>
//             <tr>
//               <th>Academic Year</th>
//               <th>Class</th>
//               <th>Form Master</th>
//               <th>Previous Form Master</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {assignments.map(a => (
//               <tr key={a.id}>
//                 <td>{a.academicYear}</td>
//                 <td><strong>{a.class}</strong></td>
//                 <td>
//                   {a.formMaster ? (
//                     <span className="status-badge status-active">{a.formMaster}</span>
//                   ) : (
//                     <span className="status-badge status-inactive">Not Assigned</span>
//                   )}
//                 </td>
//                 <td>{a.previousFormMaster || '-'}</td>
//                 <td>
//                   <button 
//                     className="button button-secondary" 
//                     onClick={() => { 
//                       setSelectedAssignment(a); 
//                       setSelectedTeacher(a.formMaster); 
//                       setShowModal(true); 
//                     }}
//                   >
//                     <Edit size={16} /> {a.formMaster ? 'Change' : 'Assign'}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedAssignment && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>
//                 {selectedAssignment.formMaster ? 'Change' : 'Assign'} Form Master - {selectedAssignment.class}
//               </h2>
//               <X className="modal-close" size={20} onClick={() => setShowModal(false)} />
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label>Select Teacher</label>
//                 <select 
//                   className="form-select" 
//                   value={selectedTeacher} 
//                   onChange={(e) => setSelectedTeacher(e.target.value)}
//                 >
//                   <option value="">Select Teacher</option>
//                   {teachers.map(t => (
//                     <option key={t} value={t}>{t}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="button button-secondary" onClick={() => setShowModal(false)}>
//                 Cancel
//               </button>
//               <button className="button" onClick={handleAssign}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AssignFormMasters;


// src/components/Academics/AssignFormMasters.jsx

import { useState, useEffect } from 'react';
import { UserCheck, Edit, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import '../../../styles/assign-form-masters.css';
import { formMasterService } from '../../../services/formMasterService';

function AssignFormMasters() {
  const [assignments, setAssignments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [selectedYearId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [assignmentsData, staffData, yearsData] = await Promise.all([
        formMasterService.getAssignments(selectedYearId || null),
        formMasterService.getAvailableFormMasters(),
        formMasterService.getAcademicYears()
      ]);
      
      setAssignments(assignmentsData);
      setStaff(staffData);
      setAcademicYears(yearsData);
      
      // Set default selected year if not set
      if (!selectedYearId && yearsData.length > 0) {
        const currentYear = yearsData.find(y => y.is_current);
        setSelectedYearId(currentYear?.id || yearsData[0].id);
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
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

  const handleAssign = async () => {
    if (!selectedTeacherId) {
      showAlert('Please select a teacher', 'error');
      return;
    }

    try {
      setSaving(true);
      await formMasterService.assignFormMaster(selectedAssignment.class_id, parseInt(selectedTeacherId));
      showAlert('Form master assigned successfully!', 'success');
      await loadData();
      setShowModal(false);
      setSelectedAssignment(null);
      setSelectedTeacherId('');
    } catch (error) {
      showAlert('Failed to assign: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignment) => {
    if (window.confirm(`Remove form master from ${assignment.class_name}?`)) {
      try {
        setSaving(true);
        await formMasterService.removeFormMaster(assignment.class_id);
        showAlert('Form master removed successfully!', 'success');
        await loadData();
      } catch (error) {
        showAlert('Failed to remove: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const getTeacherName = (staffId) => {
    const teacher = staff.find(s => s.id === staffId);
    return teacher ? teacher.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="form-master-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-master-container">
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

      <div className="form-master-header">
        <div className="header-title">
          <h1>
            <UserCheck size={28} />
            Assign Form Masters
          </h1>
          <p>Assign class teachers (form masters) to each class</p>
        </div>
      </div>
      <hr className="divider" />

      {/* Filter by Academic Year */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Academic Year</label>
          <select 
            className="form-select" 
            value={selectedYearId} 
            onChange={(e) => setSelectedYearId(e.target.value)}
          >
            <option value="">All Years</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year_label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="table-container">
        <table className="assignments-table">
          <thead>
            <tr>
              <th>Academic Year</th>
              <th>Class</th>
              <th>Form Master</th>
              <th>Staff Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map(a => (
                <tr key={a.id}>
                  <td>{a.academic_year_label}</td>
                  <td><strong>{a.class_name}</strong></td>
                  <td>
                    {a.form_master_id ? (
                      <span className="status-badge status-active">
                        {a.form_master_name}
                      </span>
                    ) : (
                      <span className="status-badge status-inactive">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td>{a.staff_number || '-'}</td>
                  <td className="action-buttons">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => { 
                        setSelectedAssignment(a); 
                        setSelectedTeacherId(a.form_master_id || ''); 
                        setShowModal(true); 
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    {a.form_master_id && (
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleRemove(a)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state-cell">
                  <div className="empty-state">
                    <UserCheck size={48} />
                    <p>No classes found for the selected filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {showModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedAssignment.form_master_id ? 'Change' : 'Assign'} Form Master
              </h2>
              <p>{selectedAssignment.class_name}</p>
              <X className="modal-close" size={20} onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Teacher</label>
                <select 
                  className="form-select" 
                  value={selectedTeacherId} 
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  disabled={saving}
                >
                  <option value="">Select Teacher</option>
                  {staff.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {selectedAssignment.form_master_id && (
                <div className="info-note">
                  Current form master: <strong>{selectedAssignment.form_master_name}</strong>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAssign}
                disabled={saving}
              >
                {saving ? <Loader size={16} className="spinner" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignFormMasters;