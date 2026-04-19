import { useState } from 'react';
import { Users, Save, X, CheckCircle, XCircle, Award, Calendar, BookOpen, UserCheck } from 'lucide-react';
import '../../../styles/teacher-qualifications.css';

function TeacherQualifications() {
  const [selectedTeacher, setSelectedTeacher] = useState('Mr. John Doe');
  const [qualifications, setQualifications] = useState({
    'Mr. John Doe': {
      'Mathematics': { qualified: true, level: "Master's", certifiedSince: '2015-08-15' },
      'English Language': { qualified: true, level: "Bachelor's", certifiedSince: '2015-08-15' },
      'Physics': { qualified: false, level: '', certifiedSince: '' },
      'Chemistry': { qualified: false, level: '', certifiedSince: '' },
      'Biology': { qualified: true, level: "Master's", certifiedSince: '2016-06-20' }
    },
    'Mrs. Jane Smith': {
      'Mathematics': { qualified: false, level: '', certifiedSince: '' },
      'English Language': { qualified: true, level: "Master's", certifiedSince: '2014-09-10' },
      'Literature': { qualified: true, level: "Master's", certifiedSince: '2014-09-10' }
    }
  });

  const teachers = ['Mr. John Doe', 'Mrs. Jane Smith', 'Dr. James Wilson', 'Ms. Sarah Johnson', 'Mr. Michael Brown'];
  const allSubjects = ['Mathematics', 'English Language', 'Social Studies', 'Science', 'Biology', 'Chemistry', 'Physics', 'Literature', 'Economics', 'History', 'Geography', 'Accounting'];

  const [formData, setFormData] = useState({ level: "Bachelor's", certifiedSince: '' });

  const handleQualificationToggle = (subject) => {
    setQualifications(prev => ({
      ...prev,
      [selectedTeacher]: {
        ...prev[selectedTeacher],
        [subject]: {
          ...prev[selectedTeacher][subject],
          qualified: !prev[selectedTeacher][subject]?.qualified
        }
      }
    }));
  };

  const handleQualificationLevelChange = (subject, field, value) => {
    setQualifications(prev => ({
      ...prev,
      [selectedTeacher]: {
        ...prev[selectedTeacher],
        [subject]: {
          ...prev[selectedTeacher][subject],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    console.log('Saved qualifications for', selectedTeacher, qualifications[selectedTeacher]);
    alert(`Qualifications for ${selectedTeacher} saved successfully!`);
  };

  const currentQualifications = qualifications[selectedTeacher] || {};

  return (
    <div className="teacher-qualifications-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Teacher Qualifications</h1>
        <p style={{ color: 'var(--secondary)' }}>Track which teachers are qualified to teach which subjects</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: '500' }}>Select Teacher:</label>
        <select className="filter-select" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
          {teachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
        </select>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Subject Qualifications for {selectedTeacher}</h3>
        <div className="qualification-grid">
          {allSubjects.map(subject => {
            const qual = currentQualifications[subject] || { qualified: false, level: '', certifiedSince: '' };
            return (
              <div key={subject} className={`qualification-card ${qual.qualified ? 'qualified' : ''}`}>
                <div className="qualification-header">
                  <strong>{subject}</strong>
                  <button className="action-btn" onClick={() => handleQualificationToggle(subject)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    {qual.qualified ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                  </button>
                </div>
                {qual.qualified && (<div style={{ marginTop: '0.5rem' }}>
                  <select className="form-select" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} value={qual.level} onChange={(e) => handleQualificationLevelChange(subject, 'level', e.target.value)}>
                    <option value="">Select Level</option><option value="Bachelor's">Bachelor's Degree</option><option value="Master's">Master's Degree</option><option value="PhD">PhD/Doctorate</option><option value="Diploma">Professional Diploma</option><option value="Certification">Certification</option>
                  </select>
                  <input type="date" className="form-input" style={{ fontSize: '0.75rem' }} value={qual.certifiedSince} onChange={(e) => handleQualificationLevelChange(subject, 'certifiedSince', e.target.value)} placeholder="Certified Since" />
                </div>)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Teacher × Subject Qualification Matrix</h3>
        <div className="matrix-view">
          <table className="matrix-table"><thead><tr><th>Teacher</th>{allSubjects.slice(0, 6).map(s => <th key={s}>{s}</th>)}</tr></thead>
            <tbody>{teachers.slice(0, 4).map(teacher => (<tr key={teacher}><td><strong>{teacher}</strong></td>{allSubjects.slice(0, 6).map(subject => (<td key={subject} style={{ textAlign: 'center' }}>{qualifications[teacher]?.[subject]?.qualified ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}</td>))}</tr>))}</tbody>
          </table>
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="button save-btn" onClick={handleSave}><Save size={16} /> Save Qualifications</button>
      </div>
    </div>
  );
}

export default TeacherQualifications;