// // src/components/Academics/ScoreEntry.jsx

// import { useState, useEffect } from 'react';
// import { 
//   Save, CheckCircle, AlertCircle, Upload, Download, X, 
//   Users, FileSpreadsheet, Loader, RefreshCw, 
//   ArrowLeft, Printer, BookOpen 
// } from 'lucide-react';
// import '../../../styles/score-entry.css';

// const API_BASE_URL = 'http://localhost:8000/api';

// // API Services
// const scoreService = {
//   async getAvailableAssessments() {
//     const response = await fetch(`${API_BASE_URL}/scores/assessments`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async getScoresForAssessmentClass(assessmentId, classId) {
//     const response = await fetch(`${API_BASE_URL}/scores/assessment/${assessmentId}/class/${classId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async bulkSaveScores(assessmentId, classId, termId, scores) {
//     const response = await fetch(`${API_BASE_URL}/scores/bulk`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         assessment_id: assessmentId,
//         class_id: classId,
//         term_id: termId,
//         scores: scores
//       })
//     });
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// const classService = {
//   async getAll() {
//     const response = await fetch(`${API_BASE_URL}/classes/`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// function ScoreEntry() {
//   const [step, setStep] = useState(1);
//   const [assessments, setAssessments] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [selectedAssessment, setSelectedAssessment] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [assessmentData, setAssessmentData] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [scores, setScores] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [draftSaved, setDraftSaved] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

//   // Load initial data
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   // Auto-save draft every 30 seconds
//   useEffect(() => {
//     if (step === 2 && scores.length > 0) {
//       const interval = setInterval(() => {
//         autoSaveDraft();
//       }, 30000);
//       return () => clearInterval(interval);
//     }
//   }, [scores, step, selectedAssessment, selectedClass]);

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       const [assessmentsData, classesData] = await Promise.all([
//         scoreService.getAvailableAssessments(),
//         classService.getAll()
//       ]);
//       setAssessments(assessmentsData);
//       setClasses(classesData);
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

//   const handleAssessmentSelect = async () => {
//     if (!selectedAssessment || !selectedClass) {
//       showAlert('Please select both an assessment and a class', 'error');
//       return;
//     }

//     try {
//       setLoading(true);
//       const data = await scoreService.getScoresForAssessmentClass(
//         parseInt(selectedAssessment),
//         parseInt(selectedClass)
//       );
      
//       setAssessmentData(data.assessment);
//       setStudents(data.students);
//       setScores(data.students.map(s => ({
//         student_id: s.student_id,
//         student_name: s.student_name,
//         student_number: s.student_number,
//         score_id: s.score_id,
//         score: s.score !== null ? s.score.toString() : '',
//         is_absent: s.is_absent || false,
//         remarks: s.remarks || ''
//       })));
      
//       setStep(2);
//     } catch (error) {
//       showAlert('Failed to load scores: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const autoSaveDraft = async () => {
//     if (scores.length === 0) return;
    
//     try {
//       const scoresToSave = scores.map(s => ({
//         student_id: s.student_id,
//         score: s.is_absent ? null : (s.score ? parseFloat(s.score) : null),
//         is_absent: s.is_absent,
//         remarks: s.remarks
//       }));
      
//       await scoreService.bulkSaveScores(
//         parseInt(selectedAssessment),
//         parseInt(selectedClass),
//         assessmentData?.term_id,
//         scoresToSave
//       );
      
//       setDraftSaved(true);
//       setTimeout(() => setDraftSaved(false), 2000);
//     } catch (error) {
//       console.error('Auto-save failed:', error);
//     }
//   };

//   const handleScoreChange = (studentId, value) => {
//     const maxScore = assessmentData?.max_score || 100;
//     if (value && parseFloat(value) > maxScore) {
//       showAlert(`Score cannot exceed ${maxScore}`, 'error');
//       return;
//     }
//     setScores(prev => prev.map(s => 
//       s.student_id === studentId ? { ...s, score: value } : s
//     ));
//   };

//   const handleAbsentToggle = (studentId) => {
//     setScores(prev => prev.map(s => 
//       s.student_id === studentId ? 
//       { ...s, is_absent: !s.is_absent, score: s.is_absent ? s.score : '' } : s
//     ));
//   };

//   const handleRemarkChange = (studentId, value) => {
//     setScores(prev => prev.map(s => 
//       s.student_id === studentId ? { ...s, remarks: value } : s
//     ));
//   };

//   const fillAllScores = () => {
//     const value = prompt('Enter score for all students:', '0');
//     if (value !== null) {
//       const maxScore = assessmentData?.max_score || 100;
//       if (parseFloat(value) > maxScore) {
//         showAlert(`Score cannot exceed ${maxScore}`, 'error');
//         return;
//       }
//       setScores(prev => prev.map(s => ({ ...s, score: value, is_absent: false })));
//     }
//   };

//   const markAllPresent = () => {
//     if (confirm('Mark all students as present? This will not clear existing scores.')) {
//       setScores(prev => prev.map(s => ({ ...s, is_absent: false })));
//     }
//   };

//   const markAllAbsent = () => {
//     if (confirm('Mark all students as absent? This will clear all scores.')) {
//       setScores(prev => prev.map(s => ({ ...s, is_absent: true, score: '' })));
//     }
//   };

//   const validateAndSubmit = async () => {
//     const missingScores = scores.filter(s => !s.is_absent && (!s.score || s.score === ''));
//     if (missingScores.length > 0) {
//       showAlert(`Missing scores for ${missingScores.length} student(s). Please enter all scores before submitting.`, 'error');
//       return;
//     }

//     try {
//       setSaving(true);
      
//       const scoresToSave = scores.map(s => ({
//         student_id: s.student_id,
//         score: s.is_absent ? null : (s.score ? parseFloat(s.score) : null),
//         is_absent: s.is_absent,
//         remarks: s.remarks
//       }));
      
//       const result = await scoreService.bulkSaveScores(
//         parseInt(selectedAssessment),
//         parseInt(selectedClass),
//         assessmentData?.term_id,
//         scoresToSave
//       );
      
//       if (result.errors && result.errors.length > 0) {
//         showAlert(`Partial success: ${result.created_count + result.updated_count} saved, ${result.errors.length} errors.`, 'warning');
//         console.error('Score save errors:', result.errors);
//       } else {
//         showAlert('Scores submitted successfully!', 'success');
//       }
      
//     } catch (error) {
//       showAlert('Failed to save scores: ' + error.message, 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   if (loading && step === 1) {
//     return (
//       <div className="score-entry-container">
//         <div className="loading-container">
//           <Loader size={48} className="spinner" />
//           <p>Loading data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="score-entry-container">
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

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <FileSpreadsheet size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Enter Scores
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>Enter raw scores for students by assessment</p>
//         </div>
//         {step === 2 && (
//           <div style={{ display: 'flex', gap: '0.75rem' }}>
//             <button className="button button-secondary" onClick={handlePrint} disabled={saving}>
//               <Printer size={16} /> Print
//             </button>
//             <button className="button button-secondary" onClick={() => setStep(1)} disabled={saving}>
//               <ArrowLeft size={16} /> Back to Selection
//             </button>
//           </div>
//         )}
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {/* Step 1: Selection */}
//       {step === 1 && (
//         <div className="card">
//           <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Assessment and Class</h3>
          
//           <div className="form-group">
//             <label>Assessment (by Subject) *</label>
//             <select 
//               className="form-select" 
//               value={selectedAssessment} 
//               onChange={(e) => setSelectedAssessment(e.target.value)}
//             >
//               <option value="">Select Assessment</option>
//               {assessments.map(a => (
//                 <option key={a.id} value={a.id}>
//                   {a.name} - {a.subject_name} ({a.type}) - {a.weight}% (Max: {a.max_score})
//                 </option>
//               ))}
//             </select>
//             <small className="field-hint">Only assessments with subjects assigned are shown</small>
//           </div>

//           <div className="form-group">
//             <label>Class *</label>
//             <select 
//               className="form-select" 
//               value={selectedClass} 
//               onChange={(e) => setSelectedClass(e.target.value)}
//             >
//               <option value="">Select Class</option>
//               {classes.map(c => (
//                 <option key={c.id} value={c.id}>{c.class_name}</option>
//               ))}
//             </select>
//           </div>

//           <button 
//             className="button" 
//             onClick={handleAssessmentSelect} 
//             style={{ marginTop: '1rem' }}
//             disabled={!selectedAssessment || !selectedClass}
//           >
//             Next: Enter Scores
//           </button>
//         </div>
//       )}

//       {/* Step 2: Score Entry */}
//       {step === 2 && assessmentData && (
//         <>
//           {/* Assessment Info Bar */}
//           <div className="assessment-info-bar">
//             <div className="info-item">
//               <strong>Assessment:</strong> {assessmentData.name}
//             </div>
//             <div className="info-item">
//               <strong>Subject:</strong> <BookOpen size={14} /> {assessmentData.subject_name}
//             </div>
//             <div className="info-item">
//               <strong>Max Score:</strong> {assessmentData.max_score}
//             </div>
//             <div className="info-item">
//               <strong>Weight:</strong> {assessmentData.weight}%
//             </div>
//             <div className="info-item">
//               <strong>Term:</strong> {assessmentData.term_name}
//             </div>
//             <div className="info-item">
//               <strong>Class:</strong> {classes.find(c => c.id.toString() === selectedClass)?.class_name}
//             </div>
//           </div>

//           {/* Action Buttons Bar */}
//           <div className="auto-fill-bar">
//             <button className="button button-secondary" onClick={fillAllScores} disabled={saving}>
//               <Download size={16} /> Fill All with Same Score
//             </button>
//             <button className="button button-secondary" onClick={markAllPresent} disabled={saving}>
//               <CheckCircle size={16} /> Mark All Present
//             </button>
//             <button className="button button-secondary" onClick={markAllAbsent} disabled={saving}>
//               <X size={16} /> Mark All Absent
//             </button>
//             <button className="button button-secondary" onClick={autoSaveDraft} disabled={saving}>
//               <Save size={16} /> Save Draft
//             </button>
//           </div>

//           {/* Scores Table */}
//           <div className="score-grid">
//             <div className="table-container">
//               <table className="academic-years-table">
//                 <thead>
//                   <tr>
//                     <th>Student Name</th>
//                     <th>Student Number</th>
//                     <th>Score (0-{assessmentData.max_score})</th>
//                     <th>Absent?</th>
//                     <th>Remarks</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scores.length === 0 ? (
//                     <tr>
//                       <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
//                         <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
//                         <p>No students found in this class</p>
//                       </td>
//                     </tr>
//                   ) : (
//                     scores.map(s => (
//                       <tr key={s.student_id}>
//                         <td><strong>{s.student_name}</strong></td>
//                         <td>{s.student_number}</td>
//                         <td>
//                           <input 
//                             type="number" 
//                             className="score-input" 
//                             value={s.score} 
//                             onChange={(e) => handleScoreChange(s.student_id, e.target.value)}
//                             disabled={s.is_absent || saving}
//                             step="0.5"
//                             min="0"
//                             max={assessmentData.max_score}
//                           />
//                         </td>
//                         <td style={{ textAlign: 'center' }}>
//                           <input 
//                             type="checkbox" 
//                             className="absent-checkbox" 
//                             checked={s.is_absent} 
//                             onChange={() => handleAbsentToggle(s.student_id)}
//                             disabled={saving}
//                           />
//                         </td>
//                         <td>
//                           <input 
//                             type="text" 
//                             className="form-input" 
//                             style={{ width: '150px' }} 
//                             value={s.remarks} 
//                             onChange={(e) => handleRemarkChange(s.student_id, e.target.value)}
//                             placeholder="Optional remarks"
//                             disabled={saving}
//                           />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
//             <button 
//               className="button button-secondary" 
//               onClick={() => setStep(1)}
//               disabled={saving}
//             >
//               Cancel
//             </button>
//             <button 
//               className="button" 
//               onClick={validateAndSubmit} 
//               disabled={saving || scores.length === 0}
//             >
//               {saving ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
//               {saving ? 'Saving...' : 'Validate & Submit'}
//             </button>
//           </div>

//           {/* Draft Status */}
//           {draftSaved && (
//             <div className="draft-status">
//               <CheckCircle size={14} /> Draft auto-saved
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default ScoreEntry;











// src/components/Academics/ScoreEntry.jsx

import { useState, useEffect } from 'react';
import { 
  Save, CheckCircle, AlertCircle, Upload, Download, X, 
  Users, FileSpreadsheet, Loader, RefreshCw, 
  ArrowLeft, Printer, BookOpen, Filter 
} from 'lucide-react';
import '../../../styles/score-entry.css';

const API_BASE_URL = 'http://localhost:8000/api';

// API Services
const scoreService = {
  async getAssessmentsBySubject(subjectId = null, termId = null) {
    let url = `${API_BASE_URL}/assessments/`;
    const params = [];
    if (subjectId) params.push(`subject_id=${subjectId}`);
    if (termId) params.push(`term_id=${termId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSubjectsForClass(classId, academicYearId) {
    const response = await fetch(`${API_BASE_URL}/class-subjects/class/${classId}?academic_year_id=${academicYearId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSubjectsWithAssessments(academicYearId, termId, subjectIds = []) {
    let url = `${API_BASE_URL}/assessments/subjects?academic_year_id=${academicYearId}&term_id=${termId}`;
    if (subjectIds.length > 0) {
      url += `&subject_ids=${subjectIds.join(',')}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getScoresForAssessmentClass(assessmentId, classId) {
    const response = await fetch(`${API_BASE_URL}/scores/assessment/${assessmentId}/class/${classId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async bulkSaveScores(assessmentId, classId, termId, scores) {
    const response = await fetch(`${API_BASE_URL}/scores/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: assessmentId,
        class_id: classId,
        term_id: termId,
        scores: scores
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const classService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/classes/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const academicYearService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/academic-years/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

const termService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/terms/`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function ScoreEntry() {
  const [step, setStep] = useState(1);
  const [subjectsWithAssessments, setSubjectsWithAssessments] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentData, setAssessmentData] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load class subjects when class changes
  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      loadClassSubjects();
    } else {
      setClassSubjects([]);
      setSelectedSubject('');
      setSubjectsWithAssessments([]);
    }
  }, [selectedClass, selectedAcademicYear]);

  // Load subjects with assessments when term changes or class subjects load
  useEffect(() => {
    if (selectedAcademicYear && selectedTerm && classSubjects.length > 0) {
      loadSubjectsWithAssessments();
    }
  }, [selectedAcademicYear, selectedTerm, classSubjects]);

  // Load assessments when subject changes
  useEffect(() => {
    if (selectedSubject && selectedTerm && selectedAcademicYear) {
      loadAssessmentsForSubject();
    }
  }, [selectedSubject, selectedTerm, selectedAcademicYear]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (step === 2 && scores.length > 0) {
      const interval = setInterval(() => {
        autoSaveDraft();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [scores, step, selectedAssessment, selectedClass]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [yearsData, termsData, classesData] = await Promise.all([
        academicYearService.getAll(),
        termService.getAll(),
        classService.getAll()
      ]);
      
      setAcademicYears(yearsData);
      setTerms(termsData);
      setClasses(classesData);
      
      // Set default selections
      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id.toString());
      } else if (yearsData.length > 0) {
        setSelectedAcademicYear(yearsData[0].id.toString());
      }
      
      if (termsData.length > 0) {
        setSelectedTerm(termsData[0].id.toString());
      }
      
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id.toString());
      }
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async () => {
    if (!selectedClass || !selectedAcademicYear) return;
    
    try {
      setLoading(true);
      const data = await scoreService.getSubjectsForClass(
        parseInt(selectedClass),
        parseInt(selectedAcademicYear)
      );
      setClassSubjects(data.subjects || []);
      
      // Reset selections
      setSelectedSubject('');
      setSelectedAssessment('');
      setAssessments([]);
      setSubjectsWithAssessments([]);
    } catch (error) {
      showAlert('Failed to load class subjects: ' + error.message, 'error');
      setClassSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsWithAssessments = async () => {
    if (!selectedAcademicYear || !selectedTerm || classSubjects.length === 0) return;
    
    try {
      setLoading(true);
      // Get the subject IDs from the class subjects
      const subjectIds = classSubjects.map(s => s.subject_id);
      
      // Fetch assessment data only for these subjects
      const data = await scoreService.getSubjectsWithAssessments(
        parseInt(selectedAcademicYear),
        parseInt(selectedTerm),
        subjectIds
      );
      
      // Filter to only include subjects that are in the class
      const filteredSubjects = data.filter(subject => 
        subjectIds.includes(subject.subject_id)
      );
      
      setSubjectsWithAssessments(filteredSubjects);
      
      // Auto-select first subject that has assessments
      const subjectWithAssessments = filteredSubjects.find(s => s.assessments && s.assessments.length > 0);
      if (subjectWithAssessments) {
        setSelectedSubject(subjectWithAssessments.subject_id.toString());
      }
    } catch (error) {
      showAlert('Failed to load subjects: ' + error.message, 'error');
      setSubjectsWithAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentsForSubject = async () => {
    if (!selectedSubject || !selectedTerm || !selectedAcademicYear) return;
    
    try {
      const data = await scoreService.getAssessmentsBySubject(
        parseInt(selectedSubject),
        parseInt(selectedTerm)
      );
      setAssessments(data);
      
      // Auto-select first assessment
      if (data.length > 0) {
        setSelectedAssessment(data[0].id.toString());
      } else {
        setSelectedAssessment('');
      }
    } catch (error) {
      showAlert('Failed to load assessments: ' + error.message, 'error');
      setAssessments([]);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleAssessmentSelect = async () => {
    if (!selectedAssessment || !selectedClass) {
      showAlert('Please select both an assessment and a class', 'error');
      return;
    }

    try {
      setLoading(true);
      const data = await scoreService.getScoresForAssessmentClass(
        parseInt(selectedAssessment),
        parseInt(selectedClass)
      );
      
      setAssessmentData(data.assessment);
      setStudents(data.students);
      setScores(data.students.map(s => ({
        student_id: s.student_id,
        student_name: s.student_name,
        student_number: s.student_number,
        score_id: s.score_id,
        score: s.score !== null ? s.score.toString() : '',
        is_absent: s.is_absent || false,
        remarks: s.remarks || ''
      })));
      
      setStep(2);
    } catch (error) {
      showAlert('Failed to load scores: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const autoSaveDraft = async () => {
    if (scores.length === 0) return;
    
    try {
      const scoresToSave = scores.map(s => ({
        student_id: s.student_id,
        score: s.is_absent ? null : (s.score ? parseFloat(s.score) : null),
        is_absent: s.is_absent,
        remarks: s.remarks
      }));
      
      await scoreService.bulkSaveScores(
        parseInt(selectedAssessment),
        parseInt(selectedClass),
        assessmentData?.term_id,
        scoresToSave
      );
      
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleScoreChange = (studentId, value) => {
    const maxScore = assessmentData?.max_score || 100;
    if (value && parseFloat(value) > maxScore) {
      showAlert(`Score cannot exceed ${maxScore}`, 'error');
      return;
    }
    setScores(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, score: value } : s
    ));
  };

  const handleAbsentToggle = (studentId) => {
    setScores(prev => prev.map(s => 
      s.student_id === studentId ? 
      { ...s, is_absent: !s.is_absent, score: s.is_absent ? s.score : '' } : s
    ));
  };

  const handleRemarkChange = (studentId, value) => {
    setScores(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, remarks: value } : s
    ));
  };

  const fillAllScores = () => {
    const value = prompt('Enter score for all students:', '0');
    if (value !== null) {
      const maxScore = assessmentData?.max_score || 100;
      if (parseFloat(value) > maxScore) {
        showAlert(`Score cannot exceed ${maxScore}`, 'error');
        return;
      }
      setScores(prev => prev.map(s => ({ ...s, score: value, is_absent: false })));
    }
  };

  const markAllPresent = () => {
    if (confirm('Mark all students as present? This will not clear existing scores.')) {
      setScores(prev => prev.map(s => ({ ...s, is_absent: false })));
    }
  };

  const markAllAbsent = () => {
    if (confirm('Mark all students as absent? This will clear all scores.')) {
      setScores(prev => prev.map(s => ({ ...s, is_absent: true, score: '' })));
    }
  };

  const validateAndSubmit = async () => {
    const missingScores = scores.filter(s => !s.is_absent && (!s.score || s.score === ''));
    if (missingScores.length > 0) {
      showAlert(`Missing scores for ${missingScores.length} student(s). Please enter all scores before submitting.`, 'error');
      return;
    }

    try {
      setSaving(true);
      
      const scoresToSave = scores.map(s => ({
        student_id: s.student_id,
        score: s.is_absent ? null : (s.score ? parseFloat(s.score) : null),
        is_absent: s.is_absent,
        remarks: s.remarks
      }));
      
      const result = await scoreService.bulkSaveScores(
        parseInt(selectedAssessment),
        parseInt(selectedClass),
        assessmentData?.term_id,
        scoresToSave
      );
      
      if (result.errors && result.errors.length > 0) {
        showAlert(`Partial success: ${result.created_count + result.updated_count} saved, ${result.errors.length} errors.`, 'warning');
        console.error('Score save errors:', result.errors);
      } else {
        showAlert('Scores submitted successfully!', 'success');
      }
      
    } catch (error) {
      showAlert('Failed to save scores: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getSelectedSubjectInfo = () => {
    return subjectsWithAssessments.find(s => s.subject_id.toString() === selectedSubject);
  };

  const selectedSubjectInfo = getSelectedSubjectInfo();

  if (loading && step === 1 && classSubjects.length === 0 && subjectsWithAssessments.length === 0) {
    return (
      <div className="score-entry-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="score-entry-container">
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <FileSpreadsheet size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Enter Scores
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Enter raw scores for students by assessment</p>
        </div>
        {step === 2 && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button button-secondary" onClick={handlePrint} disabled={saving}>
              <Printer size={16} /> Print
            </button>
            <button className="button button-secondary" onClick={() => setStep(1)} disabled={saving}>
              <ArrowLeft size={16} /> Back to Selection
            </button>
          </div>
        )}
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Step 1: Selection */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Assessment and Class</h3>
          
          <div className="filter-row">
            <div className="form-group">
              <label>Academic Year *</label>
              <select 
                className="form-select" 
                value={selectedAcademicYear} 
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.year_label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Term *</label>
              <select 
                className="form-select" 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map(term => (
                  <option key={term.id} value={term.id}>{term.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Selection */}
          <div className="form-group">
            <label>Class *</label>
            <select 
              className="form-select" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
          </div>

          {/* Show subjects for selected class */}
          {selectedClass && classSubjects.length > 0 && (
            <div className="class-subjects-info">
              <div className="info-header">
                <BookOpen size={16} />
                <span>Subjects offered in this class:</span>
              </div>
              <div className="subjects-tags">
                {classSubjects.map(subject => (
                  <span key={subject.subject_id} className="subject-tag">
                    {subject.subject_name}
                    {subject.is_required && <span className="required-badge">Required</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subject Selection - Only shows subjects related to the selected class */}
          {classSubjects.length > 0 && (
            <div className="form-group">
              <label>Subject *</label>
              <select 
                className="form-select" 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjectsWithAssessments.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name} 
                    {subject.is_valid ? ' ✓' : ` (${subject.total_weight}% / 100%)`}
                  </option>
                ))}
              </select>
              {selectedSubjectInfo && !selectedSubjectInfo.is_valid && (
                <div className="weight-warning">
                  <AlertCircle size={14} />
                  <span>Subject assessments total {selectedSubjectInfo.total_weight}%. Need {selectedSubjectInfo.remaining}% more to reach 100%</span>
                </div>
              )}
              {subjectsWithAssessments.length === 0 && classSubjects.length > 0 && (
                <div className="no-data-warning">
                  <AlertCircle size={14} />
                  <span>No assessments found for any subject in this class. Please create assessments first.</span>
                </div>
              )}
            </div>
          )}

          {/* Assessment Selection */}
          {selectedSubject && assessments.length > 0 && (
            <div className="form-group">
              <label>Assessment *</label>
              <select 
                className="form-select" 
                value={selectedAssessment} 
                onChange={(e) => setSelectedAssessment(e.target.value)}
              >
                <option value="">Select Assessment</option>
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type}) - {a.weight}% (Max: {a.max_score})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSubject && assessments.length === 0 && (
            <div className="no-data-warning">
              <AlertCircle size={14} />
              <span>No assessments found for this subject. Please create assessments first.</span>
            </div>
          )}

          <button 
            className="button" 
            onClick={handleAssessmentSelect} 
            style={{ marginTop: '1rem' }}
            disabled={!selectedAssessment || !selectedClass}
          >
            Next: Enter Scores
          </button>
        </div>
      )}

      {/* Step 2: Score Entry */}
      {step === 2 && assessmentData && (
        <>
          {/* Assessment Info Bar */}
          <div className="assessment-info-bar">
            <div className="info-item">
              <strong>Assessment:</strong> {assessmentData.name}
            </div>
            <div className="info-item">
              <strong>Subject:</strong> <BookOpen size={14} /> {assessmentData.subject_name}
            </div>
            <div className="info-item">
              <strong>Max Score:</strong> {assessmentData.max_score}
            </div>
            <div className="info-item">
              <strong>Weight:</strong> {assessmentData.weight}%
            </div>
            <div className="info-item">
              <strong>Term:</strong> {assessmentData.term_name}
            </div>
            <div className="info-item">
              <strong>Class:</strong> {classes.find(c => c.id.toString() === selectedClass)?.class_name}
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="auto-fill-bar">
            <button className="button button-secondary" onClick={fillAllScores} disabled={saving}>
              <Download size={16} /> Fill All with Same Score
            </button>
            <button className="button button-secondary" onClick={markAllPresent} disabled={saving}>
              <CheckCircle size={16} /> Mark All Present
            </button>
            <button className="button button-secondary" onClick={markAllAbsent} disabled={saving}>
              <X size={16} /> Mark All Absent
            </button>
            <button className="button button-secondary" onClick={autoSaveDraft} disabled={saving}>
              <Save size={16} /> Save Draft
            </button>
          </div>

          {/* Scores Table */}
          <div className="score-grid">
            <div className="table-container">
              <table className="academic-years-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student Number</th>
                    <th>Score (0-{assessmentData.max_score})</th>
                    <th>Absent?</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No students found in this class</p>
                      </td>
                    </tr>
                  ) : (
                    scores.map(s => (
                      <tr key={s.student_id}>
                        <td><strong>{s.student_name}</strong></td>
                        <td>{s.student_number}</td>
                        <td>
                          <input 
                            type="number" 
                            className="score-input" 
                            value={s.score} 
                            onChange={(e) => handleScoreChange(s.student_id, e.target.value)}
                            disabled={s.is_absent || saving}
                            step="0.5"
                            min="0"
                            max={assessmentData.max_score}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            className="absent-checkbox" 
                            checked={s.is_absent} 
                            onChange={() => handleAbsentToggle(s.student_id)}
                            disabled={saving}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ width: '150px' }} 
                            value={s.remarks} 
                            onChange={(e) => handleRemarkChange(s.student_id, e.target.value)}
                            placeholder="Optional remarks"
                            disabled={saving}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="button button-secondary" 
              onClick={() => setStep(1)}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="button" 
              onClick={validateAndSubmit} 
              disabled={saving || scores.length === 0}
            >
              {saving ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
              {saving ? 'Saving...' : 'Validate & Submit'}
            </button>
          </div>

          {/* Draft Status */}
          {draftSaved && (
            <div className="draft-status">
              <CheckCircle size={14} /> Draft auto-saved
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ScoreEntry;