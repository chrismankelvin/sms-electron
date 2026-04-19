import { useState } from 'react';
import { Target, Save, X, CheckSquare, Square, Layers, BookOpen } from 'lucide-react';
import '../../../styles/level-core-subjects.css';

function LevelCoreSubjects() {
  const [selectedLevel, setSelectedLevel] = useState('JHS 1');
  const [assignments, setAssignments] = useState({
    'JHS 1': { 'Mathematics': true, 'English Language': true, 'Social Studies': true, 'Science': true, 'Biology': false, 'Chemistry': false },
    'JHS 2': { 'Mathematics': true, 'English Language': true, 'Social Studies': true, 'Science': true, 'Biology': false, 'Chemistry': false },
    'JHS 3': { 'Mathematics': true, 'English Language': true, 'Social Studies': true, 'Science': true, 'Biology': false, 'Chemistry': false },
    'SHS 1': { 'Mathematics': true, 'English Language': true, 'Social Studies': false, 'Science': false, 'Biology': false, 'Chemistry': false },
    'SHS 2': { 'Mathematics': true, 'English Language': true, 'Social Studies': false, 'Science': false, 'Biology': false, 'Chemistry': false },
    'SHS 3': { 'Mathematics': true, 'English Language': true, 'Social Studies': false, 'Science': false, 'Biology': false, 'Chemistry': false }
  });

  const allSubjects = ['Mathematics', 'English Language', 'Social Studies', 'Science', 'Biology', 'Chemistry', 'Physics', 'Literature', 'Economics'];
  const levels = ['JHS 1', 'JHS 2', 'JHS 3', 'SHS 1', 'SHS 2', 'SHS 3'];

  const handleToggleSubject = (subject) => {
    setAssignments(prev => ({
      ...prev,
      [selectedLevel]: {
        ...prev[selectedLevel],
        [subject]: !prev[selectedLevel][subject]
      }
    }));
  };

  const handleSave = () => {
    console.log('Saved core subjects for', selectedLevel, assignments[selectedLevel]);
    alert(`Core subjects for ${selectedLevel} saved successfully!`);
  };

  const currentAssignments = assignments[selectedLevel] || {};

  return (
    <div className="level-core-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Target size={28} style={{ display: 'inline', marginRight: '12px' }} />Level Core Subjects</h1>
        <p style={{ color: 'var(--secondary)' }}>Assign core subjects to specific academic levels</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: '500' }}>Select Level:</label>
        <select className="filter-select" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
          {levels.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Core Subjects for {selectedLevel}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {allSubjects.map(subject => (
            <label key={subject} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input type="checkbox" checked={currentAssignments[subject] || false} onChange={() => handleToggleSubject(subject)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <span>{subject}</span>
              {currentAssignments[subject] && <span className="status-badge status-active" style={{ marginLeft: 'auto' }}>Core</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Level × Subject Matrix View</h3>
        <div className="subject-matrix">
          <table className="matrix-table">
            <thead><tr><th>Level</th>{allSubjects.map(s => <th key={s}>{s}</th>)}</tr></thead>
            <tbody>{levels.map(level => (<tr key={level}><td><strong>{level}</strong></td>{allSubjects.map(subject => (<td key={subject} style={{ textAlign: 'center' }}>{assignments[level]?.[subject] ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="var(--secondary)" />}</td>))}</tr>))}</tbody>
          </table>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="button save-btn" onClick={handleSave}><Save size={16} /> Save Core Subjects</button>
      </div>
    </div>
  );
}

export default LevelCoreSubjects;