import { useState } from 'react';
import { FileText, Printer, Download, Search, User, Calendar, Award, X } from 'lucide-react';
import '../../../styles/transcripts.css';

function Transcripts() {
  const [selectedStudent, setSelectedStudent] = useState('John Doe');
  const [transcriptData, setTranscriptData] = useState(null);

  const students = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'];

  const academicHistory = [
    { year: '2024-2025', term: 'Term 1', subjects: [{ name: 'Mathematics', score: 85, grade: 'A', credits: 3 }, { name: 'English', score: 78, grade: 'B+', credits: 3 }], gpa: 3.8, cumulativeGPA: 3.8 },
    { year: '2024-2025', term: 'Term 2', subjects: [{ name: 'Mathematics', score: 88, grade: 'A', credits: 3 }, { name: 'English', score: 82, grade: 'A-', credits: 3 }], gpa: 3.9, cumulativeGPA: 3.85 }
  ];

  const handleGenerate = () => {
    setTranscriptData(academicHistory);
  };

  const totalCredits = academicHistory.reduce((sum, t) => sum + t.subjects.reduce((s, sub) => s + sub.credits, 0), 0);
  const finalGPA = academicHistory.reduce((sum, t) => sum + t.gpa, 0) / academicHistory.length;

  const exportPDF = () => alert('Exporting transcript to PDF...');

  return (
    <div className="transcripts-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />Transcripts</h1>
        <p style={{ color: 'var(--secondary)' }}>Generate cumulative academic history across multiple terms/years</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1 }}><label>Select Student</label><select className="form-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>{students.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <button className="button" onClick={handleGenerate}><Search size={16} /> Generate Transcript</button>
          <button className="button button-secondary" onClick={exportPDF}><Download size={16} /> Export PDF</button>
        </div>
      </div>

      {transcriptData && (<div className="transcript-preview"><div className="transcript-header"><h2>Springfield International School</h2><p>Official Academic Transcript</p></div>
      <div className="student-info"><p><strong>Student Name:</strong> {selectedStudent}</p><p><strong>Student Number:</strong> STU001</p><p><strong>Date of Birth:</strong> 2010-05-15</p><p><strong>Programme:</strong> General Science</p></div>
      {transcriptData.map((term, idx) => (<div key={idx} className="term-section"><h3>{term.year} - {term.term}</h3><table className="transcript-table"><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Credits</th></tr></thead>
      <tbody>{term.subjects.map((s, i) => (<tr key={i}><td>{s.name}</td><td>{s.score}%</td><td>{s.grade}</td><td>{s.credits}</td></tr>))}
      <tr className="total-row"><td colSpan="3"><strong>Term GPA:</strong></td><td><strong>{term.gpa}</strong></td></tr></tbody></table></div>))}
      <div className="summary-section"><p><strong>Total Credits Earned:</strong> {totalCredits}</p><p><strong>Cumulative GPA:</strong> {finalGPA.toFixed(2)}</p><p><strong>Graduation Status:</strong> In Progress - Expected 2026</p></div>
      <div className="transcript-footer"><p>Issued on: {new Date().toLocaleDateString()}</p><p>Registrar's Signature: _________________</p></div></div>)}
    </div>
  );
}

export default Transcripts;