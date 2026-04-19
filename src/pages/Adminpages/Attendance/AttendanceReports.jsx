import { useState } from 'react';
import { BarChart3, Calendar as CalendarIcon, Download, Printer, Filter, Users, TrendingUp, X } from 'lucide-react';
import '../../../styles/attendance-reports.css';

function AttendanceReports() {
  const [activeReport, setActiveReport] = useState('daily');
  const [filters, setFilters] = useState({ startDate: '2024-03-01', endDate: '2024-03-07', class: 'JHS 1 Science' });

  const dailySummary = [
    { class: 'JHS 1 Science', present: 38, absent: 5, late: 2, percentage: 84.4 },
    { class: 'JHS 2 Science', present: 35, absent: 8, late: 2, percentage: 77.8 },
    { class: 'SHS 1 Science', present: 42, absent: 3, late: 0, percentage: 93.3 }
  ];

  const weeklySummary = [
    { name: 'John Doe', present: 5, absent: 0, late: 0, percentage: 100 },
    { name: 'Jane Smith', present: 4, absent: 1, late: 0, percentage: 80 },
    { name: 'Bob Johnson', present: 3, absent: 1, late: 1, percentage: 60 }
  ];

  const monthlyData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, status: ['present', 'absent', 'late'][Math.floor(Math.random() * 3)] }));

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science'];
  const years = ['2023-2024', '2024-2025'];

  const exportToExcel = () => alert('Exporting to Excel...');
  const exportToPDF = () => alert('Exporting to PDF...');

  return (
    <div className="attendance-reports-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '12px' }} />Attendance Reports</h1>
        <p style={{ color: 'var(--secondary)' }}>View attendance statistics and analytics</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="button button-secondary" onClick={exportToExcel}><Download size={16} /> Excel</button><button className="button button-secondary" onClick={exportToPDF}><Printer size={16} /> PDF</button></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="report-type-tabs">
        {['daily', 'weekly', 'monthly', 'term'].map(type => (<div key={type} className={`report-tab ${activeReport === type ? 'active' : ''}`} onClick={() => setActiveReport(type)}>{type.charAt(0).toUpperCase() + type.slice(1)} Summary</div>))}
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="date" className="form-input" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
        <input type="date" className="form-input" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
        <select className="form-select" value={filters.class} onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      {activeReport === 'daily' && (<div className="table-container"><table className="academic-years-table"><thead><tr><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead><tbody>{dailySummary.map(d => (<tr key={d.class}><td><strong>{d.class}</strong></td><td className="text-success">{d.present}</td><td className="text-danger">{d.absent}</td><td className="text-warning">{d.late}</td><td>{d.percentage}%</td></tr>))}</tbody></table></div>)}

      {activeReport === 'weekly' && (<div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead><tbody>{weeklySummary.map(s => (<tr key={s.name}><td><strong>{s.name}</strong></td><td className="text-success">{s.present}</td><td className="text-danger">{s.absent}</td><td className="text-warning">{s.late}</td><td>{s.percentage}%</td></tr>))}</tbody></table></div>)}

      {activeReport === 'monthly' && (<div className="calendar-view">{monthlyData.map(day => (<div key={day.day} className={`calendar-day-cell ${day.status}`}><div>{day.day}</div><div className={`attendance-dot dot-${day.status}`} style={{ margin: '0 auto' }}></div></div>))}</div>)}

      {activeReport === 'term' && (<div className="stats-cards"><div className="stat-card"><div className="stat-value">92.5%</div><div className="stat-label">Overall Attendance</div></div>
      <div className="stat-card"><div className="stat-value">85.2%</div><div className="stat-label">JHS Average</div></div><div className="stat-card"><div className="stat-value">94.8%</div><div className="stat-label">SHS Average</div></div></div>)}
    </div>
  );
}

export default AttendanceReports;