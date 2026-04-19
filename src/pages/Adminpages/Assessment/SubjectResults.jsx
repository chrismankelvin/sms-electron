import { useState } from 'react';
import { BookOpen, Download, Printer, Search, Filter, X, Trophy, Award } from 'lucide-react';
import '../../../styles/subject-results.css';

function SubjectResults() {
  const [filters, setFilters] = useState({ year: '2024-2025', term: 'Term 1', class: 'JHS 1 Science', subject: 'Mathematics' });

  const results = [
    { id: 1, student: 'John Doe', score: 85, grade: 'A', gradePoint: 4.0, positionClass: 1, positionSection: 1, remark: 'Excellent' },
    { id: 2, student: 'Jane Smith', score: 72, grade: 'B', gradePoint: 3.0, positionClass: 5, positionSection: 2, remark: 'Very Good' },
    { id: 3, student: 'Bob Johnson', score: 68, grade: 'C+', gradePoint: 2.5, positionClass: 8, positionSection: 3, remark: 'Good' },
    { id: 4, student: 'Alice Brown', score: 92, grade: 'A+', gradePoint: 4.0, positionClass: 1, positionSection: 1, remark: 'Excellent' }
  ];

  const years = ['2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];
  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];

  const exportToExcel = () => alert('Exporting to Excel...');
  const exportToPDF = () => alert('Exporting to PDF...');

  return (
    <div className="subject-results-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />Subject Results</h1>
        <p style={{ color: 'var(--secondary)' }}>View subject-level results per student</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={exportToExcel}><Download size={16} /> Excel</button><button className="button button-secondary" onClick={exportToPDF}><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select className="form-select" value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
        <select className="form-select" value={filters.term} onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select className="form-select" value={filters.subject} onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Total Score</th><th>Grade</th><th>Grade Point</th><th>Position in Class</th><th>Position in Section</th><th>Remark</th></tr></thead>
      <tbody>{results.sort((a, b) => a.positionClass - b.positionClass).map(r => (<tr key={r.id}><td><strong>{r.student}</strong></td>
      <td>{r.score}</td>
      <td><span className="status-badge status-active">{r.grade}</span></td>
      <td>{r.gradePoint}</td>
      <td><span className="position-badge">{r.positionClass}</span></td>
      <td><span className="position-badge">{r.positionSection}</span></td>
      <td>{r.remark}</td></tr>))}</tbody></table></div>
    </div>
  );
}

export default SubjectResults;