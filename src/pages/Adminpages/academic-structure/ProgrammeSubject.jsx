import { useState } from 'react';
import { BookOpen, Plus, Save, X, ChevronRight, ChevronLeft, Star, XCircle, CheckCircle } from 'lucide-react';
import '../../../styles/programme-subjects.css';

function ProgrammeSubjects() {
  const [selectedProgramme, setSelectedProgramme] = useState('General Science');
  const [availableSubjects, setAvailableSubjects] = useState([
    { id: 1, name: 'Biology', isRequired: false },
    { id: 2, name: 'Chemistry', isRequired: false },
    { id: 3, name: 'Physics', isRequired: false },
    { id: 4, name: 'Mathematics (Elective)', isRequired: false },
    { id: 5, name: 'Literature', isRequired: false },
    { id: 6, name: 'Economics', isRequired: false },
    { id: 7, name: 'History', isRequired: false },
    { id: 8, name: 'Geography', isRequired: false },
    { id: 9, name: 'Accounting', isRequired: false },
    { id: 10, name: 'Business Management', isRequired: false }
  ]);

  const [assignedSubjects, setAssignedSubjects] = useState([
    { id: 1, name: 'Biology', isRequired: true },
    { id: 2, name: 'Chemistry', isRequired: true },
    { id: 3, name: 'Physics', isRequired: true },
    { id: 4, name: 'Mathematics (Elective)', isRequired: false }
  ]);

  const programmes = ['General Science', 'General Arts', 'Business', 'Visual Arts', 'Home Economics'];

  const moveToAssigned = (subject) => {
    setAvailableSubjects(prev => prev.filter(s => s.id !== subject.id));
    setAssignedSubjects(prev => [...prev, { ...subject, isRequired: false }]);
  };

  const moveToAvailable = (subject) => {
    setAssignedSubjects(prev => prev.filter(s => s.id !== subject.id));
    setAvailableSubjects(prev => [...prev, subject]);
  };

  const toggleRequired = (subject) => {
    setAssignedSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, isRequired: !s.isRequired } : s));
  };

  const handleSave = () => {
    console.log('Saved programme subjects for', selectedProgramme, assignedSubjects);
    alert(`Elective subjects for ${selectedProgramme} saved successfully!`);
  };

  return (
    <div className="programme-subjects-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />Programme Subjects</h1>
        <p style={{ color: 'var(--secondary)' }}>Assign elective subjects to SHS programmes</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: '500' }}>Select Programme:</label>
        <select className="filter-select" value={selectedProgramme} onChange={(e) => setSelectedProgramme(e.target.value)}>
          {programmes.map(prog => <option key={prog} value={prog}>{prog}</option>)}
        </select>
      </div>

      <div className="dual-list">
        <div className="list-box"><div className="list-header">Available Subjects</div>
          <div className="list-items">{availableSubjects.map(subject => (<div key={subject.id} className="list-item"><span>{subject.name}</span><button className="move-btn" onClick={() => moveToAssigned(subject)}><ChevronRight size={16} /></button></div>))}
          {availableSubjects.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>No subjects available</div>}</div></div>

        <div className="list-box"><div className="list-header">Assigned Subjects <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>(Click star to mark required)</span></div>
          <div className="list-items">{assignedSubjects.map(subject => (<div key={subject.id} className="list-item"><div style={{ flex: 1 }}><span>{subject.name}</span>{subject.isRequired && <span className="required-badge" style={{ marginLeft: '0.5rem' }}>Required</span>}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}><button className="move-btn" style={{ backgroundColor: '#f59e0b' }} onClick={() => toggleRequired(subject)}><Star size={14} /></button>
          <button className="move-btn" style={{ backgroundColor: '#ef4444' }} onClick={() => moveToAvailable(subject)}><ChevronLeft size={16} /></button></div></div>))}
          {assignedSubjects.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>No subjects assigned</div>}</div></div>
      </div>

      <div className="form-actions"><button className="button save-btn" onClick={handleSave}><Save size={16} /> Save Programme Subjects</button></div>
    </div>
  );
}

export default ProgrammeSubjects;