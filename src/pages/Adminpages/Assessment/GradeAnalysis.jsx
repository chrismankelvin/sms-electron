import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, Download, Printer, Filter, X, PieChart } from 'lucide-react';
import '../../../styles/grade-analysis.css';

function GradeAnalysis() {
  const [filters, setFilters] = useState({ year: '2024-2025', term: 'Term 1' });

  const gradeDistribution = [
    { grade: 'A', count: 45, color: '#10b981' },
    { grade: 'B', count: 78, color: '#3b82f6' },
    { grade: 'C', count: 65, color: '#f59e0b' },
    { grade: 'D', count: 42, color: '#ef4444' },
    { grade: 'F', count: 15, color: '#6b7280' }
  ];

  const classPerformance = [
    { name: 'JHS 1 Science', average: 82.5 },
    { name: 'JHS 2 Science', average: 78.3 },
    { name: 'SHS 1 Science', average: 75.8 },
    { name: 'SHS 1 Arts', average: 79.2 }
  ];

  const subjectPerformance = [
    { name: 'Mathematics', average: 76.5 },
    { name: 'English', average: 81.2 },
    { name: 'Science', average: 79.8 },
    { name: 'Social Studies', average: 74.3 }
  ];

  const topStudents = [
    { name: 'Alice Brown', score: 92, class: 'JHS 1 Science' },
    { name: 'John Doe', score: 88, class: 'JHS 1 Science' },
    { name: 'Jane Smith', score: 85, class: 'JHS 2 Science' }
  ];

  const genderBreakdown = { male: 52, female: 48 };
  const maxCount = Math.max(...gradeDistribution.map(g => g.count));
  const totalStudents = gradeDistribution.reduce((sum, g) => sum + g.count, 0);

  const years = ['2023-2024', '2024-2025'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  return (
    <div className="grade-analysis-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '12px' }} />Grade Analysis</h1>
        <p style={{ color: 'var(--secondary)' }}>Analytics dashboard for performance monitoring</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary"><Download size={16} /> Export Charts</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <select className="form-select" value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
        <select className="form-select" value={filters.term} onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
      </div>

      <div className="stats-cards" style={{ marginBottom: '1rem' }}>
        <div className="stat-card"><div className="stat-icon"><Users size={24} /></div><div className="stat-info"><div className="stat-value">{totalStudents}</div><div className="stat-label">Total Students</div></div></div>
        <div className="stat-card"><div className="stat-icon"><Award size={24} /></div><div className="stat-info"><div className="stat-value">{(gradeDistribution.filter(g => g.grade === 'A' || g.grade === 'B').reduce((sum, g) => sum + g.count, 0) / totalStudents * 100).toFixed(0)}%</div><div className="stat-label">A/B Rate</div></div></div>
        <div className="stat-card"><div className="stat-icon"><TrendingUp size={24} /></div><div className="stat-info"><div className="stat-value">{classPerformance.reduce((sum, c) => sum + c.average, 0) / classPerformance.length}%</div><div className="stat-label">School Average</div></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        <div className="chart-card"><div className="chart-title">Grade Distribution</div><div className="bar-chart">{gradeDistribution.map(g => (<div key={g.grade} style={{ flex: 1, textAlign: 'center' }}><div className="bar" style={{ height: `${(g.count / maxCount) * 150}px`, backgroundColor: g.color }}></div><div className="bar-label"><strong>{g.grade}</strong><br />{g.count}</div></div>))}</div></div>

        <div className="chart-card"><div className="chart-title">Class Performance Comparison</div>{classPerformance.map(c => (<div key={c.name}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span>{c.name}</span><span>{c.average}%</span></div><div className="workload-bar-container"><div className="workload-bar normal" style={{ width: `${c.average}%` }}></div></div></div>))}</div>

        <div className="chart-card"><div className="chart-title">Subject Performance Comparison</div>{subjectPerformance.map(s => (<div key={s.name}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span>{s.name}</span><span>{s.average}%</span></div><div className="workload-bar-container"><div className="workload-bar normal" style={{ width: `${s.average}%` }}></div></div></div>))}</div>

        <div className="chart-card"><div className="chart-title">Top 10 Students</div>{topStudents.map((s, i) => (<div key={i} className="student-item"><span><strong>#{i + 1}</strong> {s.name} ({s.class})</span><span className="text-success">{s.score}%</span></div>))}</div>

        <div className="chart-card"><div className="chart-title">Gender-Based Performance</div><div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}><div><div className="bar" style={{ width: '80px', height: `${genderBreakdown.male}px`, backgroundColor: '#3b82f6' }}></div><div>Male<br />{genderBreakdown.male}%</div></div><div><div className="bar" style={{ width: '80px', height: `${genderBreakdown.female}px`, backgroundColor: '#ec4898' }}></div><div>Female<br />{genderBreakdown.female}%</div></div></div></div>

        <div className="chart-card"><div className="chart-title">Year-over-Year Trend</div><div style={{ padding: '1rem', textAlign: 'center' }}><p>Current {filters.term} Average: <strong>79.5%</strong></p><p>Previous Year Same Term: <strong>76.2%</strong></p><p className="text-success">↑ +3.3% improvement</p></div></div>
      </div>
    </div>
  );
}

export default GradeAnalysis;