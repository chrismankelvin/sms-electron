import { useState } from 'react';
import { TrendingUp, BarChart3, Download, Filter, Activity, PieChart, X } from 'lucide-react';
import '../../../styles/performance-analytics.css';

function PerformanceAnalytics() {
  const [filters, setFilters] = useState({ year: '2024-2025', term: 'Term 1', level: 'JHS', programme: 'All' });

  const trendData = [
    { term: 'Term 1', year: '2022-2023', average: 72 }, { term: 'Term 2', year: '2022-2023', average: 74 },
    { term: 'Term 3', year: '2022-2023', average: 76 }, { term: 'Term 1', year: '2023-2024', average: 75 },
    { term: 'Term 2', year: '2023-2024', average: 77 }, { term: 'Term 3', year: '2023-2024', average: 79 },
    { term: 'Term 1', year: '2024-2025', average: 81 }
  ];

  const classComparison = [
    { class: 'JHS 1 Science', average: 82 }, { class: 'JHS 2 Science', average: 78 }, { class: 'SHS 1 Science', average: 75 }
  ];

  const heatmapData = [
    { subject: 'Math', 'JHS 1': 85, 'JHS 2': 78, 'SHS 1': 72 },
    { subject: 'English', 'JHS 1': 82, 'JHS 2': 80, 'SHS 1': 75 },
    { subject: 'Science', 'JHS 1': 88, 'JHS 2': 76, 'SHS 1': 70 }
  ];

  const scatterData = [
    { student: 'John Doe', attendance: 95, score: 88 }, { student: 'Jane Smith', attendance: 70, score: 65 },
    { student: 'Bob Johnson', attendance: 85, score: 78 }, { student: 'Alice Brown', attendance: 60, score: 55 }
  ];

  const years = ['2022-2023', '2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const levels = ['JHS', 'SHS', 'Both'];
  const programmes = ['All', 'Science', 'Arts', 'Business'];

  const getHeatmapClass = (score) => {
    if (score >= 80) return 'heatmap-high';
    if (score >= 65) return 'heatmap-medium';
    return 'heatmap-low';
  };

  return (
    <div className="performance-analytics-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><TrendingUp size={28} style={{ display: 'inline', marginRight: '12px' }} />Performance Analytics</h1>
        <p style={{ color: 'var(--secondary)' }}>Visual analytics dashboard for performance trends</p></div>
        <button className="button button-secondary"><Download size={16} /> Export Charts</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select className="form-select" value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
        <select className="form-select" value={filters.term} onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="form-select" value={filters.level} onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}>{levels.map(l => <option key={l} value={l}>{l}</option>)}</select>
        <select className="form-select" value={filters.programme} onChange={(e) => setFilters(prev => ({ ...prev, programme: e.target.value }))}>{programmes.map(p => <option key={p} value={p}>{p}</option>)}</select>
      </div>

      <div className="chart-container"><h3>Average Scores Across Terms (Trend Line)</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          {trendData.map((t, i) => (<div key={i} style={{ flex: 1, textAlign: 'center' }}><div style={{ height: `${t.average * 2}px`, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div><div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{t.term}<br />{t.year.split('-')[0]}</div><div>{t.average}%</div></div>))}
        </div>
      </div>

      <div className="chart-container"><h3>Class Performance Comparison</h3>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
          {classComparison.map(c => (<div key={c.class} style={{ textAlign: 'center' }}><div style={{ height: `${c.average * 2}px`, width: '60px', background: '#3b82f6', borderRadius: '4px 4px 0 0', margin: '0 auto' }}></div><div>{c.class}</div><div>{c.average}%</div></div>))}
        </div>
      </div>

      <div className="chart-container"><h3>Subject × Class Performance Heatmap</h3>
        <table className="academic-years-table"><thead><tr><th>Subject</th><th>JHS 1</th><th>JHS 2</th><th>SHS 1</th></tr></thead>
        <tbody>{heatmapData.map(row => (<tr key={row.subject}><td><strong>{row.subject}</strong></td>
        <td className={getHeatmapClass(row['JHS 1'])}>{row['JHS 1']}%</td>
        <td className={getHeatmapClass(row['JHS 2'])}>{row['JHS 2']}%</td>
        <td className={getHeatmapClass(row['SHS 1'])}>{row['SHS 1']}%</td></tr>))}</tbody></table>
      </div>

      <div className="chart-container"><h3>Attendance vs Performance Correlation</h3>
        <div style={{ height: '200px', position: 'relative', marginTop: '1rem' }}>
          {scatterData.map(s => (<div key={s.student} style={{ position: 'absolute', left: `${s.attendance * 0.8}%`, bottom: `${s.score * 0.8}%`, width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%', cursor: 'pointer' }} title={`${s.student}: ${s.attendance}% attendance, ${s.score}% score`}></div>))}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem' }}>Attendance % →</div>
          <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'rotate(-90deg)', fontSize: '0.7rem' }}>Score %</div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceAnalytics;