import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit, Trash2, AlertCircle, CheckCircle, X, Scale, BookOpen } from 'lucide-react';
import '../../../styles/assessment-types.css';

function AssessmentTypes() {
  const [assessments, setAssessments] = useState([
    { id: 1, assessmentName: 'Quiz', defaultWeight: 15, maxScore: 100, applicableLevels: 'BOTH' },
    { id: 2, assessmentName: 'Test', defaultWeight: 20, maxScore: 100, applicableLevels: 'BOTH' },
    { id: 3, assessmentName: 'Project', defaultWeight: 15, maxScore: 100, applicableLevels: 'BOTH' },
    { id: 4, assessmentName: 'Homework', defaultWeight: 10, maxScore: 50, applicableLevels: 'BOTH' },
    { id: 5, assessmentName: 'Classwork', defaultWeight: 10, maxScore: 50, applicableLevels: 'BOTH' },
    { id: 6, assessmentName: 'Examination', defaultWeight: 30, maxScore: 100, applicableLevels: 'BOTH' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({ assessmentName: '', defaultWeight: '', maxScore: 100, applicableLevels: 'BOTH' });

  useEffect(() => {
    const totalWeight = assessments.reduce((sum, a) => sum + a.defaultWeight, 0);
    setShowWarning(totalWeight !== 100);
  }, [assessments]);

  const totalWeight = assessments.reduce((sum, a) => sum + a.defaultWeight, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditAssessment = () => {
    if (!formData.assessmentName || !formData.defaultWeight || !formData.maxScore) {
      alert('Please fill in all required fields');
      return;
    }

    const newTotal = editingAssessment 
      ? totalWeight - editingAssessment.defaultWeight + parseInt(formData.defaultWeight)
      : totalWeight + parseInt(formData.defaultWeight);

    if (newTotal > 100) {
      alert(`Total weight would exceed 100% (Current: ${totalWeight}%, Adding: ${formData.defaultWeight}%, New Total: ${newTotal}%)`);
      return;
    }

    if (editingAssessment) {
      setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? { ...a, ...formData, defaultWeight: parseInt(formData.defaultWeight), maxScore: parseInt(formData.maxScore) } : a));
    } else {
      const newAssessment = { id: Date.now(), ...formData, defaultWeight: parseInt(formData.defaultWeight), maxScore: parseInt(formData.maxScore) };
      setAssessments(prev => [...prev, newAssessment]);
    }
    setShowModal(false);
    setEditingAssessment(null);
    setFormData({ assessmentName: '', defaultWeight: '', maxScore: 100, applicableLevels: 'BOTH' });
  };

  const handleDeleteAssessment = (assessment) => {
    if (window.confirm(`Delete ${assessment.assessmentName}?`)) {
      setAssessments(prev => prev.filter(a => a.id !== assessment.id));
    }
  };

  return (
    <div className="assessment-types-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><ClipboardList size={28} style={{ display: 'inline', marginRight: '12px' }} />Assessment Types</h1>
        <p style={{ color: 'var(--secondary)' }}>Define assessment categories with weights per term</p></div>
        <button className="button" onClick={() => setShowModal(true)}><Plus size={16} /> Add Assessment</button>
      </div>
      <hr style={{ margin: '0 0 1rem 0', borderColor: 'var(--border)' }} />

      <div className={`weight-summary ${showWarning ? 'warning' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{showWarning ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span><strong>Total Assessment Weight:</strong> {totalWeight}%</span></div>
          {showWarning ? <span>⚠️ Total must equal 100% for accurate grade calculation</span> : <span>✓ Perfect! Total weight is 100%</span>}
        </div>
        <div className="weight-bar"><div className="weight-bar-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }}></div></div>
      </div>

      <div className="table-container">
        <table className="academic-years-table">
          <thead><tr><th>Assessment Name</th><th>Default Weight (%)</th><th>Max Score</th><th>Applicable Levels</th><th>Actions</th></tr></thead>
          <tbody>
            {assessments.map(assessment => (<tr key={assessment.id}><td><strong>{assessment.assessmentName}</strong></td>
            <td><span className="status-badge status-active">{assessment.defaultWeight}%</span></td><td>{assessment.maxScore}</td>
            <td><span className="status-badge status-inactive">{assessment.applicableLevels}</span></td>
            <td className="action-buttons"><button className="action-btn edit-btn" onClick={() => { setEditingAssessment(assessment); setFormData(assessment); setShowModal(true); }}><Edit size={16} /></button>
            <button className="action-btn delete-btn" onClick={() => handleDeleteAssessment(assessment)}><Trash2 size={16} /></button></td></tr>))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '0.5rem' }}>
        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Scale size={16} /> Weight Distribution Example</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {assessments.map(a => (<div key={a.id} style={{ flex: 1, minWidth: '100px' }}><div style={{ height: `${a.defaultWeight * 2}px`, backgroundColor: 'var(--primary)', borderRadius: '4px', marginBottom: '0.25rem' }}></div>
          <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>{a.assessmentName}<br />{a.defaultWeight}%</div></div>))}
        </div>
      </div>

      {showModal && <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingAssessment(null); }}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>{editingAssessment ? 'Edit Assessment' : 'Add Assessment Type'}</h2><X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingAssessment(null); }} /></div>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Assessment Name <span className="required">*</span></label>
              <input type="text" name="assessmentName" className="form-input" value={formData.assessmentName} onChange={handleInputChange} placeholder="Quiz, Test, Exam, Project..." /></div>
            <div className="form-group"><label className="form-label">Default Weight (%) <span className="required">*</span></label>
              <input type="number" name="defaultWeight" className="form-input" value={formData.defaultWeight} onChange={handleInputChange} min="0" max="100" step="5" /></div>
            <div className="form-group"><label className="form-label">Max Score <span className="required">*</span></label>
              <input type="number" name="maxScore" className="form-input" value={formData.maxScore} onChange={handleInputChange} min="1" /></div>
            <div className="form-group"><label className="form-label">Applicable Levels</label>
              <select name="applicableLevels" className="form-select" value={formData.applicableLevels} onChange={handleInputChange}>
                <option value="JHS">JHS Only</option><option value="SHS">SHS Only</option><option value="BOTH">Both JHS & SHS</option></select></div>
            <div className="alert-info" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Current total weight: {totalWeight}%. Adding this will make it {totalWeight + parseInt(formData.defaultWeight || 0)}%
            </div>
          </div>
          <div className="modal-footer"><button className="button button-secondary" onClick={() => { setShowModal(false); setEditingAssessment(null); }}>Cancel</button>
          <button className="button" onClick={handleAddEditAssessment}>{editingAssessment ? 'Save Changes' : 'Add Assessment'}</button></div>
        </div>
      </div>}
    </div>
  );
}

export default AssessmentTypes;