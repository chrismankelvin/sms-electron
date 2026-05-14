// src/components/Academics/TimetableBuilder.jsx

import { useState, useEffect } from 'react';
import { 
  Grid, 
  BookOpen, 
  Users, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Save, 
  X,
  Loader,
  Trash2
} from 'lucide-react';
import '../../../styles/timetable-builder.css';
// import { timetableService } from '../../../services/timetableService'; // no
// import { classService } from '../../../services/classService'; // no
// import { subjectService } from '../../../services/subjectService';// no
// import { staffService } from '../../../services/staffService'; // no
import { roomService } from '../../../services/roomService'; //yes
import { weekDayService } from '../../../services/weekDayService'; //yes
import { timeSlotService } from '../../../services/timeSlotService'; //yes
// import { academicYearService } from '../../../services/academicYearService'; // no

function TimetableBuilder() {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [timetableMatrix, setTimetableMatrix] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load all required data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load timetable when class or year changes
  useEffect(() => {
    if (selectedClassId && selectedYearId) {
      loadTimetable();
    }
  }, [selectedClassId, selectedYearId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [
        classesData,
        academicYearsData,
        subjectsData,
        teachersData,
        roomsData,
        daysData,
        timeSlotsData
      ] = await Promise.all([
        classService.getAll(),
        academicYearService.getAll(),
        subjectService.getAll(),
        staffService.getAll(),
        roomService.getAll(),
        weekDayService.getActive(),
        timeSlotService.getAll()
      ]);
      
      setClasses(classesData);
      setAcademicYears(academicYearsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setRooms(roomsData);
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
    } catch (error) {
      showAlert('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await timetableService.getByClass(selectedClassId, selectedYearId);
      setTimetableData(data);
      
      // Build matrix for easy access
      const matrix = {};
      for (const day of days) {
        matrix[day.name] = {};
        for (const slot of timeSlots) {
          const lesson = data.timetable[day.name]?.[slot.name];
          matrix[day.name][slot.name] = lesson || null;
        }
      }
      setTimetableMatrix(matrix);
    } catch (error) {
      showAlert('Failed to load timetable: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleDrop = async (dayName, timeSlotName, item) => {
    if (!item || !item.id) return;
    
    const day = days.find(d => d.name === dayName);
    const timeSlot = timeSlots.find(ts => ts.name === timeSlotName);
    
    if (!day || !timeSlot) return;
    
    let entryData = {};
    
    if (draggedItemType === 'subject') {
      const subject = subjects.find(s => s.id === item.id);
      const qualifiedTeacher = teachers.find(t => 
        t.qualifications?.some(q => q.subject_id === item.id)
      );
      
      entryData = {
        class_id: selectedClassId,
        subject_id: item.id,
        staff_id: qualifiedTeacher?.id || null,
        day_id: day.id,
        time_slot_id: timeSlot.id,
        academic_year_id: selectedYearId,
        room: null
      };
    } else if (draggedItemType === 'teacher') {
      entryData = {
        class_id: selectedClassId,
        subject_id: null,
        staff_id: item.id,
        day_id: day.id,
        time_slot_id: timeSlot.id,
        academic_year_id: selectedYearId,
        room: null
      };
    } else if (draggedItemType === 'room') {
      entryData = {
        class_id: selectedClassId,
        subject_id: null,
        staff_id: null,
        day_id: day.id,
        time_slot_id: timeSlot.id,
        academic_year_id: selectedYearId,
        room: item.name
      };
    }
    
    try {
      setSaving(true);
      const result = await timetableService.createEntry(entryData);
      
      if (result.success) {
        showAlert('Lesson added successfully!', 'success');
        await loadTimetable();
      } else if (result.conflicts) {
        showAlert('Conflicts detected! Please resolve them.', 'error');
        setConflicts(result.conflicts);
        setShowValidation(true);
      }
    } catch (error) {
      showAlert('Failed to add lesson: ' + error.message, 'error');
    } finally {
      setSaving(false);
      setDraggedItem(null);
      setDraggedItemType(null);
    }
  };

  const handleDeleteLesson = async (dayName, timeSlotName) => {
    const day = days.find(d => d.name === dayName);
    const timeSlot = timeSlots.find(ts => ts.name === timeSlotName);
    const lesson = timetableMatrix[dayName]?.[timeSlotName];
    
    if (!lesson || !lesson.entry_id) return;
    
    if (window.confirm('Remove this lesson from the timetable?')) {
      try {
        setSaving(true);
        await timetableService.deleteEntry(lesson.entry_id);
        showAlert('Lesson removed successfully!', 'success');
        await loadTimetable();
      } catch (error) {
        showAlert('Failed to remove lesson: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleValidate = async () => {
    try {
      setSaving(true);
      const result = await timetableService.validate(selectedClassId, selectedYearId);
      setConflicts(result.conflicts);
      setShowValidation(true);
      
      if (!result.has_conflicts) {
        showAlert('No conflicts found! Timetable is valid.', 'success');
      } else {
        showAlert(`${result.conflicts.length} conflict(s) found!`, 'error');
      }
    } catch (error) {
      showAlert('Failed to validate: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFromPrevious = async () => {
    const previousYear = academicYears.find(y => y.id !== selectedYearId);
    if (!previousYear) {
      showAlert('No previous academic year found to copy from.', 'error');
      return;
    }
    
    if (window.confirm(`Copy timetable from ${previousYear.year_label} to ${academicYears.find(y => y.id === selectedYearId)?.year_label}? This will overwrite existing entries.`)) {
      try {
        setSaving(true);
        const result = await timetableService.copyTimetable(selectedClassId, previousYear.id, selectedClassId, selectedYearId);
        showAlert(`Copied ${result.copied_count} entries successfully!`, 'success');
        await loadTimetable();
      } catch (error) {
        showAlert('Failed to copy: ' + error.message, 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePublish = async () => {
    // This would publish the timetable for students and teachers to view
    showAlert('Timetable published successfully!', 'success');
  };

  const getSubjectById = (subjectId) => {
    return subjects.find(s => s.id === subjectId);
  };

  const getTeacherById = (teacherId) => {
    return teachers.find(t => t.id === teacherId);
  };

  if (loading && !timetableData) {
    return (
      <div className="timetable-builder">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-builder">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Grid size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Timetable Builder
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Visual drag-and-drop timetable creation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="button button-secondary" 
            onClick={handleCopyFromPrevious}
            disabled={saving}
          >
            <Copy size={16} /> Copy from Previous
          </button>
          <button 
            className="button button-secondary" 
            onClick={handleValidate}
            disabled={saving}
          >
            <AlertCircle size={16} /> Validate
          </button>
          <button 
            className="button" 
            onClick={handlePublish}
            disabled={saving}
          >
            <Save size={16} /> Publish
          </button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select 
          className="form-select" 
          value={selectedClassId || ''} 
          onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
          disabled={saving}
        >
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.class_name}</option>
          ))}
        </select>
        <select 
          className="form-select" 
          value={selectedYearId || ''} 
          onChange={(e) => setSelectedYearId(parseInt(e.target.value))}
          disabled={saving}
        >
          {academicYears.map(year => (
            <option key={year.id} value={year.id}>{year.year_label}</option>
          ))}
        </select>
      </div>

      <div className="builder-layout">
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title"><BookOpen size={16} /> Subjects</div>
            {subjects.filter(s => s.type === 'core' || s.type === 'elective').map(s => (
              <div 
                key={s.id} 
                className="drag-item" 
                draggable={!saving}
                onDragStart={() => {
                  setDraggedItem(s);
                  setDraggedItemType('subject');
                }}
              >
                {s.name} ({s.code})
              </div>
            ))}
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title"><Users size={16} /> Teachers</div>
            {teachers.map(t => (
              <div 
                key={t.id} 
                className="drag-item" 
                draggable={!saving}
                onDragStart={() => {
                  setDraggedItem(t);
                  setDraggedItemType('teacher');
                }}
              >
                {t.first_name} {t.surname}
              </div>
            ))}
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title"><MapPin size={16} /> Rooms</div>
            {rooms.filter(r => r.is_active).map(r => (
              <div 
                key={r.id} 
                className="drag-item" 
                draggable={!saving}
                onDragStart={() => {
                  setDraggedItem(r);
                  setDraggedItemType('room');
                }}
              >
                {r.room_name}
              </div>
            ))}
          </div>
        </div>

        <div className="timetable-grid">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Time / Day</th>
                {days.map(d => <th key={d.id}>{d.name}</th>)}
               </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.id}>
                  <th>{slot.name}<br/><span style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>{slot.start_time} - {slot.end_time}</span></th>
                  {days.map(day => {
                    const lesson = timetableMatrix[day.name]?.[slot.name];
                    return (
                      <td 
                        key={`${day.id}-${slot.id}`} 
                        className={`timetable-cell ${lesson ? 'has-lesson' : ''}`}
                        onDragOver={(e) => e.preventDefault()} 
                        onDrop={() => draggedItem && handleDrop(day.name, slot.name, draggedItem)}
                      >
                        {lesson ? (
                          <div className="lesson-info">
                            <div className="lesson-subject">{lesson.subject}</div>
                            <div className="lesson-teacher">{lesson.teacher}</div>
                            <div className="lesson-room">{lesson.room}</div>
                            <button 
                              className="lesson-delete"
                              onClick={() => handleDeleteLesson(day.name, slot.name)}
                              disabled={saving}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.3 }}>—</span>
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

      {showValidation && (
        <div className="validation-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong>Validation Results</strong>
            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowValidation(false)} />
          </div>
          {conflicts.length === 0 ? (
            <div style={{ color: '#10b981' }}>
              <CheckCircle size={14} /> No conflicts found!
            </div>
          ) : (
            conflicts.map((c, i) => (
              <div key={i} style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                ⚠ {c}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TimetableBuilder;