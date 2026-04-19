import { useState, useRef } from 'react';
import { Calendar, Users, MapPin, Printer, Download, Image, X } from 'lucide-react';
import '../../../styles/view-timetable.css';

function ViewTimetable() {
  const [activeTab, setActiveTab] = useState('class');
  const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
  const [selectedTeacher, setSelectedTeacher] = useState('Mr. John Doe');
  const [selectedRoom, setSelectedRoom] = useState('Room 101');
  const timetableRef = useRef(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    'Period 1 (8:00-8:45)', 
    'Period 2 (8:45-9:30)', 
    'Break (9:30-10:00)', 
    'Period 3 (10:00-10:45)', 
    'Period 4 (10:45-11:30)', 
    'Lunch (11:30-12:15)', 
    'Period 5 (12:15-13:00)'
  ];

  const classTimetable = {
    'JHS 1 Science': {
      'Monday': { 
        'Period 1': 'Mathematics - Mr. Doe (Rm 101)', 
        'Period 2': 'English - Mrs. Smith (Rm 102)', 
        'Period 3': 'Science - Dr. Wilson (Lab)', 
        'Period 4': 'Social Studies - Ms. Brown (Rm 103)' 
      },
      'Tuesday': { 
        'Period 1': 'English - Mrs. Smith (Rm 102)', 
        'Period 2': 'Mathematics - Mr. Doe (Rm 101)', 
        'Period 3': 'ICT - Mr. Johnson (Comp Lab)', 
        'Period 4': 'Science - Dr. Wilson (Lab)' 
      }
    }
  };

  const teacherTimetable = {
    'Mr. John Doe': {
      'Monday': { 
        'Period 1': 'JHS 1 Science - Rm 101', 
        'Period 2': 'JHS 2 Science - Rm 101', 
        'Period 3': 'SHS 1 Science - Rm 201' 
      }
    }
  };

  const roomTimetable = {
    'Room 101': {
      'Monday': { 
        'Period 1': 'JHS 1 Science - Mathematics', 
        'Period 2': 'JHS 2 Science - Mathematics' 
      }
    }
  };

  const getCurrentTimetable = () => {
    if (activeTab === 'class') return classTimetable[selectedClass] || {};
    if (activeTab === 'teacher') return teacherTimetable[selectedTeacher] || {};
    return roomTimetable[selectedRoom] || {};
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('Export to PDF functionality would be implemented here');
  };

  const handleExportImage = () => {
    alert('Export as image functionality would be implemented here');
  };

  return (
    <div className="view-timetable-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
            View Timetable
          </h1>
          <p style={{ color: 'var(--secondary)' }}>
            View published timetables by class, teacher, or room
          </p>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="print-actions">
        <button className="button button-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print
        </button>
        <button className="button button-secondary" onClick={handleExportPDF}>
          <Download size={16} /> Export PDF
        </button>
        <button className="button button-secondary" onClick={handleExportImage}>
          <Image size={16} /> Download Image
        </button>
      </div>

      <div className="view-tabs">
        <div 
          className={`view-tab ${activeTab === 'class' ? 'active' : ''}`} 
          onClick={() => setActiveTab('class')}
        >
          <Users size={16} /> By Class
        </div>
        <div 
          className={`view-tab ${activeTab === 'teacher' ? 'active' : ''}`} 
          onClick={() => setActiveTab('teacher')}
        >
          <Users size={16} /> By Teacher
        </div>
        <div 
          className={`view-tab ${activeTab === 'room' ? 'active' : ''}`} 
          onClick={() => setActiveTab('room')}
        >
          <MapPin size={16} /> By Room
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {activeTab === 'class' && (
          <select 
            className="form-select" 
            style={{ width: '250px' }} 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option>JHS 1 Science</option>
            <option>JHS 2 Science</option>
            <option>SHS 1 Science</option>
          </select>
        )}
        {activeTab === 'teacher' && (
          <select 
            className="form-select" 
            style={{ width: '250px' }} 
            value={selectedTeacher} 
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option>Mr. John Doe</option>
            <option>Mrs. Jane Smith</option>
            <option>Dr. James Wilson</option>
          </select>
        )}
        {activeTab === 'room' && (
          <select 
            className="form-select" 
            style={{ width: '250px' }} 
            value={selectedRoom} 
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            <option>Room 101</option>
            <option>Room 102</option>
            <option>Science Lab</option>
          </select>
        )}
      </div>

      <div className="timetable-view" ref={timetableRef}>
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Time / Day</th>
              {days.map(d => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period}>
                <th style={{ backgroundColor: 'var(--bg)' }}>{period}</th>
                {days.map(day => {
                  const lesson = getCurrentTimetable()[day]?.[period];
                  return (
                    <td key={`${day}-${period}`} className="timetable-cell">
                      {lesson || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewTimetable;