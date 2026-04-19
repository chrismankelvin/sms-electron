import { useState } from 'react';
import { FileText, Plus, Edit, Eye, Calendar, AlertCircle, CheckCircle, X, BookOpen, Clock, Trash2 } from 'lucide-react';
import '../../../styles/assessments.css';

function Assessments() {
  const [assessments, setAssessments] = useState([
    { id: 1, name: 'Term 1 Examination', type: 'Exam', term: 'Term 1', academicYear: '2024-2025', subject: 'All', weight: 70, maxScore: 100, date: '2024-03-15', description: 'End of term examinations' },
    { id: 2, name: 'Week 3 Quiz', type: 'Quiz', term: 'Term 1', academicYear: '2024-2025', subject: 'Mathematics', weight: 10, maxScore: 20, date: '2024-02-10', description: 'Algebra and Geometry' },
    { id: 3, name: 'Mid-Term Test', type: 'Test', term: 'Term 1', academicYear: '2024-2025', subject: 'Science', weight: 20, maxScore: 50, date: '2024-02-25', description: 'Mid-term assessment' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Quiz', term: 'Term 1', academicYear: '2024-2025',
    subject: '', weight: '', maxScore: '', date: '', description: ''
  });

  const assessmentTypes = ['Quiz', 'Test', 'Exam', 'Project', 'Homework', 'Classwork'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const academicYears = ['2023-2024', '2024-2025', '2025-2026'];
  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'All'];

  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
  const isWeightValid = totalWeight === 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditAssessment = () => {
    if (!formData.name || !formData.type || !formData.weight || !formData.maxScore) {
      alert('Please fill in all required fields');
      return;
    }

    const newTotal = editingAssessment
      ? totalWeight - editingAssessment.weight + parseInt(formData.weight)
      : totalWeight + parseInt(formData.weight);

    if (newTotal > 100) {
      alert(`Total weight would exceed 100%. Current: ${totalWeight}%, Adding: ${formData.weight}%`);
      return;
    }

    if (editingAssessment) {
      setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? { ...a, ...formData, weight: parseInt(formData.weight), maxScore: parseInt(formData.maxScore) } : a));
    } else {
      const newAssessment = { id: Date.now(), ...formData, weight: parseInt(formData.weight), maxScore: parseInt(formData.maxScore) };
      setAssessments(prev => [...prev, newAssessment]);
    }
    setShowModal(false);
    setEditingAssessment(null);
    setFormData({ name: '', type: 'Quiz', term: 'Term 1', academicYear: '2024-2025', subject: '', weight: '', maxScore: '', date: '', description: '' });
  };

  const handleDeleteAssessment = (assessment) => {
    if (window.confirm(`Delete ${assessment.name}?`)) {
      setAssessments(prev => prev.filter(a => a.id !== assessment.id));
    }
  };

  const handleEnterScores = (assessment) => {
    alert(`Enter scores for ${assessment.name}`);
  };

  return (
    <div className="assessments-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <FileText size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Manage Assessments
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Create and manage exams, tests, and quizzes</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Assessment
        </button>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className={isWeightValid ? 'weight-success weight-warning' : 'weight-warning'}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isWeightValid ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <strong>Total Assessment Weight: {totalWeight}%</strong>
          </div>
          <div className="weight-bar">
            <div className="weight-bar-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }}></div>
          </div>
          {!isWeightValid && (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ⚠ Total must equal 100% before scores can be entered
            </div>
          )}
          {isWeightValid && (
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ✓ Perfect! Ready for score entry
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="academic-years-table">
          <thead>
            <tr>
              <th>Assessment Name</th>
              <th>Type</th>
              <th>Term</th>
              <th>Subject</th>
              <th>Weight</th>
              <th>Max Score</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td><span className="status-badge status-active">{a.type}</span></td>
                <td>{a.term} - {a.academicYear}</td>
                <td>{a.subject}</td>
                <td><span className="status-badge status-active">{a.weight}%</span></td>
                <td>{a.maxScore}</td>
                <td>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
                <td className="action-buttons">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => { 
                      setEditingAssessment(a); 
                      setFormData(a); 
                      setShowModal(true); 
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn set-current-btn" 
                    onClick={() => handleEnterScores(a)}
                  >
                    <Eye size={16} /> Scores
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDeleteAssessment(a)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingAssessment(null); }}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssessment ? 'Edit Assessment' : 'Create Assessment'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingAssessment(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Assessment Name *</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" className="form-select" value={formData.type} onChange={handleInputChange}>
                  {assessmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Term *</label>
                <select name="term" className="form-select" value={formData.term} onChange={handleInputChange}>
                  {terms.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Academic Year *</label>
                <select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>
                  {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" className="form-select" value={formData.subject} onChange={handleInputChange}>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weight (%) *</label>
                <input type="number" name="weight" className="form-input" value={formData.weight} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Max Score *</label>
                <input type="number" name="maxScore" className="form-input" value={formData.maxScore} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Assessment Date</label>
                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-textarea" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingAssessment(null); }}>
                Cancel
              </button>
              <button className="button" onClick={handleAddEditAssessment}>
                {editingAssessment ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;