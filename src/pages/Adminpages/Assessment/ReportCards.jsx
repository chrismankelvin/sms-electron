import { useState } from 'react';
import { FileText, Printer, Download, Send, Eye, Users, X, CheckCircle } from 'lucide-react';
import '../../../styles/report-cards.css';

function ReportCards() {
  const [step, setStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('Standard');

  const years = ['2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];
  const templates = ['Standard', 'Detailed', 'Simple'];

  const subjects = [
    { name: 'Mathematics', score: 85, grade: 'A', remark: 'Excellent' },
    { name: 'English', score: 78, grade: 'B+', remark: 'Very Good' },
    { name: 'Science', score: 92, grade: 'A+', remark: 'Outstanding' },
    { name: 'Social Studies', score: 70, grade: 'B', remark: 'Good' }
  ];

  const average = subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length;
  const total = subjects.reduce((sum, s) => sum + s.score, 0);

  const handleGenerateAll = () => {
    alert(`Generating report cards for all students in ${selectedClass}...`);
  };

  const handleDownloadZIP = () => {
    alert('Downloading ZIP file with all report cards...');
  };

  const handleSendEmails = () => {
    alert('Sending report cards via email to parents...');
  };

  return (
    <div className="report-cards-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />Report Cards</h1>
        <p style={{ color: 'var(--secondary)' }}>Generate and print individual student report cards</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Card Generator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
          <select className="form-select" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select className="form-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}><option value="all">All Students</option><option>John Doe</option><option>Jane Smith</option></select>
          <select className="form-select" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>{templates.map(t => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}><button className="button" onClick={handleGenerateAll}><Eye size={16} /> Generate All</button>
        <button className="button button-secondary" onClick={handleDownloadZIP}><Download size={16} /> Download as ZIP</button>
        <button className="button button-secondary" onClick={handleSendEmails}><Send size={16} /> Send to Email</button></div>
      </div>

      <div className="report-card-preview">
        <div className="report-header"><h2>Springfield International School</h2><p>Excellence in Education</p><h3>Report Card - {selectedTerm} {selectedYear}</h3></div>
        <div style={{ marginBottom: '1rem' }}><p><strong>Student:</strong> John Doe</p><p><strong>Class:</strong> {selectedClass} | <strong>Section:</strong> A</p><p><strong>Student Number:</strong> STU001</p></div>
        <table className="report-subject-table"><thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead>
        <tbody>{subjects.map((s, i) => (<tr key={i}><td>{s.name}</td><td>{s.score}%</td><td>{s.grade}</td><td>{s.remark}</td></tr>))}</tbody></table>
        <div style={{ marginTop: '1rem' }}><p><strong>Average:</strong> {average.toFixed(1)}%</p><p><strong>Total:</strong> {total} / {subjects.length * 100}</p><p><strong>Position:</strong> 1st out of 40</p><p><strong>Overall Grade:</strong> A</p></div>
        <div className="signature-line"><div>Teacher's Signature: _________________</div><div>Principal's Signature: _________________</div></div>
      </div>
    </div>
  );
}

export default ReportCards;