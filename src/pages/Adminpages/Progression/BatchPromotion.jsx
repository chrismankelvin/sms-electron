import { useState } from 'react';
import { Users, ArrowRight, Calculator, CheckCircle, XCircle, AlertCircle, Download, Save, X } from 'lucide-react';
import '../../../styles/batch-promotion.css';

function BatchPromotion() {
  const [step, setStep] = useState(1);
  const [fromYear, setFromYear] = useState('2023-2024');
  const [fromClass, setFromClass] = useState('');
  const [toYear, setToYear] = useState('2024-2025');
  const [toClass, setToClass] = useState('');
  const [students, setStudents] = useState([]);
  const [overrides, setOverrides] = useState({});

  const years = ['2022-2023', '2023-2024', '2024-2025'];
  const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B'];

  const studentData = [
    { id: 1, name: 'John Doe', currentLevel: 'JHS 1A', averageScore: 78, failedSubjects: 0, status: 'Promoted' },
    { id: 2, name: 'Jane Smith', currentLevel: 'JHS 1A', averageScore: 45, failedSubjects: 3, status: 'Repeat' },
    { id: 3, name: 'Bob Johnson', currentLevel: 'JHS 1A', averageScore: 62, failedSubjects: 2, status: 'Promoted' }
  ];

  const handlePreview = () => {
    if (!fromClass || !toClass) { alert('Please select both from and to classes'); return; }
    setStudents(studentData);
    setStep(2);
  };

  const handleApplyRules = () => {
    const updated = students.map(s => ({ ...s, status: overrides[s.id] ? (overrides[s.id] === 'promote' ? 'Promoted' : 'Repeat') : s.status }));
    setStudents(updated);
    alert('Rules applied successfully');
  };

  const handleOverride = (studentId, action) => {
    setOverrides(prev => ({ ...prev, [studentId]: action }));
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: action === 'promote' ? 'Promoted' : 'Repeat' } : s));
  };

  const handleExecutePromotion = () => {
    if (window.confirm(`Promote ${students.filter(s => s.status === 'Promoted').length} students and repeat ${students.filter(s => s.status === 'Repeat').length} students?`)) {
      alert('Promotion executed successfully!');
      setStep(3);
    }
  };

  const handleGeneratePDF = () => { alert('Generating promotion list PDF...'); };

  return (
    <div className="batch-promotion-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Batch Promotion</h1>
        <p style={{ color: 'var(--secondary)' }}>Promote entire class to next level</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Promotion Parameters</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div><label>From Academic Year</label><select className="form-select" value={fromYear} onChange={(e) => setFromYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div><label>From Class</label><select className="form-select" value={fromClass} onChange={(e) => setFromClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label>To Academic Year</label><select className="form-select" value={toYear} onChange={(e) => setToYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div><label>To Class (Suggested)</label><select className="form-select" value={toClass} onChange={(e) => setToClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>
      <button className="button" onClick={handlePreview}>Preview Students</button></div>)}

      {step === 2 && (<div><div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}><button className="button button-secondary" onClick={handleApplyRules}><Calculator size={16} /> Apply Rules</button>
      <button className="button button-secondary" onClick={handleGeneratePDF}><Download size={16} /> Generate Promotion List PDF</button>
      <button className="button" onClick={handleExecutePromotion}><Save size={16} /> Execute Promotion</button></div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Current Level</th><th>Average Score</th><th>Failed Subjects</th><th>Promotion Status</th><th>Override</th></tr></thead>
      <tbody>{students.map(s => (<tr key={s.id} className={s.status === 'Promoted' ? 'preview-student-row promoted' : 'preview-student-row repeat'}><td><strong>{s.name}</strong></td>
      <td>{s.currentLevel} → {toClass}</td>
      <td>{s.averageScore}%</td><td className={s.failedSubjects > 0 ? 'text-danger' : 'text-success'}>{s.failedSubjects}</td>
      <td><span className={`status-badge ${s.status === 'Promoted' ? 'status-active' : 'status-withdrawn'}`}>{s.status}</span></td>
      <td><div className="action-buttons"><button className="action-btn set-current-btn" onClick={() => handleOverride(s.id, 'promote')}><CheckCircle size={16} /> Promote</button>
      <button className="action-btn delete-btn" onClick={() => handleOverride(s.id, 'repeat')}><XCircle size={16} /> Repeat</button></div></td></tr>))}</tbody></table></div></div>)}

      {step === 3 && (<div className="card" style={{ textAlign: 'center' }}><CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} /><h3>Promotion Complete!</h3><p>{students.filter(s => s.status === 'Promoted').length} students promoted to {toClass}</p>
      <p>{students.filter(s => s.status === 'Repeat').length} students will repeat {fromClass}</p><button className="button" onClick={() => window.location.reload()}>Start New Promotion</button></div>)}
    </div>
  );
}

export default BatchPromotion;