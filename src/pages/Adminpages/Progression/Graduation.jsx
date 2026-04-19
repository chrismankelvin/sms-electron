import { useState } from 'react';
import { GraduationCap, CheckCircle, XCircle, Printer, Download, Users, Award, X } from 'lucide-react';
import '../../../styles/graduation.css';

function Graduation() {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('JHS 3');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});

  const levels = ['JHS 3', 'SHS 3'];
  const years = ['2023-2024', '2024-2025'];
  const classes = ['JHS 3A', 'JHS 3B', 'SHS 3 Science', 'SHS 3 Arts'];

  const studentData = [
    { id: 1, name: 'John Doe', eligible: true, reason: '', status: 'Pending' },
    { id: 2, name: 'Jane Smith', eligible: false, reason: 'Failed 3 subjects', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', eligible: true, reason: '', status: 'Pending' }
  ];

  const handleLoadStudents = () => {
    if (!selectedClass) { alert('Please select a class'); return; }
    setStudents(studentData);
    setStep(2);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleMarkGraduated = () => {
    const toGraduate = students.filter(s => selectedStudents[s.id] || s.eligible);
    if (toGraduate.length === 0) { alert('No students selected for graduation'); return; }
    if (window.confirm(`Mark ${toGraduate.length} student(s) as graduated?`)) {
      setStudents(prev => prev.map(s => selectedStudents[s.id] || s.eligible ? { ...s, status: 'Graduated' } : s));
      alert(`${toGraduate.length} student(s) marked as graduated`);
      setStep(3);
    }
  };

  const handleGenerateList = () => { alert('Generating graduation list PDF...'); };
  const handlePrintCertificates = () => { alert('Printing certificates...'); };

  return (
    <div className="graduation-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><GraduationCap size={28} style={{ display: 'inline', marginRight: '12px' }} />Graduation</h1>
        <p style={{ color: 'var(--secondary)' }}>Process graduating students (SHS 3 or JHS 3)</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Graduation Parameters</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div><label>Level</label><select className="form-select" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>{levels.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
        <div><label>Academic Year</label><select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
        <div><label>Class</label><select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>
      <button className="button" onClick={handleLoadStudents}>Load Students</button></div>)}

      {step === 2 && (<div><div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}><button className="button" onClick={handleMarkGraduated}><GraduationCap size={16} /> Mark Selected as Graduated</button>
      <button className="button button-secondary" onClick={handleGenerateList}><Download size={16} /> Generate Graduation List</button>
      <button className="button button-secondary" onClick={handlePrintCertificates}><Printer size={16} /> Print Certificates</button></div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th><input type="checkbox" onChange={(e) => { const checked = e.target.checked; students.forEach(s => { if (s.eligible) setSelectedStudents(prev => ({ ...prev, [s.id]: checked })); }); }} /> Select</th><th>Student</th><th>Eligible to Graduate?</th><th>Reason (if not)</th><th>Status</th></tr></thead>
      <tbody>{students.map(s => (<tr key={s.id}><td><input type="checkbox" checked={selectedStudents[s.id] || false} onChange={() => handleToggleStudent(s.id)} disabled={!s.eligible} /></td>
      <td><strong>{s.name}</strong></td>
      <td>{s.eligible ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />} {s.eligible ? 'Yes' : 'No'}</td>
      <td>{s.reason || '-'}</td>
      <td><span className={`status-badge ${s.status === 'Graduated' ? 'status-active' : 'status-inactive'}`}>{s.status}</span></td></tr>))}</tbody></table></div></div>)}

      {step === 3 && (<div className="card" style={{ textAlign: 'center' }}><Award size={48} color="#10b981" style={{ marginBottom: '1rem' }} /><h3>Graduation Complete!</h3>
      <p>{students.filter(s => s.status === 'Graduated').length} students have been graduated</p><button className="button" onClick={() => window.location.reload()}>Process Another Class</button></div>)}
    </div>
  );
}

export default Graduation;