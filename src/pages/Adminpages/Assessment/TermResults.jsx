
import { useState } from 'react';
import { BarChart3, Download, Printer, Trophy, Users, CheckCircle, XCircle } from 'lucide-react';
// import '../../../styles/term-results.css';

function TermResults() {
  const [filters, setFilters] = useState({ year: '2024-2025', term: 'Term 1', class: 'JHS 1 Science' });

  const results = [
    { id: 1, student: 'John Doe', average: 85.5, overallGrade: 'A', positionClass: 1, positionSection: 1, subjectsPassed: 8, subjectsFailed: 0 },
    { id: 2, student: 'Jane Smith', average: 72.3, overallGrade: 'B+', positionClass: 5, positionSection: 2, subjectsPassed: 7, subjectsFailed: 1 },
    { id: 3, student: 'Bob Johnson', average: 68.2, overallGrade: 'C', positionClass: 10, positionSection: 3, subjectsPassed: 6, subjectsFailed: 2 },
    { id: 4, student: 'Alice Brown', average: 91.0, overallGrade: 'A+', positionClass: 1, positionSection: 1, subjectsPassed: 8, subjectsFailed: 0 }
  ];

  const years = ['2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];

  const classAverage = results.reduce((sum, r) => sum + r.average, 0) / results.length;
  const passRate = (results.filter(r => r.average >= 50).length / results.length) * 100;

  return (
    <div className="term-results-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '12px' }} />Term Results</h1>
        <p style={{ color: 'var(--secondary)' }}>View term-level aggregated results per student</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary"><Download size={16} /> Excel</button><button className="button button-secondary"><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="stats-cards" style={{ marginBottom: '1rem' }}>
        <div className="stat-card"><div className="stat-icon"><Users size={24} /></div><div className="stat-info"><div className="stat-value">{results.length}</div><div className="stat-label">Total Students</div></div></div>
        <div className="stat-card"><div className="stat-icon"><Trophy size={24} /></div><div className="stat-info"><div className="stat-value">{classAverage.toFixed(1)}%</div><div className="stat-label">Class Average</div></div></div>
        <div className="stat-card"><div className="stat-icon"><CheckCircle size={24} /></div><div className="stat-info"><div className="stat-value">{passRate.toFixed(0)}%</div><div className="stat-label">Pass Rate</div></div></div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select className="form-select" value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
        <select className="form-select" value={filters.term} onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      <div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Average Score</th><th>Overall Grade</th><th>Position in Class</th><th>Position in Section</th><th>Subjects Passed</th><th>Subjects Failed</th></tr></thead>
      <tbody>{results.sort((a, b) => a.positionClass - b.positionClass).map(r => (<tr key={r.id}><td><strong>{r.student}</strong></td>
      <td>{r.average}%</td><td><span className="status-badge status-active">{r.overallGrade}</span></td><td><span className="position-badge">{r.positionClass}</span></td><td>{r.positionSection}</td>
      <td><span className="text-success">{r.subjectsPassed}</span> / {r.subjectsPassed + r.subjectsFailed}</td><td>{r.subjectsFailed > 0 ? <span className="text-danger">{r.subjectsFailed}</span> : '-'}</td></tr>))}</tbody></table></div>
    </div>
  );
}

export default TermResults;