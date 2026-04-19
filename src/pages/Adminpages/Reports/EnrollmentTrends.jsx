import { useState } from 'react';
import { TrendingUp, PieChart, Download, Filter, Users, BarChart3, X } from 'lucide-react';
import '../../../styles/enrollment-trends.css';

function EnrollmentTrends() {
  const [filters, setFilters] = useState({ startYear: '2022', endYear: '2025' });

  const enrollmentData = [
    { year: '2022', total: 1150, jhs: 650, shs: 500 },
    { year: '2023', total: 1200, jhs: 680, shs: 520 },
    { year: '2024', total: 1247, jhs: 700, shs: 547 },
    { year: '2025', total: 1300, jhs: 730, shs: 570 }
  ];

  const programmeData = [
    { name: 'General Science', count: 320, percentage: 35 },
    { name: 'General Arts', count: 280, percentage: 30 },
    { name: 'Business', count: 200, percentage: 22 },
    { name: 'Visual Arts', count: 120, percentage: 13 }
  ];

  const sectionUtilization = [
    { section: 'JHS 1A', capacity: 40, enrollment: 38, utilization: 95 },
    { section: 'JHS 1B', capacity: 40, enrollment: 37, utilization: 92.5 },
    { section: 'JHS 1C', capacity: 40, enrollment: 25, utilization: 62.5 },
    { section: 'SHS 1 Science A', capacity: 45, enrollment: 44, utilization: 97.8 }
  ];

  const maxEnrollment = Math.max(...enrollmentData.map(d => d.total));

  return (
    <div className="enrollment-trends-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><TrendingUp size={28} style={{ display: 'inline', marginRight: '12px' }} />Enrollment Trends</h1>
        <p style={{ color: 'var(--secondary)' }}>Track student population changes</p></div>
        <button className="button button-secondary"><Download size={16} /> Export Charts</button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="trend-chart"><h3>Total Enrollment Over Academic Years</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
          {enrollmentData.map(d => (<div key={d.year} style={{ flex: 1, textAlign: 'center' }}><div style={{ height: `${(d.total / maxEnrollment) * 200}px`, background: '#3b82f6', borderRadius: '4px 4px 0 0' }}></div><div>{d.year}</div><div><strong>{d.total}</strong></div></div>))}
        </div>
      </div>

      <div className="trend-chart"><h3>Enrollment by Level (Stacked Bar)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
          {enrollmentData.map(d => (<div key={d.year} style={{ flex: 1, textAlign: 'center' }}><div><div style={{ height: `${(d.jhs / maxEnrollment) * 200}px`, background: '#10b981', borderRadius: '4px 4px 0 0' }}></div><div style={{ height: `${(d.shs / maxEnrollment) * 200}px`, background: '#8b5cf6', borderRadius: 0 }}></div></div><div>{d.year}</div><div><span style={{ color: '#10b981' }}>JHS: {d.jhs}</span> | <span style={{ color: '#8b5cf6' }}>SHS: {d.shs}</span></div></div>))}
        </div>
      </div>

      <div className="trend-chart"><h3>Gender Distribution</h3>
        <div className="donut-chart"></div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}><span style={{ color: '#3b82f6' }}>Male: 52%</span> | <span style={{ color: '#ec4898' }}>Female: 48%</span></div>
      </div>

      <div className="trend-chart"><h3>Programme Popularity (SHS)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {programmeData.map(p => (<div key={p.name}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{p.name}</span><span>{p.count} students ({p.percentage}%)</span></div>
          <div className="workload-bar-container"><div className="workload-bar normal" style={{ width: `${p.percentage}%` }}></div></div></div>))}
        </div>
      </div>

      <div className="trend-chart"><h3>Section Utilization (Capacity vs Enrollment)</h3>
        <div className="table-container"><table className="academic-years-table"><thead><tr><th>Section</th><th>Capacity</th><th>Enrollment</th><th>Utilization</th></tr></thead>
        <tbody>{sectionUtilization.map(s => (<tr key={s.section}><td>{s.section}</td><td>{s.capacity}</td><td>{s.enrollment}</td>
        <td><div className="workload-bar-container"><div className="workload-bar" style={{ width: `${s.utilization}%`, background: s.utilization > 90 ? '#ef4444' : s.utilization < 75 ? '#f59e0b' : '#10b981' }}></div></div><span style={{ fontSize: '0.7rem' }}>{s.utilization}%</span></td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}

export default EnrollmentTrends;