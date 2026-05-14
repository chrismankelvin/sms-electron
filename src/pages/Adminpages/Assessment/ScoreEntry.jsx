// import { useState, useEffect } from 'react';
// import { Save, CheckCircle, AlertCircle, Upload, Download, X, Users, FileSpreadsheet } from 'lucide-react';
// import '../../../styles/score-entry.css';

// function ScoreEntry() {
//   const [step, setStep] = useState(1);
//   const [selectedAssessment, setSelectedAssessment] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [scores, setScores] = useState([]);
//   const [draftSaved, setDraftSaved] = useState(false);

//   const assessments = [
//     { id: 1, name: 'Term 1 Examination', subject: 'All', maxScore: 100 },
//     { id: 2, name: 'Week 3 Quiz', subject: 'Mathematics', maxScore: 20 }
//   ];

//   const students = [
//     { id: 1, name: 'John Doe', number: 'STU001', score: '', absent: false, remarks: '' },
//     { id: 2, name: 'Jane Smith', number: 'STU002', score: '', absent: false, remarks: '' },
//     { id: 3, name: 'Bob Johnson', number: 'STU003', score: '', absent: false, remarks: '' }
//   ];

//   const selectedAssessmentData = assessments.find(a => a.id.toString() === selectedAssessment);

//   useEffect(() => {
//     if (step === 2 && scores.length > 0) {
//       const interval = setInterval(() => {
//         setDraftSaved(true);
//         setTimeout(() => setDraftSaved(false), 2000);
//         console.log('Auto-saving draft:', scores);
//       }, 30000);
//       return () => clearInterval(interval);
//     }
//   }, [scores, step]);

//   const handleAssessmentSelect = () => {
//     if (!selectedAssessment) {
//       alert('Please select an assessment');
//       return;
//     }
//     setStep(2);
//     setScores(students.map(s => ({ ...s, score: '', absent: false, remarks: '' })));
//   };

//   const handleScoreChange = (studentId, value) => {
//     const maxScore = selectedAssessmentData?.maxScore || 100;
//     if (value > maxScore) {
//       alert(`Score cannot exceed ${maxScore}`);
//       return;
//     }
//     setScores(prev => prev.map(s => s.id === studentId ? { ...s, score: value } : s));
//   };

//   const handleAbsentToggle = (studentId) => {
//     setScores(prev => prev.map(s => s.id === studentId ? { ...s, absent: !s.absent, score: s.absent ? '' : s.score } : s));
//   };

//   const fillAllScores = () => {
//     const value = prompt('Enter score for all students:', '0');
//     if (value !== null) {
//       const maxScore = selectedAssessmentData?.maxScore || 100;
//       if (parseInt(value) > maxScore) {
//         alert(`Score cannot exceed ${maxScore}`);
//         return;
//       }
//       setScores(prev => prev.map(s => ({ ...s, score: value })));
//     }
//   };

//   const markAllPresent = () => {
//     setScores(prev => prev.map(s => ({ ...s, absent: false })));
//   };

//   const markAllAbsent = () => {
//     setScores(prev => prev.map(s => ({ ...s, absent: true, score: '' })));
//   };

//   const validateAndSubmit = () => {
//     const missingScores = scores.filter(s => !s.absent && (!s.score || s.score === ''));
//     if (missingScores.length > 0) {
//       alert(`Missing scores for ${missingScores.length} student(s). Please enter all scores before submitting.`);
//       return;
//     }
//     alert('Scores submitted successfully!');
//     console.log('Submitting scores:', scores);
//   };

//   const handleBulkImport = () => {
//     alert('Bulk import from Excel functionality');
//   };

//   return (
//     <div className="score-entry-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileSpreadsheet size={28} style={{ display: 'inline', marginRight: '12px' }} />Enter Scores</h1>
//         <p style={{ color: 'var(--secondary)' }}>Enter raw scores for students</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {step === 1 && (
//         <div className="card">
//           <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Assessment</h3>
//           <div className="form-group"><label>Assessment</label><select className="form-select" value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}><option value="">Select Assessment</option>{assessments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.subject}) - Max Score: {a.maxScore}</option>)}</select></div>
//           <button className="button" onClick={handleAssessmentSelect} style={{ marginTop: '1rem' }}>Next: Select Class</button>
//         </div>
//       )}

//       {step === 2 && (
//         <>
//           <div className="auto-fill-bar">
//             <button className="button button-secondary" onClick={fillAllScores}><Download size={16} /> Fill All with Same Score</button>
//             <button className="button button-secondary" onClick={markAllPresent}><CheckCircle size={16} /> Mark All Present</button>
//             <button className="button button-secondary" onClick={markAllAbsent}><X size={16} /> Mark All Absent</button>
//             <button className="button button-secondary" onClick={handleBulkImport}><Upload size={16} /> Bulk Import Excel</button>
//           </div>

//           <div className="score-grid">
//             <table className="academic-years-table">
//               <thead><tr><th>Student Name</th><th>Student Number</th><th>Score (0-{selectedAssessmentData?.maxScore})</th><th>Absent?</th><th>Remarks</th></tr></thead>
//               <tbody>{scores.map(s => (<tr key={s.id}><td><strong>{s.name}</strong></td>
//               <td>{s.number}</td>
//               <td><input type="number" className="score-input" value={s.score} onChange={(e) => handleScoreChange(s.id, e.target.value)} disabled={s.absent} /></td>
//               <td><input type="checkbox" className="absent-checkbox" checked={s.absent} onChange={() => handleAbsentToggle(s.id)} /></td>
//               <td><input type="text" className="form-input" style={{ width: '150px' }} value={s.remarks} onChange={(e) => setScores(prev => prev.map(p => p.id === s.id ? { ...p, remarks: e.target.value } : p))} /></td>
//             </tr>))}</tbody>
//             </table>
//           </div>

//           <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
//             <button className="button button-secondary" onClick={() => setStep(1)}>Back</button>
//             <button className="button" onClick={validateAndSubmit}><CheckCircle size={16} /> Validate & Submit</button>
//           </div>
//         </>
//       )}

//       {draftSaved && <div className="draft-status"><CheckCircle size={14} /> Draft auto-saved</div>}
//     </div>
//   );
// }

// export default ScoreEntry;








// src/components/Academics/ScoreEntry.jsx

import { useState, useEffect } from 'react';
import { 
  Save, CheckCircle, AlertCircle, Upload, Download, X, 
  Users, FileSpreadsheet, Loader, RefreshCw, 
  ArrowLeft, Printer, BookOpen 
} from 'lucide-react';
import '../../../styles/score-entry.css';

const API_BASE_URL = 'http://localhost:8000/api';

// API Services
const scoreService = {
  async getAvailableAssessments() {
    const response = await fetch(`${API_BASE_URL}/scores/assessments`);
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

function ScoreEntry() {
  const [step, setStep] = useState(1);
  const [assessments, setAssessments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
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
      const [assessmentsData, classesData] = await Promise.all([
        scoreService.getAvailableAssessments(),
        classService.getAll()
      ]);
      setAssessments(assessmentsData);
      setClasses(classesData);
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

  if (loading && step === 1) {
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
          
          <div className="form-group">
            <label>Assessment (by Subject) *</label>
            <select 
              className="form-select" 
              value={selectedAssessment} 
              onChange={(e) => setSelectedAssessment(e.target.value)}
            >
              <option value="">Select Assessment</option>
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} - {a.subject_name} ({a.type}) - {a.weight}% (Max: {a.max_score})
                </option>
              ))}
            </select>
            <small className="field-hint">Only assessments with subjects assigned are shown</small>
          </div>

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