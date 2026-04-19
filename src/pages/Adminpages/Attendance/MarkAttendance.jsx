import { useState } from 'react';
import { Calendar, Users, Clock, Save, Copy, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import '../../../styles/mark-attendance.css';

function MarkAttendance() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Morning');
  const [attendance, setAttendance] = useState([]);

  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'SHS 1 Arts'];
  const periods = ['Morning', 'Afternoon', 'Full Day'];

  const students = [
    { id: 1, name: 'John Doe', number: 'STU001' },
    { id: 2, name: 'Jane Smith', number: 'STU002' },
    { id: 3, name: 'Bob Johnson', number: 'STU003' },
    { id: 4, name: 'Alice Brown', number: 'STU004' }
  ];

  const recentAttendance = {
    'John Doe': ['present', 'present', 'absent', 'late', 'present'],
    'Jane Smith': ['present', 'present', 'present', 'present', 'absent']
  };

  const handleClassSelect = () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }
    setAttendance(students.map(s => ({ 
      ...s, 
      status: 'present', 
      timeIn: new Date().toLocaleTimeString(), 
      reason: '' 
    })));
    setStep(2);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => prev.map(s => 
      s.id === studentId ? { ...s, status, reason: status === 'present' ? '' : s.reason } : s
    ));
  };

  const handleTimeChange = (studentId, time) => {
    setAttendance(prev => prev.map(s => s.id === studentId ? { ...s, timeIn: time } : s));
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendance(prev => prev.map(s => s.id === studentId ? { ...s, reason } : s));
  };

  const markAllPresent = () => {
    setAttendance(prev => prev.map(s => ({ ...s, status: 'present', reason: '' })));
  };

  const markAllAbsent = () => {
    setAttendance(prev => prev.map(s => ({ ...s, status: 'absent', reason: 'Unexcused' })));
  };

  const copyFromYesterday = () => {
    alert('Attendance copied from yesterday');
  };

  const handleSave = () => {
    alert(`Attendance saved for ${selectedClass} on ${selectedDate} (${selectedPeriod})`);
    console.log('Attendance data:', attendance);
    setStep(1);
  };

  return (
    <div className="mark-attendance-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />Mark Attendance</h1>
        <p style={{ color: 'var(--secondary)' }}>Daily attendance marking by class</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Select Attendance Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group"><label>Date</label><input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
            <div className="form-group"><label>Class</label><select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label>Period</label><select className="form-select" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>{periods.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <button className="button" onClick={handleClassSelect}>Load Students</button>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="summary-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div><strong>Class:</strong> {selectedClass} | <strong>Date:</strong> {selectedDate} | <strong>Period:</strong> {selectedPeriod}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button button-secondary" onClick={markAllPresent}><CheckCircle size={16} /> All Present</button>
                <button className="button button-secondary" onClick={markAllAbsent}><XCircle size={16} /> All Absent</button>
                <button className="button button-secondary" onClick={copyFromYesterday}><Copy size={16} /> Copy from Yesterday</button>
                <button className="button" onClick={handleSave}><Save size={16} /> Save</button>
              </div>
            </div>
          </div>

          <div className="attendance-grid">
            <table className="academic-years-table">
              <thead>
                <tr><th>Student Name</th><th>Student Number</th><th>Status</th><th>Time In</th><th>Reason (if absent/late)</th><th>Last 5 Days</th></tr>
              </thead>
              <tbody>
                {attendance.map(s => {
                  const recent = recentAttendance[s.name] || [];
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.number}</td>
                      <td>
                        <select className="form-select" value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} style={{ width: '120px' }}>
                          <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option>
                        </select>
                      </td>
                      <td><input type="time" className="form-input" value={s.timeIn} onChange={(e) => handleTimeChange(s.id, e.target.value)} disabled={s.status === 'absent'} style={{ width: '100px' }} /></td>
                      <td><input type="text" className="form-input" value={s.reason} onChange={(e) => handleReasonChange(s.id, e.target.value)} disabled={s.status === 'present'} placeholder="Reason" /></td>
                      <td><div className="attendance-dots">{recent.map((r, i) => (<div key={i} className={`attendance-dot dot-${r}`} title={r}></div>))}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MarkAttendance;