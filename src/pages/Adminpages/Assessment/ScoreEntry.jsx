import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Upload, Download, X, Users, FileSpreadsheet } from 'lucide-react';
import '../../../styles/score-entry.css';

function ScoreEntry() {
  const [step, setStep] = useState(1);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [scores, setScores] = useState([]);
  const [draftSaved, setDraftSaved] = useState(false);

  const assessments = [
    { id: 1, name: 'Term 1 Examination', subject: 'All', maxScore: 100 },
    { id: 2, name: 'Week 3 Quiz', subject: 'Mathematics', maxScore: 20 }
  ];

  const students = [
    { id: 1, name: 'John Doe', number: 'STU001', score: '', absent: false, remarks: '' },
    { id: 2, name: 'Jane Smith', number: 'STU002', score: '', absent: false, remarks: '' },
    { id: 3, name: 'Bob Johnson', number: 'STU003', score: '', absent: false, remarks: '' }
  ];

  const selectedAssessmentData = assessments.find(a => a.id.toString() === selectedAssessment);

  useEffect(() => {
    if (step === 2 && scores.length > 0) {
      const interval = setInterval(() => {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
        console.log('Auto-saving draft:', scores);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [scores, step]);

  const handleAssessmentSelect = () => {
    if (!selectedAssessment) {
      alert('Please select an assessment');
      return;
    }
    setStep(2);
    setScores(students.map(s => ({ ...s, score: '', absent: false, remarks: '' })));
  };

  const handleScoreChange = (studentId, value) => {
    const maxScore = selectedAssessmentData?.maxScore || 100;
    if (value > maxScore) {
      alert(`Score cannot exceed ${maxScore}`);
      return;
    }
    setScores(prev => prev.map(s => s.id === studentId ? { ...s, score: value } : s));
  };

  const handleAbsentToggle = (studentId) => {
    setScores(prev => prev.map(s => s.id === studentId ? { ...s, absent: !s.absent, score: s.absent ? '' : s.score } : s));
  };

  const fillAllScores = () => {
    const value = prompt('Enter score for all students:', '0');
    if (value !== null) {
      const maxScore = selectedAssessmentData?.maxScore || 100;
      if (parseInt(value) > maxScore) {
        alert(`Score cannot exceed ${maxScore}`);
        return;
      }
      setScores(prev => prev.map(s => ({ ...s, score: value })));
    }
  };

  const markAllPresent = () => {
    setScores(prev => prev.map(s => ({ ...s, absent: false })));
  };

  const markAllAbsent = () => {
    setScores(prev => prev.map(s => ({ ...s, absent: true, score: '' })));
  };

  const validateAndSubmit = () => {
    const missingScores = scores.filter(s => !s.absent && (!s.score || s.score === ''));
    if (missingScores.length > 0) {
      alert(`Missing scores for ${missingScores.length} student(s). Please enter all scores before submitting.`);
      return;
    }
    alert('Scores submitted successfully!');
    console.log('Submitting scores:', scores);
  };

  const handleBulkImport = () => {
    alert('Bulk import from Excel functionality');
  };

  return (
    <div className="score-entry-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileSpreadsheet size={28} style={{ display: 'inline', marginRight: '12px' }} />Enter Scores</h1>
        <p style={{ color: 'var(--secondary)' }}>Enter raw scores for students</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Assessment</h3>
          <div className="form-group"><label>Assessment</label><select className="form-select" value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}><option value="">Select Assessment</option>{assessments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.subject}) - Max Score: {a.maxScore}</option>)}</select></div>
          <button className="button" onClick={handleAssessmentSelect} style={{ marginTop: '1rem' }}>Next: Select Class</button>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="auto-fill-bar">
            <button className="button button-secondary" onClick={fillAllScores}><Download size={16} /> Fill All with Same Score</button>
            <button className="button button-secondary" onClick={markAllPresent}><CheckCircle size={16} /> Mark All Present</button>
            <button className="button button-secondary" onClick={markAllAbsent}><X size={16} /> Mark All Absent</button>
            <button className="button button-secondary" onClick={handleBulkImport}><Upload size={16} /> Bulk Import Excel</button>
          </div>

          <div className="score-grid">
            <table className="academic-years-table">
              <thead><tr><th>Student Name</th><th>Student Number</th><th>Score (0-{selectedAssessmentData?.maxScore})</th><th>Absent?</th><th>Remarks</th></tr></thead>
              <tbody>{scores.map(s => (<tr key={s.id}><td><strong>{s.name}</strong></td>
              <td>{s.number}</td>
              <td><input type="number" className="score-input" value={s.score} onChange={(e) => handleScoreChange(s.id, e.target.value)} disabled={s.absent} /></td>
              <td><input type="checkbox" className="absent-checkbox" checked={s.absent} onChange={() => handleAbsentToggle(s.id)} /></td>
              <td><input type="text" className="form-input" style={{ width: '150px' }} value={s.remarks} onChange={(e) => setScores(prev => prev.map(p => p.id === s.id ? { ...p, remarks: e.target.value } : p))} /></td>
            </tr>))}</tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="button button-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="button" onClick={validateAndSubmit}><CheckCircle size={16} /> Validate & Submit</button>
          </div>
        </>
      )}

      {draftSaved && <div className="draft-status"><CheckCircle size={14} /> Draft auto-saved</div>}
    </div>
  );
}

export default ScoreEntry;