import { useState } from 'react';
import { TrendingUp, Plus, Edit, Trash2, Copy, Eye, X, Award, Star } from 'lucide-react';
import '../../../styles/grade-boundaries.css';

function GradeBoundaries() {
  const [grades, setGrades] = useState([
    { id: 1, grade: 'A', minScore: 80, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', levelCategory: 'BOTH', isDefault: true },
    { id: 2, grade: 'B', minScore: 70, maxScore: 79, gradePoint: 3.0, remark: 'Very Good', levelCategory: 'BOTH', isDefault: true },
    { id: 3, grade: 'C', minScore: 60, maxScore: 69, gradePoint: 2.0, remark: 'Good', levelCategory: 'BOTH', isDefault: true },
    { id: 4, grade: 'D', minScore: 50, maxScore: 59, gradePoint: 1.0, remark: 'Credit', levelCategory: 'BOTH', isDefault: true },
    { id: 5, grade: 'E', minScore: 40, maxScore: 49, gradePoint: 0.5, remark: 'Pass', levelCategory: 'BOTH', isDefault: true },
    { id: 6, grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, remark: 'Fail', levelCategory: 'BOTH', isDefault: true }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [filterCategory, setFilterCategory] = useState('BOTH');
  const [formData, setFormData] = useState({ grade: '', minScore: '', maxScore: '', gradePoint: '', remark: '', levelCategory: 'BOTH' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditGrade = () => {
    if (!formData.grade || !formData.minScore || !formData.maxScore || !formData.gradePoint) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.minScore) >= parseInt(formData.maxScore)) {
      alert('Min Score must be less than Max Score');
      return;
    }

    if (editingGrade) {
      setGrades(prev => prev.map(g => g.id === editingGrade.id ? { ...g, ...formData } : g));
    } else {
      const newGrade = { id: Date.now(), ...formData, isDefault: false };
      setGrades(prev => [...prev, newGrade]);
    }
    setShowModal(false);
    setEditingGrade(null);
    setFormData({ grade: '', minScore: '', maxScore: '', gradePoint: '', remark: '', levelCategory: 'BOTH' });
  };

  const handleDeleteGrade = (grade) => {
    if (grade.isDefault) {
      alert('Cannot delete default grade boundaries');
      return;
    }
    if (window.confirm(`Delete grade ${grade.grade}?`)) {
      setGrades(prev => prev.filter(g => g.id !== grade.id));
    }
  };

  const handleCopyFromJHStoSHS = () => {
    const jhsGrades = grades.filter(g => g.levelCategory === 'JHS' || g.levelCategory === 'BOTH');
    const newGrades = jhsGrades.map(g => ({ ...g, id: Date.now() + Math.random(), levelCategory: 'SHS', isDefault: false }));
    setGrades(prev => [...prev, ...newGrades]);
    alert(`Copied ${newGrades.length} grades from JHS to SHS`);
  };

  const filteredGrades = grades.filter(g => filterCategory === 'BOTH' || g.levelCategory === filterCategory || g.levelCategory === 'BOTH');

  const getScoreGrade = (score) => {
    const grade = grades.find(g => score >= g.minScore && score <= g.maxScore);
    return grade || { grade: 'N/A', remark: 'Invalid Score' };
  };

  return (
    <div className="grade-boundaries-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Award size={28} style={{ display: 'inline', marginRight: '12px' }} />Grade Boundaries</h1>
        <p style={{ color: 'var(--secondary)' }}>Define grading scales for JHS and SHS</p></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="button button-secondary" onClick={handleCopyFromJHStoSHS}><Copy size={16} /> Copy JHS → SHS</button>
          <button className="button" onClick={() => setShowPreview(true)}><Eye size={16} /> Preview Mapping</button>
          <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Grade</button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <label>Filter by Level:</label>
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="BOTH">All Levels</option><option value="JHS">JHS Only</option><option value="SHS">SHS Only</option>
        </select>
      </div>

      <div className="table-container">
        <table className="academic-years-table">
          <thead><tr><th>Grade</th><th>Min Score</th><th>Max Score</th><th>Grade Point</th><th>Remark</th><th>Level Category</th><th>Default?</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredGrades.sort((a, b) => b.minScore - a.minScore).map(grade => (
              <tr key={grade.id} className="grade-row"><td><strong>{grade.grade}</strong></td>
              <td>{grade.minScore}</td><td>{grade.maxScore}</td><td>{grade.gradePoint}</td><td>{grade.remark}</td>
              <td><span className="status-badge status-active">{grade.levelCategory}</span></td>
              <td>{grade.isDefault && <Star size={16} color="#f59e0b" />}</td>
              <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingGrade(grade); setFormData(grade); setShowModal(true); }}><Edit size={16} /></button>
              {!grade.isDefault && <button className="action-btn delete-btn" onClick={() => handleDeleteGrade(grade)}><Trash2 size={16} /></button>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {showPreview && <div className="modal-overlay" onClick={() => setShowPreview(false)}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Score to Grade Preview</h2><X className="modal-close" size={20} onClick={() => setShowPreview(false)} /></div>
          <div className="modal-body">
            <div className="grade-preview"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
              {[95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map(score => {
                const { grade, remark } = getScoreGrade(score);
                return <div key={score} className="preview-item"><div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{score}</div><div>{grade}</div><div style={{ fontSize: '0.75rem' }}>{remark}</div></div>;
              })}
            </div></div>
            <div style={{ marginTop: '1rem' }}><h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Grade Mapping:</h3>
              {grades.map(g => <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                <span><strong>{g.grade}</strong> ({g.minScore}-{g.maxScore})</span><span>{g.remark}</span><span>{g.gradePoint} GPA</span></div>)}</div>
          </div>
          <div className="modal-footer"><button className="button" onClick={() => setShowPreview(false)}>Close</button></div>
        </div>
      </div>}

      {/* Grade Modal */}
      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingGrade(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingGrade ? 'Edit Grade' : 'Add Grade'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingGrade(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Grade <span className="required">*</span></label><input type="text" name="grade" className="form-input" value={formData.grade} onChange={handleInputChange} placeholder="A, B+, C-" /></div>
            <div className="form-group"><label className="form-label">Min Score <span className="required">*</span></label><input type="number" name="minScore" className="form-input" value={formData.minScore} onChange={handleInputChange} /></div>
            <div className="form-group"><label className="form-label">Max Score <span className="required">*</span></label><input type="number" name="maxScore" className="form-input" value={formData.maxScore} onChange={handleInputChange} /></div>
            <div className="form-group"><label className="form-label">Grade Point <span className="required">*</span></label><input type="number" step="0.1" name="gradePoint" className="form-input" value={formData.gradePoint} onChange={handleInputChange} /></div>
            <div className="form-group"><label className="form-label">Remark</label><input type="text" name="remark" className="form-input" value={formData.remark} onChange={handleInputChange} /></div>
            <div className="form-group"><label className="form-label">Level Category</label><select name="levelCategory" className="form-select" value={formData.levelCategory} onChange={handleInputChange}>
              <option value="JHS">JHS Only</option><option value="SHS">SHS Only</option><option value="BOTH">Both JHS & SHS</option></select></div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingGrade(null); }}>Cancel</button>
          <button className="button" onClick={handleAddEditGrade}>{editingGrade ? 'Save Changes' : 'Add Grade'}</button></div>
        </div>
      </div>}
    </div>
  );
}

export default GradeBoundaries;