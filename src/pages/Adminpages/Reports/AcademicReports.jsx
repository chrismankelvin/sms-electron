import { useState } from 'react';
import { BookOpen, Download, Printer, Filter, TrendingUp, Award, BarChart3, X } from 'lucide-react';
import '../../../styles/academic-reports.css';

function AcademicReports() {
  const [reportType, setReportType] = useState('class');
  const [filters, setFilters] = useState({ year: '2024-2025', term: 'Term 1', class: 'JHS 1 Science' });
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { id: 'class', name: 'Class Performance Summary', description: 'Average per class, top/bottom students' },
    { id: 'subject', name: 'Subject Performance', description: 'Average per subject across all classes' },
    { id: 'grade', name: 'Grade Distribution', description: 'Count of A/B/C/D/F per class' },
    { id: 'passfail', name: 'Pass/Fail Analysis', description: 'Pass rate by class, subject' },
    { id: 'teacher', name: 'Teacher Performance', description: 'Average scores per teacher\'s classes' }
  ];

  const classPerformance = [
    { class: 'JHS 1 Science', average: 82.5, topStudent: 'John Doe (92%)', bottomStudent: 'Jane Smith (68%)' },
    { class: 'JHS 2 Science', average: 78.3, topStudent: 'Bob Johnson (89%)', bottomStudent: 'Alice Brown (65%)' },
    { class: 'SHS 1 Science', average: 75.8, topStudent: 'Charlie Wilson (88%)', bottomStudent: 'Diana Prince (62%)' }
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', average: 76.5, highest: 'JHS 1 Science (82%)', lowest: 'SHS 1 Science (71%)' },
    { subject: 'English', average: 81.2, highest: 'JHS 2 Science (85%)', lowest: 'SHS 1 Science (78%)' },
    { subject: 'Science', average: 79.8, highest: 'JHS 1 Science (84%)', lowest: 'JHS 2 Science (76%)' }
  ];

  const gradeDistribution = [
    { grade: 'A', count: 45 }, { grade: 'B', count: 78 }, { grade: 'C', count: 65 }, { grade: 'D', count: 42 }, { grade: 'F', count: 15 }
  ];

  const years = ['2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];

  const exportPDF = () => alert('Exporting to PDF...');
  const exportExcel = () => alert('Exporting to Excel...');

  const getReportTitle = () => reportTypes.find(r => r.id === reportType)?.name || 'Academic Report';

  return (
    <div className="academic-reports-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />Academic Reports</h1>
        <p style={{ color: 'var(--secondary)' }}>Academic performance reports</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={exportExcel}><Download size={16} /> Excel</button>
        <button className="button button-secondary" onClick={exportPDF}><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Report Type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {reportTypes.map(rt => (
            <label key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', background: reportType === rt.id ? 'var(--primary)' : 'transparent', color: reportType === rt.id ? 'white' : 'inherit', cursor: 'pointer' }}>
              <input type="radio" name="reportType" value={rt.id} checked={reportType === rt.id} onChange={(e) => setReportType(e.target.value)} style={{ display: 'none' }} />
              <div><strong>{rt.name}</strong><div style={{ fontSize: '0.75rem' }}>{rt.description}</div></div>
            </label>
          ))}
        </div>

        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <select className="form-select" value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
          <select className="form-select" value={filters.term} onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <button className="button" onClick={() => setShowPreview(true)}>Generate Report</button>
      </div>

      {showPreview && (
        <div className="card">
          <h3>{getReportTitle()} - {filters.term} {filters.year}</h3>
          
          {reportType === 'class' && (
            <div className="table-container">
              <table className="academic-years-table">
                <thead><tr><th>Class</th><th>Average Score</th><th>Top Student</th><th>Bottom Student</th></tr></thead>
                <tbody>{classPerformance.map(c => (<tr key={c.class}><td><strong>{c.class}</strong></td><td>{c.average}%</td><td>{c.topStudent}</td><td>{c.bottomStudent}</td></tr>))}</tbody>
              </table>
            </div>
          )}

          {reportType === 'subject' && (
            <div className="table-container">
              <table className="academic-years-table">
                <thead><tr><th>Subject</th><th>Average Score</th><th>Highest Performing Class</th><th>Lowest Performing Class</th></tr></thead>
                <tbody>{subjectPerformance.map(s => (<tr key={s.subject}><td><strong>{s.subject}</strong></td><td>{s.average}%</td><td>{s.highest}</td><td>{s.lowest}</td></tr>))}</tbody>
              </table>
            </div>
          )}

          {reportType === 'grade' && (
            <div className="performance-summary">
              {gradeDistribution.map(g => (<div key={g.grade} className="performance-card"><div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{g.count}</div><div>Grade {g.grade}</div></div>))}
            </div>
          )}

          {reportType === 'passfail' && (
            <div className="performance-summary">
              <div className="performance-card"><div className="text-success" style={{ fontSize: '2rem', fontWeight: 'bold' }}>78%</div><div>Pass Rate</div></div>
              <div className="performance-card"><div className="text-danger" style={{ fontSize: '2rem', fontWeight: 'bold' }}>22%</div><div>Fail Rate</div></div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button className="button button-secondary" onClick={() => setShowPreview(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicReports;