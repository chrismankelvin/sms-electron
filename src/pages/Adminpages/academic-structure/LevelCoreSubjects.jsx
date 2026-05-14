// // src/components/Academics/LevelCoreSubjects.jsx

// import { useState, useEffect } from 'react';
// import { Target, Save, X, CheckSquare, Square, Loader, CheckCircle, AlertCircle } from 'lucide-react';
// import '../../../styles/level-core-subjects.css';
// import { levelCoreSubjectService } from '../../../services/levelCoreSubjectService';

// function LevelCoreSubjects() {
//   const [levels, setLevels] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [selectedLevelId, setSelectedLevelId] = useState(null);
//   const [assignments, setAssignments] = useState({});
//   const [matrixData, setMatrixData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

//   // Load data on component mount
//   useEffect(() => {
//     loadAllData();
//   }, []);

//   const loadAllData = async () => {
//     try {
//       setLoading(true);
//       const [levelsData, subjectsData, matrixData] = await Promise.all([
//         levelCoreSubjectService.getLevels(),
//         levelCoreSubjectService.getSubjects(),
//         levelCoreSubjectService.getMatrix()
//       ]);
      
//       setLevels(levelsData);
//       setSubjects(subjectsData);
//       setMatrixData(matrixData);
      
//       // Set default selected level
//       if (levelsData.length > 0 && !selectedLevelId) {
//         setSelectedLevelId(levelsData[0].id);
//       }
//     } catch (error) {
//       showAlert('Failed to load data: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const handleToggleSubject = (subjectId) => {
//     setAssignments(prev => {
//       const currentSubjects = prev[selectedLevelId] || [];
//       if (currentSubjects.includes(subjectId)) {
//         return {
//           ...prev,
//           [selectedLevelId]: currentSubjects.filter(id => id !== subjectId)
//         };
//       } else {
//         return {
//           ...prev,
//           [selectedLevelId]: [...currentSubjects, subjectId]
//         };
//       }
//     });
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       const subjectIds = assignments[selectedLevelId] || [];
//       await levelCoreSubjectService.bulkUpdate(selectedLevelId, subjectIds);
//       showAlert(`Core subjects saved successfully!`, 'success');
//       await loadAllData(); // Refresh matrix view
//     } catch (error) {
//       showAlert('Failed to save: ' + error.message, 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const loadLevelSubjects = async (levelId) => {
//     try {
//       const data = await levelCoreSubjectService.getByLevel(levelId);
//       setAssignments(prev => ({
//         ...prev,
//         [levelId]: data.core_subject_ids
//       }));
//     } catch (error) {
//       console.error('Error loading level subjects:', error);
//       setAssignments(prev => ({
//         ...prev,
//         [levelId]: []
//       }));
//     }
//   };

//   // Load subjects for selected level when it changes
//   useEffect(() => {
//     if (selectedLevelId) {
//       loadLevelSubjects(selectedLevelId);
//     }
//   }, [selectedLevelId]);

//   const currentAssignments = assignments[selectedLevelId] || [];
  
//   // Filter core subjects only
//   const coreSubjects = subjects.filter(s => s.type === 'core');

//   if (loading) {
//     return (
//       <div className="level-core-container">
//         <div className="loading-container">
//           <Loader size={48} className="spinner" />
//           <p>Loading core subjects...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="level-core-container">
//       {/* Alert Messages */}
//       {alert.show && (
//         <div className={`alert-${alert.type}`}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alert.message}
//           </span>
//           <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
//             <X size={18} />
//           </span>
//         </div>
//       )}

//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <Target size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Level Core Subjects
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>Assign core subjects to specific academic levels</p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
//         <label style={{ fontWeight: '500' }}>Select Level:</label>
//         <select 
//           className="filter-select" 
//           value={selectedLevelId || ''} 
//           onChange={(e) => setSelectedLevelId(parseInt(e.target.value))}
//           disabled={saving}
//         >
//           {levels.map(level => (
//             <option key={level.id} value={level.id}>{level.name}</option>
//           ))}
//         </select>
//       </div>

//       <div className="card" style={{ marginBottom: '1.5rem' }}>
//         <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
//           Core Subjects for {levels.find(l => l.id === selectedLevelId)?.name || 'Selected Level'}
//         </h3>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
//           {coreSubjects.map(subject => (
//             <label 
//               key={subject.id} 
//               style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 gap: '0.5rem', 
//                 cursor: 'pointer', 
//                 padding: '0.5rem', 
//                 borderRadius: '0.375rem', 
//                 transition: 'background 0.2s' 
//               }} 
//               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg)'} 
//               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//             >
//               <input 
//                 type="checkbox" 
//                 checked={currentAssignments.includes(subject.id)} 
//                 onChange={() => handleToggleSubject(subject.id)}
//                 style={{ width: '18px', height: '18px', cursor: 'pointer' }}
//                 disabled={saving}
//               />
//               <span>{subject.name}</span>
//               {currentAssignments.includes(subject.id) && (
//                 <span className="status-badge status-active" style={{ marginLeft: 'auto' }}>Core</span>
//               )}
//             </label>
//           ))}
//         </div>
//       </div>

//       {matrixData && (
//         <div className="card">
//           <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Level × Subject Matrix View</h3>
//           <div className="subject-matrix" style={{ overflowX: 'auto' }}>
//             <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr>
//                   <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Level</th>
//                   {matrixData.subjects.map(s => (
//                     <th key={s.id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>{s.name}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {matrixData.matrix.map(row => (
//                   <tr key={row.level_id}>
//                     <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>{row.level_name}</td>
//                     {row.subjects.map(subject => (
//                       <td key={subject.subject_id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
//                         {subject.is_core ? (
//                           <CheckSquare size={18} color="#10b981" />
//                         ) : (
//                           <Square size={18} color="var(--secondary)" />
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       <div className="form-actions" style={{ marginTop: '1.5rem' }}>
//         <button className="button save-btn" onClick={handleSave} disabled={saving}>
//           {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
//           {saving ? 'Saving...' : 'Save Core Subjects'}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default LevelCoreSubjects;





// src/components/Academics/LevelCoreSubjects.jsx

import { useState, useEffect } from 'react';
import { Target, Save, X, CheckSquare, Square, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import '../../../styles/level-core-subjects.css';
import { levelCoreSubjectService } from '../../../services/levelCoreSubjectService';

function LevelCoreSubjects() {
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load levels and subjects first
      const [levelsData, subjectsData] = await Promise.all([
        levelCoreSubjectService.getLevels(),
        levelCoreSubjectService.getSubjects()
      ]);
      
      setLevels(levelsData);
      setSubjects(subjectsData);
      
      // Try to load matrix data, but don't fail if it's not available
      try {
        const matrixDataResult = await levelCoreSubjectService.getMatrix();
        setMatrixData(matrixDataResult);
      } catch (matrixError) {
        console.warn('Matrix data not available:', matrixError);
        // Build basic matrix from levels and subjects
        if (levelsData.length > 0 && subjectsData.length > 0) {
          setMatrixData({
            subjects: subjectsData,
            matrix: levelsData.map(level => ({
              level_id: level.id || level.level_id,
              level_name: level.name || level.level_name,
              subjects: subjectsData.map(subject => ({
                subject_id: subject.id,
                subject_name: subject.name,
                is_core: false
              }))
            }))
          });
        }
      }
      
      // Set default selected level
      if (levelsData.length > 0 && !selectedLevelId) {
        setSelectedLevelId(levelsData[0].id || levelsData[0].level_id);
      }
      
    } catch (error) {
      console.error('Load data error:', error);
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadAllData();
      if (selectedLevelId) {
        await loadLevelSubjects(selectedLevelId);
      }
      showAlert('Data refreshed successfully', 'success');
    } catch (error) {
      showAlert('Failed to refresh: ' + error.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleSubject = (subjectId) => {
    setAssignments(prev => {
      const currentSubjects = prev[selectedLevelId] || [];
      if (currentSubjects.includes(subjectId)) {
        return {
          ...prev,
          [selectedLevelId]: currentSubjects.filter(id => id !== subjectId)
        };
      } else {
        return {
          ...prev,
          [selectedLevelId]: [...currentSubjects, subjectId]
        };
      }
    });
  };

  const handleSave = async () => {
    if (!selectedLevelId) {
      showAlert('Please select a level first', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const subjectIds = assignments[selectedLevelId] || [];
      await levelCoreSubjectService.bulkUpdate(selectedLevelId, subjectIds);
      showAlert(`Core subjects saved successfully for ${getLevelName(selectedLevelId)}!`, 'success');
      await loadAllData(); // Refresh matrix view
      await loadLevelSubjects(selectedLevelId); // Refresh assignments
    } catch (error) {
      console.error('Save error:', error);
      showAlert('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const loadLevelSubjects = async (levelId) => {
    try {
      const data = await levelCoreSubjectService.getByLevel(levelId);
      // Handle different response structures
      const coreIds = data.core_subject_ids || 
                      (data.core_subjects?.map(s => s.id || s.subject_id)) || 
                      [];
      setAssignments(prev => ({
        ...prev,
        [levelId]: coreIds
      }));
    } catch (error) {
      console.error('Error loading level subjects:', error);
      setAssignments(prev => ({
        ...prev,
        [levelId]: []
      }));
    }
  };

  const getLevelName = (levelId) => {
    const level = levels.find(l => (l.id === levelId) || (l.level_id === levelId));
    return level?.name || level?.level_name || 'Selected Level';
  };

  // Load subjects for selected level when it changes
  useEffect(() => {
    if (selectedLevelId) {
      loadLevelSubjects(selectedLevelId);
    }
  }, [selectedLevelId]);

  const currentAssignments = assignments[selectedLevelId] || [];
  
  // Filter core subjects only (type === 'core') or use all subjects if no type filter
  const coreSubjects = subjects.filter(s => s.type === 'core' || s.is_core === true);
  const allSubjects = subjects.length > 0 ? subjects : coreSubjects;

  if (loading) {
    return (
      <div className="level-core-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading core subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="level-core-container">
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
            <Target size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Level Core Subjects
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Assign core subjects to specific academic levels</p>
        </div>
        <button 
          className="button button-secondary" 
          onClick={refreshData}
          disabled={refreshing || saving}
        >
          <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {levels.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem', color: 'var(--warning)' }} />
          <h3>No Levels Found</h3>
          <p>Please add academic levels before assigning core subjects.</p>
        </div>
      ) : (
        <>
          <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '500' }}>Select Level:</label>
            <select 
              className="filter-select" 
              value={selectedLevelId || ''} 
              onChange={(e) => setSelectedLevelId(parseInt(e.target.value))}
              disabled={saving}
            >
              {levels.map(level => (
                <option key={level.id || level.level_id} value={level.id || level.level_id}>
                  {level.name || level.level_name}
                </option>
              ))}
            </select>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Core Subjects for {getLevelName(selectedLevelId)}
            </h3>
            {allSubjects.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--secondary)', padding: '2rem' }}>
                No subjects available. Please add subjects first.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {allSubjects.map(subject => (
                  <label 
                    key={subject.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer', 
                      padding: '0.5rem', 
                      borderRadius: '0.375rem', 
                      transition: 'background 0.2s' 
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg)'} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input 
                      type="checkbox" 
                      checked={currentAssignments.includes(subject.id)} 
                      onChange={() => handleToggleSubject(subject.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      disabled={saving}
                    />
                    <span>{subject.name}</span>
                    {currentAssignments.includes(subject.id) && (
                      <span className="status-badge status-active" style={{ marginLeft: 'auto' }}>Core</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {matrixData && matrixData.matrix && matrixData.matrix.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Level × Subject Matrix View</h3>
              <div className="subject-matrix" style={{ overflowX: 'auto' }}>
                <table className="matrix-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Level</th>
                      {(matrixData.subjects || matrixData.matrix[0]?.subjects || []).map(s => (
                        <th key={s.id || s.subject_id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                          {s.name || s.subject_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.matrix.map(row => (
                      <tr key={row.level_id}>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                          {row.level_name}
                        </td>
                        {(row.subjects || []).map(subject => (
                          <td key={subject.subject_id} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                            {subject.is_core ? (
                              <CheckSquare size={18} color="#10b981" />
                            ) : (
                              <Square size={18} color="var(--secondary)" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button className="button save-btn" onClick={handleSave} disabled={saving || !selectedLevelId}>
              {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Core Subjects'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LevelCoreSubjects;