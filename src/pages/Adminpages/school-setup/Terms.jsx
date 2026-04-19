import { useState } from 'react';
import { Calendar, Plus, Edit, CheckCircle, AlertCircle, Filter, X } from 'lucide-react';
import '../../../styles/terms.css';

function Terms() {
  const [terms, setTerms] = useState([
    { id: 1, termName: 'First Term', termNumber: 1, academicYear: '2024-2025', startDate: '2024-08-12', endDate: '2024-12-15', isActive: true, resultsPublished: true },
    { id: 2, termName: 'Second Term', termNumber: 2, academicYear: '2024-2025', startDate: '2025-01-10', endDate: '2025-04-05', isActive: false, resultsPublished: false },
    { id: 3, termName: 'Third Term', termNumber: 3, academicYear: '2024-2025', startDate: '2025-04-28', endDate: '2025-07-20', isActive: false, resultsPublished: false },
    { id: 4, termName: 'First Term', termNumber: 1, academicYear: '2023-2024', startDate: '2023-08-14', endDate: '2023-12-10', isActive: false, resultsPublished: true }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [warning, setWarning] = useState('');
  const [formData, setFormData] = useState({
    termName: '',
    termNumber: '',
    academicYear: '2024-2025',
    startDate: '',
    endDate: ''
  });

  const academicYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkPreviousTermResults = (academicYear, termNumber) => {
    const previousTerm = terms.find(t => 
      t.academicYear === academicYear && 
      t.termNumber === termNumber - 1
    );
    
    if (previousTerm && !previousTerm.resultsPublished) {
      setWarning(`Cannot activate ${termNumber}nd/rd term until Term ${termNumber - 1} results are published.`);
      return false;
    }
    setWarning('');
    return true;
  };

  const handleActivateTerm = (term) => {
    if (term.termNumber > 1) {
      const canActivate = checkPreviousTermResults(term.academicYear, term.termNumber);
      if (!canActivate) return;
    }

    setTerms(prev => prev.map(t => ({
      ...t,
      isActive: t.id === term.id,
      resultsPublished: t.id === term.id ? t.resultsPublished : t.resultsPublished
    })));
  };

  const handleAddEditTerm = () => {
    if (!formData.termName || !formData.termNumber || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    if (editingTerm) {
      setTerms(prev => prev.map(t => 
        t.id === editingTerm.id 
          ? { ...t, ...formData, resultsPublished: t.resultsPublished }
          : t
      ));
    } else {
      const newTerm = {
        id: Date.now(),
        ...formData,
        isActive: false,
        resultsPublished: false
      };
      setTerms(prev => [...prev, newTerm]);
    }
    
    setShowModal(false);
    setEditingTerm(null);
    setFormData({ termName: '', termNumber: '', academicYear: '2024-2025', startDate: '', endDate: '' });
  };

  const openEditModal = (term) => {
    setEditingTerm(term);
    setFormData({
      termName: term.termName,
      termNumber: term.termNumber,
      academicYear: term.academicYear,
      startDate: term.startDate,
      endDate: term.endDate
    });
    setShowModal(true);
  };

  const filteredTerms = terms.filter(t => t.academicYear === selectedYear);

  return (
    <div className="terms-container">
      <div className="terms-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Calendar size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Academic Terms
          </h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.25rem' }}>Define terms within each academic year with date ranges</p>
        </div>
        <button className="button" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Term
        </button>
      </div>

      <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

      <div className="filter-bar">
        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by Academic Year:</label>
        <select className="filter-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      {warning && (
        <div className="warning-banner">
          <AlertCircle size={18} color="#f59e0b" />
          <span>{warning}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {filteredTerms.sort((a, b) => a.termNumber - b.termNumber).map(term => (
          <div key={term.id} className={`term-card ${term.isActive ? 'active' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{term.termName}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Term {term.termNumber}</span>
                  {term.isActive && <span className="status-badge status-active"><CheckCircle size={12} /> Active</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary)' }}>
                  <span>📅 {new Date(term.startDate).toLocaleDateString()} → {new Date(term.endDate).toLocaleDateString()}</span>
                  <span>📊 Results: {term.resultsPublished ? 'Published ✓' : 'Pending ⏳'}</span>
                </div>
              </div>
              <div className="action-buttons">
                <button className="action-btn edit-btn" onClick={() => openEditModal(term)}><Edit size={16} /></button>
                {!term.isActive && (
                  <button className="action-btn set-current-btn" onClick={() => handleActivateTerm(term)}>
                    <CheckCircle size={16} /> Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTerm(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTerm ? 'Edit Term' : 'Add New Term'}</h2>
              <X className="modal-close" size={20} onClick={() => { setShowModal(false); setEditingTerm(null); }} />
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Term Name <span className="required">*</span></label>
                <input type="text" name="termName" className="form-input" value={formData.termName} onChange={handleInputChange} placeholder="e.g., First Term" /></div>
              <div className="form-group"><label className="form-label">Term Number <span className="required">*</span></label>
                <input type="number" name="termNumber" className="form-input" value={formData.termNumber} onChange={handleInputChange} min="1" max="6" /></div>
              <div className="form-group"><label className="form-label">Academic Year</label>
                <select name="academicYear" className="form-select" value={formData.academicYear} onChange={handleInputChange}>
                  {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Start Date <span className="required">*</span></label>
                <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleInputChange} /></div>
              <div className="form-group"><label className="form-label">End Date <span className="required">*</span></label>
                <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleInputChange} /></div>
            </div>
            <div className="modal-footer">
              <button className="button button-secondary" onClick={() => { setShowModal(false); setEditingTerm(null); }}>Cancel</button>
              <button className="button" onClick={handleAddEditTerm}>{editingTerm ? 'Save Changes' : 'Add Term'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Terms;