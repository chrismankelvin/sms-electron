// import { useState, useRef } from 'react';
// import { Calendar, Users, MapPin, Printer, Download, Image, X } from 'lucide-react';
// import '../../../styles/view-timetable.css';

// function ViewTimetable() {
//   const [activeTab, setActiveTab] = useState('class');
//   const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
//   const [selectedTeacher, setSelectedTeacher] = useState('Mr. John Doe');
//   const [selectedRoom, setSelectedRoom] = useState('Room 101');
//   const timetableRef = useRef(null);

//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//   const periods = [
//     'Period 1 (8:00-8:45)', 
//     'Period 2 (8:45-9:30)', 
//     'Break (9:30-10:00)', 
//     'Period 3 (10:00-10:45)', 
//     'Period 4 (10:45-11:30)', 
//     'Lunch (11:30-12:15)', 
//     'Period 5 (12:15-13:00)'
//   ];

//   const classTimetable = {
//     'JHS 1 Science': {
//       'Monday': { 
//         'Period 1': 'Mathematics - Mr. Doe (Rm 101)', 
//         'Period 2': 'English - Mrs. Smith (Rm 102)', 
//         'Period 3': 'Science - Dr. Wilson (Lab)', 
//         'Period 4': 'Social Studies - Ms. Brown (Rm 103)' 
//       },
//       'Tuesday': { 
//         'Period 1': 'English - Mrs. Smith (Rm 102)', 
//         'Period 2': 'Mathematics - Mr. Doe (Rm 101)', 
//         'Period 3': 'ICT - Mr. Johnson (Comp Lab)', 
//         'Period 4': 'Science - Dr. Wilson (Lab)' 
//       }
//     }
//   };

//   const teacherTimetable = {
//     'Mr. John Doe': {
//       'Monday': { 
//         'Period 1': 'JHS 1 Science - Rm 101', 
//         'Period 2': 'JHS 2 Science - Rm 101', 
//         'Period 3': 'SHS 1 Science - Rm 201' 
//       }
//     }
//   };

//   const roomTimetable = {
//     'Room 101': {
//       'Monday': { 
//         'Period 1': 'JHS 1 Science - Mathematics', 
//         'Period 2': 'JHS 2 Science - Mathematics' 
//       }
//     }
//   };

//   const getCurrentTimetable = () => {
//     if (activeTab === 'class') return classTimetable[selectedClass] || {};
//     if (activeTab === 'teacher') return teacherTimetable[selectedTeacher] || {};
//     return roomTimetable[selectedRoom] || {};
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleExportPDF = () => {
//     alert('Export to PDF functionality would be implemented here');
//   };

//   const handleExportImage = () => {
//     alert('Export as image functionality would be implemented here');
//   };

//   return (
//     <div className="view-timetable-container">
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: '1.5rem', 
//         flexWrap: 'wrap', 
//         gap: '1rem' 
//       }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             View Timetable
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>
//             View published timetables by class, teacher, or room
//           </p>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="print-actions">
//         <button className="button button-secondary" onClick={handlePrint}>
//           <Printer size={16} /> Print
//         </button>
//         <button className="button button-secondary" onClick={handleExportPDF}>
//           <Download size={16} /> Export PDF
//         </button>
//         <button className="button button-secondary" onClick={handleExportImage}>
//           <Image size={16} /> Download Image
//         </button>
//       </div>

//       <div className="view-tabs">
//         <div 
//           className={`view-tab ${activeTab === 'class' ? 'active' : ''}`} 
//           onClick={() => setActiveTab('class')}
//         >
//           <Users size={16} /> By Class
//         </div>
//         <div 
//           className={`view-tab ${activeTab === 'teacher' ? 'active' : ''}`} 
//           onClick={() => setActiveTab('teacher')}
//         >
//           <Users size={16} /> By Teacher
//         </div>
//         <div 
//           className={`view-tab ${activeTab === 'room' ? 'active' : ''}`} 
//           onClick={() => setActiveTab('room')}
//         >
//           <MapPin size={16} /> By Room
//         </div>
//       </div>

//       <div style={{ marginBottom: '1rem' }}>
//         {activeTab === 'class' && (
//           <select 
//             className="form-select" 
//             style={{ width: '250px' }} 
//             value={selectedClass} 
//             onChange={(e) => setSelectedClass(e.target.value)}
//           >
//             <option>JHS 1 Science</option>
//             <option>JHS 2 Science</option>
//             <option>SHS 1 Science</option>
//           </select>
//         )}
//         {activeTab === 'teacher' && (
//           <select 
//             className="form-select" 
//             style={{ width: '250px' }} 
//             value={selectedTeacher} 
//             onChange={(e) => setSelectedTeacher(e.target.value)}
//           >
//             <option>Mr. John Doe</option>
//             <option>Mrs. Jane Smith</option>
//             <option>Dr. James Wilson</option>
//           </select>
//         )}
//         {activeTab === 'room' && (
//           <select 
//             className="form-select" 
//             style={{ width: '250px' }} 
//             value={selectedRoom} 
//             onChange={(e) => setSelectedRoom(e.target.value)}
//           >
//             <option>Room 101</option>
//             <option>Room 102</option>
//             <option>Science Lab</option>
//           </select>
//         )}
//       </div>

//       <div className="timetable-view" ref={timetableRef}>
//         <table className="timetable-table">
//           <thead>
//             <tr>
//               <th>Time / Day</th>
//               {days.map(d => (
//                 <th key={d}>{d}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {periods.map(period => (
//               <tr key={period}>
//                 <th style={{ backgroundColor: 'var(--bg)' }}>{period}</th>
//                 {days.map(day => {
//                   const lesson = getCurrentTimetable()[day]?.[period];
//                   return (
//                     <td key={`${day}-${period}`} className="timetable-cell">
//                       {lesson || '—'}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default ViewTimetable;







// src/components/Academics/ViewTimetable.jsx

import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Printer, 
  Download, 
  Image as ImageIcon, 
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../../../styles/view-timetable.css';
// import { timetableService } from '../../../services/timetableService';
// import { classService } from '../../../services/classService';
// import { staffService } from '../../../services/staffService';
import { roomService } from '../../../services/roomService';
import { weekDayService } from '../../../services/weekDayService';
import { timeSlotService } from '../../../services/timeSlotService';
// import { academicYearService } from '../../../services/academicYearService';

function ViewTimetable() {
  const [activeTab, setActiveTab] = useState('class');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState(null);
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const timetableRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load timetable when selection changes
  useEffect(() => {
    if (selectedYearId) {
      loadTimetable();
    }
  }, [activeTab, selectedClassId, selectedTeacherId, selectedRoomId, selectedYearId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [
        classesData,
        teachersData,
        roomsData,
        academicYearsData,
        daysData,
        timeSlotsData
      ] = await Promise.all([
        classService.getAll().catch(() => []),
        staffService.getAll().catch(() => []),
        roomService.getAll().catch(() => []),
        academicYearService.getAll().catch(() => []),
        weekDayService.getActive().catch(() => [
          { id: 1, name: 'Monday' },
          { id: 2, name: 'Tuesday' },
          { id: 3, name: 'Wednesday' },
          { id: 4, name: 'Thursday' },
          { id: 5, name: 'Friday' }
        ]),
        timeSlotService.getAll().catch(() => [
          { id: 1, name: 'Period 1', start_time: '08:00', end_time: '08:45' },
          { id: 2, name: 'Period 2', start_time: '08:45', end_time: '09:30' },
          { id: 3, name: 'Break', start_time: '09:30', end_time: '10:00', is_break: true },
          { id: 4, name: 'Period 3', start_time: '10:00', end_time: '10:45' },
          { id: 5, name: 'Period 4', start_time: '10:45', end_time: '11:30' },
          { id: 6, name: 'Lunch', start_time: '11:30', end_time: '12:15', is_break: true },
          { id: 7, name: 'Period 5', start_time: '12:15', end_time: '13:00' }
        ])
      ]);
      
      setClasses(classesData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setAcademicYears(academicYearsData);
      setDays(daysData);
      setTimeSlots(timeSlotsData);
      
      // Set default selections
      const currentYear = academicYearsData.find(y => y.is_current);
      if (currentYear) {
        setSelectedYearId(currentYear.id);
      } else if (academicYearsData.length > 0) {
        setSelectedYearId(academicYearsData[0].id);
      }
      
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
      if (teachersData.length > 0) {
        setSelectedTeacherId(teachersData[0].id);
      }
      if (roomsData.length > 0) {
        setSelectedRoomId(roomsData[0].id);
      }
      
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      
      let data = {};
      
      if (activeTab === 'class' && selectedClassId) {
        const result = await timetableService.getByClass(selectedClassId, selectedYearId);
        data = result.timetable || {};
      } else if (activeTab === 'teacher' && selectedTeacherId) {
        // For teacher timetable - would need a separate API endpoint
        // Using mock data for now
        data = getMockTeacherTimetable(selectedTeacherId);
      } else if (activeTab === 'room' && selectedRoomId) {
        // For room timetable - would need a separate API endpoint
        // Using mock data for now
        data = getMockRoomTimetable(selectedRoomId);
      }
      
      setTimetableData(data);
      
    } catch (error) {
      showAlert('Failed to load timetable: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMockTeacherTimetable = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const teacherName = teacher ? `${teacher.first_name} ${teacher.surname}` : 'Teacher';
    
    return {
      'Monday': {
        'Period 1': `${teacherName} - JHS 1 Science - Room 101`,
        'Period 2': `${teacherName} - JHS 2 Science - Room 101`
      },
      'Tuesday': {
        'Period 1': `${teacherName} - SHS 1 Science - Room 201`
      }
    };
  };

  const getMockRoomTimetable = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room ? room.room_name : 'Room';
    
    return {
      'Monday': {
        'Period 1': `JHS 1 Science - Mathematics - ${roomName}`,
        'Period 2': `JHS 2 Science - Mathematics - ${roomName}`
      },
      'Tuesday': {
        'Period 1': `SHS 1 Science - Physics - ${roomName}`
      }
    };
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const getLessonDisplay = (day, periodSlot) => {
    const lesson = timetableData[day]?.[periodSlot];
    if (!lesson) return '—';
    
    if (typeof lesson === 'string') {
      return lesson;
    }
    
    return `${lesson.subject} - ${lesson.teacher} (${lesson.room})`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    showAlert('PDF export functionality will be available soon', 'info');
  };

  const handleExportImage = () => {
    showAlert('Image export functionality will be available soon', 'info');
  };

  const getCurrentSelectionOptions = () => {
    if (activeTab === 'class') {
      return classes.map(c => ({ id: c.id, name: c.class_name }));
    } else if (activeTab === 'teacher') {
      return teachers.map(t => ({ id: t.id, name: `${t.first_name} ${t.surname}` }));
    } else {
      return rooms.filter(r => r.is_active).map(r => ({ id: r.id, name: r.room_name }));
    }
  };

  const getCurrentSelectionValue = () => {
    if (activeTab === 'class') return selectedClassId;
    if (activeTab === 'teacher') return selectedTeacherId;
    return selectedRoomId;
  };

  const handleSelectionChange = (value) => {
    if (activeTab === 'class') setSelectedClassId(parseInt(value));
    else if (activeTab === 'teacher') setSelectedTeacherId(parseInt(value));
    else setSelectedRoomId(parseInt(value));
  };

  if (loading && !timetableData) {
    return (
      <div className="view-timetable-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  const options = getCurrentSelectionOptions();
  const currentValue = getCurrentSelectionValue();

  return (
    <div className="view-timetable-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : 
             alert.type === 'info' ? <AlertCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      <div className="view-header">
        <div className="header-title">
          <h1>
            <Calendar size={28} />
            View Timetable
          </h1>
          <p>View published timetables by class, teacher, or room</p>
        </div>
        <div className="print-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
          <button className="btn-secondary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn-secondary" onClick={handleExportImage}>
            <ImageIcon size={16} /> Download Image
          </button>
        </div>
      </div>
      <hr className="divider" />

      {/* Tabs */}
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

      {/* Filters */}
      <div className="view-filters">
        <div className="filter-group">
          <label>Academic Year</label>
          <select 
            className="form-select" 
            value={selectedYearId || ''} 
            onChange={(e) => setSelectedYearId(parseInt(e.target.value))}
          >
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.year_label}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>{activeTab === 'class' ? 'Class' : activeTab === 'teacher' ? 'Teacher' : 'Room'}</label>
          <select 
            className="form-select" 
            value={currentValue || ''} 
            onChange={(e) => handleSelectionChange(e.target.value)}
          >
            {options.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Display */}
      <div className="timetable-view-wrapper" ref={timetableRef}>
        <div className="timetable-info">
          <div className="info-item">
            <strong>Title:</strong> {activeTab === 'class' ? 'Class Timetable' : activeTab === 'teacher' ? 'Teacher Timetable' : 'Room Timetable'}
          </div>
          <div className="info-item">
            <strong>Current as of:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="timetable-view">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Time / Day</th>
                {days.map(day => (
                  <th key={day.id}>{day.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.id} className={slot.is_break ? 'break-row' : ''}>
                  <th className="time-slot-cell">
                    <div className="time-slot-name">{slot.name}</div>
                    <div className="time-slot-range">{slot.start_time} - {slot.end_time}</div>
                  </th>
                  {days.map(day => {
                    const lesson = getLessonDisplay(day.name, slot.name);
                    return (
                      <td key={`${day.id}-${slot.id}`} className="timetable-cell">
                        {lesson !== '—' ? (
                          <div className="lesson-content">{lesson}</div>
                        ) : (
                          <span className="empty-lesson">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewTimetable;