import { useState } from 'react';
import { History, Search, Calendar, TrendingUp, Award, Users, Clock, X } from 'lucide-react';
import '../../../styles/student-history.css';

function StudentHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    { id: 1, name: 'John Doe', number: 'STU001' },
    { id: 2, name: 'Jane Smith', number: 'STU002' }
  ];

  const historyData = {
    'John Doe': {
      timeline: [
        { year: '2022-2023', class: 'JHS 1A', average: 72, status: 'Promoted to JHS 2A', date: '2023-07-15' },
        { year: '2023-2024', class: 'JHS 2A', average: 68, status: 'Promoted to JHS 3A', date: '2024-07-10' },
        { year: '2024-2025', class: 'JHS 3A', average: 75, status: 'Graduated', date: '2025-06-20' }
      ],
      classChanges: [
        { date: '2023-01-15', from: 'JHS 1B', to: 'JHS 1A', reason: 'Section change' }
      ],
      results: [
        { term: 'Term 1', year: '2024', average: 78, grade: 'A' },
        { term: 'Term 2', year: '2024', average: 72, grade: 'B+' }
      ],
      attendance: { term1: 92, term2: 88, term3: 95 }
    }
  };

  const handleSearch = () => {
    const found = students.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.number.includes(searchTerm));
    if (found) { setSelectedStudent(found); }
    else { alert('Student not found'); }
  };

  const data = selectedStudent ? historyData[selectedStudent.name] : null;

  return (
    <div className="student-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><History size={28} style={{ display: 'inline', marginRight: '12px' }} />Student History</h1>
        <p style={{ color: 'var(--secondary)' }}>Timeline view of student's academic journey</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card" style={{ marginBottom: '1rem' }}><div style={{ display: 'flex', gap: '1rem' }}><input type="text" className="form-input" placeholder="Search by student name or number" style={{ flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <button className="button" onClick={handleSearch}><Search size={16} /> Search</button></div></div>

      {selectedStudent && data && (<div><div className="history-card"><h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{selectedStudent.name} ({selectedStudent.number})</h3></div>

      <div className="history-card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Academic Timeline</h3><div className="timeline">{data.timeline.map((item, i) => (<div key={i} className="timeline-item"><div className="timeline-year">{item.year}</div>
      <div><strong>{item.class}</strong> - Average: {item.average}%</div><div>{item.status}</div><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{item.date}</div></div>))}</div></div>

      <div className="history-card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Class Changes</h3>{data.classChanges.map((c, i) => (<div key={i} className="student-item"><span>{c.date}: {c.from} → {c.to}</span><span>{c.reason}</span></div>))}</div>

      <div className="history-card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Results Summary</h3><div className="table-container"><table className="academic-years-table"><thead><tr><th>Term</th><th>Year</th><th>Average</th><th>Grade</th></tr></thead>
      <tbody>{data.results.map((r, i) => (<tr key={i}><td>{r.term}</td><td>{r.year}</td><td>{r.average}%</td><td className="status-badge status-active">{r.grade}</td></tr>))}</tbody></table></div></div>

      <div className="history-card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Attendance Summary</h3><div className="stats-cards"><div className="stat-card"><div className="stat-value">{data.attendance.term1}%</div><div className="stat-label">Term 1</div></div>
      <div className="stat-card"><div className="stat-value">{data.attendance.term2}%</div><div className="stat-label">Term 2</div></div><div className="stat-card"><div className="stat-value">{data.attendance.term3}%</div><div className="stat-label">Term 3</div></div></div></div></div>)}
    </div>
  );
}

export default StudentHistory;