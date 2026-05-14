// import { useState } from 'react';
// import { Users, Save, X, CheckCircle, XCircle, Award, Calendar, BookOpen, UserCheck } from 'lucide-react';
// import '../../../styles/teacher-qualifications.css';

// function TeacherQualifications() {
//   const [selectedTeacher, setSelectedTeacher] = useState('Mr. John Doe');
//   const [qualifications, setQualifications] = useState({
//     'Mr. John Doe': {
//       'Mathematics': { qualified: true, level: "Master's", certifiedSince: '2015-08-15' },
//       'English Language': { qualified: true, level: "Bachelor's", certifiedSince: '2015-08-15' },
//       'Physics': { qualified: false, level: '', certifiedSince: '' },
//       'Chemistry': { qualified: false, level: '', certifiedSince: '' },
//       'Biology': { qualified: true, level: "Master's", certifiedSince: '2016-06-20' }
//     },
//     'Mrs. Jane Smith': {
//       'Mathematics': { qualified: false, level: '', certifiedSince: '' },
//       'English Language': { qualified: true, level: "Master's", certifiedSince: '2014-09-10' },
//       'Literature': { qualified: true, level: "Master's", certifiedSince: '2014-09-10' }
//     }
//   });

//   const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson', 'Mr. Michael Brown'];
//   const allSubjects = ['Mathematics', 'English Language', 'Social Studies', 'Science', 'Biology', 'Chemistry', 'Physics', 'Literature', 'Economics', 'History', 'Geography', 'Accounting'];

//   const [formData, setFormData] = useState({ level: "Bachelor's", certifiedSince: '' });

//   const handleQualificationToggle = (subject) => {
//     setQualifications(prev => ({
//       ...prev,
//       [selectedTeacher]: {
//         ...prev[selectedTeacher],
//         [subject]: {
//           ...prev[selectedTeacher][subject],
//           qualified: !prev[selectedTeacher][subject]?.qualified
//         }
//       }
//     }));
//   };

//   const handleQualificationLevelChange = (subject, field, value) => {
//     setQualifications(prev => ({
//       ...prev,
//       [selectedTeacher]: {
//         ...prev[selectedTeacher],
//         [subject]: {
//           ...prev[selectedTeacher][subject],
//           [field]: value
//         }
//       }
//     }));
//   };

//   const handleSave = () => {
//     console.log('Saved qualifications for', selectedTeacher, qualifications[selectedTeacher]);
//     alert(`Qualifications for ${selectedTeacher} saved successfully!`);
//   };

//   const currentQualifications = qualifications[selectedTeacher] || {};

//   return (
//     <div className="teacher-qualifications-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Teacher Qualifications</h1>
//         <p style={{ color: 'var(--secondary)' }}>Track which teachers are qualified to teach which subjects</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
//         <label style={{ fontWeight: '500' }}>Select Teacher:</label>
//         <select className="filter-select" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
//           {teachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
//         </select>
//       </div>

//       <div className="card">
//         <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Subject Qualifications for {selectedTeacher}</h3>
//         <div className="qualification-grid">
//           {allSubjects.map(subject => {
//             const qual = currentQualifications[subject] || { qualified: false, level: '', certifiedSince: '' };
//             return (
//               <div key={subject} className={`qualification-card ${qual.qualified ? 'qualified' : ''}`}>
//                 <div className="qualification-header">
//                   <strong>{subject}</strong>
//                   <button className="action-btn" onClick={() => handleQualificationToggle(subject)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
//                     {qual.qualified ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
//                   </button>
//                 </div>
//                 {qual.qualified && (<div style={{ marginTop: '0.5rem' }}>
//                   <select className="form-select" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} value={qual.level} onChange={(e) => handleQualificationLevelChange(subject, 'level', e.target.value)}>
//                     <option value="">Select Level</option><option value="Bachelor's">Bachelor's Degree</option><option value="Master's">Master's Degree</option><option value="PhD">PhD/Doctorate</option><option value="Diploma">Professional Diploma</option><option value="Certification">Certification</option>
//                   </select>
//                   <input type="date" className="form-input" style={{ fontSize: '0.75rem' }} value={qual.certifiedSince} onChange={(e) => handleQualificationLevelChange(subject, 'certifiedSince', e.target.value)} placeholder="Certified Since" />
//                 </div>)}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="card" style={{ marginTop: '1rem' }}>
//         <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Teacher × Subject Qualification Matrix</h3>
//         <div className="matrix-view">
//           <table className="matrix-table"><thead><tr><th>Teacher</th>{allSubjects.slice(0, 6).map(s => <th key={s}>{s}</th>)}</tr></thead>
//             <tbody>{teachers.slice(0, 4).map(teacher => (<tr key={teacher}><td><strong>{teacher}</strong></td>{allSubjects.slice(0, 6).map(subject => (<td key={subject} style={{ textAlign: 'center' }}>{qualifications[teacher]?.[subject]?.qualified ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</td>))}</tr>))}</tbody>
//           </table>
//         </div>
//       </div>

//       <div className="form-actions" style={{ marginTop: '1.5rem' }}>
//         <button className="button save-btn" onClick={handleSave}><Save size={16} /> Save Qualifications</button>
//       </div>
//     </div>
//   );
// }

// export default TeacherQualifications;



// src/components/Staff/TeacherQualifications.jsx

import { useState, useEffect } from 'react';
import { 
  Users, 
  Save, 
  X, 
  CheckCircle, 
  XCircle, 
  Loader,
  AlertCircle
} from 'lucide-react';
import '../../../styles/teacher-qualifications.css';
import { teacherQualificationService } from '../../../services/teacherQualificationService';

function TeacherQualifications() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [qualifications, setQualifications] = useState({});
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const qualificationLevels = [
    { value: "Bachelor's", label: "Bachelor's Degree" },
    { value: "Master's", label: "Master's Degree" },
    { value: "PhD", label: "PhD/Doctorate" },
    { value: "Diploma", label: "Professional Diploma" },
    { value: "Certification", label: "Certification" }
  ];

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [teachersData, subjectsData, matrixData] = await Promise.all([
        teacherQualificationService.getTeachers(),
        teacherQualificationService.getSubjects(),
        teacherQualificationService.getMatrix()
      ]);
      
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setMatrixData(matrixData);
      
      // Set default selected teacher
      if (teachersData.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(teachersData[0].id);
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherQualifications = async (teacherId) => {
    try {
      const data = await teacherQualificationService.getByTeacher(teacherId);
      const qualMap = {};
      data.subjects.forEach(subject => {
        if (subject.is_qualified) {
          qualMap[subject.subject_id] = {
            qualified: true,
            level: subject.qualification_level || '',
            certifiedSince: subject.certified_since || ''
          };
        } else {
          qualMap[subject.subject_id] = {
            qualified: false,
            level: '',
            certifiedSince: ''
          };
        }
      });
      setQualifications(qualMap);
    } catch (error) {
      showAlert('Failed to load teacher qualifications: ' + error.message, 'error');
    }
  };

  // Load qualifications when selected teacher changes
  useEffect(() => {
    if (selectedTeacherId) {
      loadTeacherQualifications(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleQualificationToggle = (subjectId) => {
    setQualifications(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        qualified: !prev[subjectId]?.qualified
      }
    }));
  };

  const handleQualificationLevelChange = (subjectId, field, value) => {
    setQualifications(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const qualificationsToSave = Object.entries(qualifications)
        .filter(([_, qual]) => qual.qualified)
        .map(([subjectId, qual]) => ({
          subject_id: parseInt(subjectId),
          qualified: true,
          qualification_level: qual.level,
          certified_since: qual.certifiedSince
        }));
      
      await teacherQualificationService.bulkUpdate(selectedTeacherId, qualificationsToSave);
      showAlert(`Qualifications for ${teachers.find(t => t.id === selectedTeacherId)?.name} saved successfully!`, 'success');
      
      // Refresh matrix data
      const newMatrixData = await teacherQualificationService.getMatrix();
      setMatrixData(newMatrixData);
      
    } catch (error) {
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Selected Teacher';
  };

  if (loading) {
    return (
      <div className="teacher-qualifications-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading teacher qualifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-qualifications-container">
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
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Teacher Qualifications
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Track which teachers are qualified to teach which subjects</p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: '500' }}>Select Teacher:</label>
        <select 
          className="filter-select" 
          value={selectedTeacherId || ''} 
          onChange={(e) => setSelectedTeacherId(parseInt(e.target.value))}
          disabled={saving}
        >
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
          Subject Qualifications for {getTeacherName(selectedTeacherId)}
        </h3>
        <div className="qualification-grid">
          {subjects.map(subject => {
            const qual = qualifications[subject.id] || { qualified: false, level: '', certifiedSince: '' };
            return (
              <div key={subject.id} className={`qualification-card ${qual.qualified ? 'qualified' : ''}`}>
                <div className="qualification-header">
                  <strong>{subject.name}</strong>
                  <button 
                    className="action-btn" 
                    onClick={() => handleQualificationToggle(subject.id)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    disabled={saving}
                  >
                    {qual.qualified ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                  </button>
                </div>
                {qual.qualified && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <select 
                      className="form-select" 
                      style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} 
                      value={qual.level} 
                      onChange={(e) => handleQualificationLevelChange(subject.id, 'level', e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Select Level</option>
                      {qualificationLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <input 
                      type="date" 
                      className="form-input" 
                      style={{ fontSize: '0.75rem' }} 
                      value={qual.certifiedSince} 
                      onChange={(e) => handleQualificationLevelChange(subject.id, 'certifiedSince', e.target.value)}
                      placeholder="Certified Since"
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {matrixData && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Teacher × Subject Qualification Matrix</h3>
          <div className="matrix-view" style={{ overflowX: 'auto' }}>
            <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Teacher</th>
                  {matrixData.subjects.slice(0, 8).map(s => (
                    <th key={s.id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.teachers.slice(0, 5).map(teacher => (
                  <tr key={teacher.id}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>{teacher.name}</td>
                    {matrixData.subjects.slice(0, 8).map(subject => {
                      const teacherRow = matrixData.matrix.find(m => m.staff_id === teacher.id);
                      const subjectQual = teacherRow?.subjects.find(s => s.subject_id === subject.id);
                      return (
                        <td key={subject.id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                          {subjectQual?.is_qualified ? (
                            <CheckCircle size={16} color="#10b981" />
                          ) : (
                            <XCircle size={16} color="#ef4444" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="button save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Qualifications'}
        </button>
      </div>
    </div>
  );
}

export default TeacherQualifications;