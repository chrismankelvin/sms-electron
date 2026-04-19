import { useState } from 'react';
import { Grid, BookOpen, Users, MapPin, AlertCircle, CheckCircle, Copy, Save, X } from 'lucide-react';
import '../../../styles/timetable-builder.css';

function TimetableBuilder() {
  const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [showValidation, setShowValidation] = useState(false);
  
  const [timetable, setTimetable] = useState({
    'JHS 1 Science': {
      'Monday': { 'Period 1': { subject: 'Mathematics', teacher: 'Mr. John Doe', room: 'Room 101' }, 'Period 2': { subject: 'English', teacher: 'Mrs. Jane Smith', room: 'Room 102' } },
      'Tuesday': { 'Period 1': { subject: 'Science', teacher: 'Dr. James Wilson', room: 'Science Lab' } }
    }
  });

  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH' },
    { id: 2, name: 'English', code: 'ENG' },
    { id: 3, name: 'Science', code: 'SCI' },
    { id: 4, name: 'Social Studies', code: 'SST' }
  ];

  const teachers = [
    { id: 1, name: 'Mr. John Doe', subject: 'Mathematics' },
    { id: 2, name: 'Mrs. Jane Smith', subject: 'English' },
    { id: 3, name: 'Dr. James Wilson', subject: 'Science' }
  ];

  const rooms = ['Room 101', 'Room 102', 'Science Lab', 'Computer Lab'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'];

  const [conflicts, setConflicts] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  const validateTimetable = () => {
    const newConflicts = [];
    const teacherSchedule = {};
    const roomSchedule = {};

    for (const day of days) {
      for (const period of periods) {
        const lesson = timetable[selectedClass]?.[day]?.[period];
        if (lesson) {
          const teacherKey = `${lesson.teacher}-${day}-${period}`;
          const roomKey = `${lesson.room}-${day}-${period}`;
          
          if (teacherSchedule[teacherKey]) newConflicts.push(`Teacher ${lesson.teacher} double-booked on ${day} ${period}`);
          if (roomSchedule[roomKey]) newConflicts.push(`Room ${lesson.room} double-booked on ${day} ${period}`);
          
          teacherSchedule[teacherKey] = true;
          roomSchedule[roomKey] = true;
        }
      }
    }
    setConflicts(newConflicts);
    setShowValidation(true);
  };

  const handleDrop = (day, period, item) => {
    const newTimetable = { ...timetable };
    if (!newTimetable[selectedClass]) newTimetable[selectedClass] = {};
    if (!newTimetable[selectedClass][day]) newTimetable[selectedClass][day] = {};
    
    newTimetable[selectedClass][day][period] = { 
      subject: item.name, 
      teacher: teachers.find(t => t.subject === item.name)?.name || 'Unassigned',
      room: 'Unassigned'
    };
    setTimetable(newTimetable);
  };

  const handleCopyFromPrevious = () => {
    alert('Copy timetable from previous year/term');
  };

  const handlePublish = () => {
    alert('Timetable published successfully! Teachers and students can now view it.');
  };

  return (
    <div className="timetable-builder">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Grid size={28} style={{ display: 'inline', marginRight: '12px' }} />Timetable Builder</h1>
        <p style={{ color: 'var(--secondary)' }}>Visual drag-and-drop timetable creation</p></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="button button-secondary" onClick={handleCopyFromPrevious}><Copy size={16} /> Copy from Previous</button>
          <button className="button button-secondary" onClick={validateTimetable}><AlertCircle size={16} /> Validate</button>
          <button className="button" onClick={handlePublish}><Save size={16} /> Publish</button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option>JHS 1 Science</option><option>JHS 2 Science</option><option>SHS 1 Science</option>
        </select>
        <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option>2023-2024</option><option>2024-2025</option>
        </select>
        <select className="form-select" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
      </div>

      <div className="builder-layout">
        <div className="sidebar">
          <div className="sidebar-section"><div className="sidebar-title"><BookOpen size={16} /> Subjects</div>
            {subjects.map(s => (<div key={s.id} className="drag-item" draggable onDragStart={() => setDraggedItem(s)}>{s.name} ({s.code})</div>))}
          </div>
          <div className="sidebar-section"><div className="sidebar-title"><Users size={16} /> Teachers</div>
            {teachers.map(t => (<div key={t.id} className="drag-item">{t.name} - {t.subject}</div>))}
          </div>
          <div className="sidebar-section"><div className="sidebar-title"><MapPin size={16} /> Rooms</div>
            {rooms.map(r => (<div key={r} className="drag-item">{r}</div>))}
          </div>
        </div>

        <div className="timetable-grid">
          <table className="timetable-table">
            <thead><tr><th>Time / Day</th>{days.map(d => <th key={d}>{d}</th>)}</tr></thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <th>{period}</th>
                  {days.map(day => {
                    const lesson = timetable[selectedClass]?.[day]?.[period];
                    return (
                      <td key={`${day}-${period}`} className="timetable-cell" onDragOver={(e) => e.preventDefault()} onDrop={() => draggedItem && handleDrop(day, period, draggedItem)}>
                        {lesson ? (<div className="lesson-info"><div className="lesson-subject">{lesson.subject}</div><div>{lesson.teacher}</div><div>{lesson.room}</div></div>) : <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showValidation && (
        <div className="validation-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong>Validation Results</strong><X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowValidation(false)} />
          </div>
          {conflicts.length === 0 ? (<div style={{ color: '#10b981' }}><CheckCircle size={14} /> No conflicts found!</div>) : 
            conflicts.map((c, i) => (<div key={i} style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>⚠ {c}</div>))}
        </div>
      )}
    </div>
  );
}

export default TimetableBuilder;