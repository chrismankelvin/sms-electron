import { useState } from 'react';
import { UserPlus, Search, Save, AlertCircle, CheckCircle, X, Users, ArrowRight } from 'lucide-react';
import '../../../styles/manual-promotion.css';

function ManualPromotion() {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    promotionType: 'Promoted',
    toClass: '',
    toAcademicYear: '2024-2025',
    decisionReason: '',
    approver: 'Admin User'
  });

  const students = [
    { id: 1, name: 'John Doe', currentClass: 'JHS 1A', currentYear: '2023-2024' },
    { id: 2, name: 'Jane Smith', currentClass: 'JHS 1A', currentYear: '2023-2024' }
  ];

  const classes = ['JHS 2A', 'JHS 2B', 'JHS 3A'];
  const years = ['2024-2025', '2025-2026'];
  const promotionTypes = ['Promoted', 'Repeated', 'Graduated', 'Transferred'];

  const handleSearch = () => {
    const found = students.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) { setSelectedStudent(found); setStep(2); }
    else { alert('Student not found'); }
  };

  const handleSave = () => {
    if (!formData.toClass && formData.promotionType !== 'Graduated') {
      alert('Please select target class');
      return;
    }
    alert(`Promotion record created for ${selectedStudent.name}`);
    console.log('Promotion data:', { student: selectedStudent, ...formData });
    setStep(3);
  };

  return (
    <div className="manual-promotion-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><UserPlus size={28} style={{ display: 'inline', marginRight: '12px' }} />Manual Promotion</h1>
        <p style={{ color: 'var(--secondary)' }}>Promote or demote individual students</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Search Student</h3><div style={{ display: 'flex', gap: '1rem' }}><input type="text" className="form-input" placeholder="Enter student name or number" style={{ flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <button className="button" onClick={handleSearch}><Search size={16} /> Search</button></div></div>)}

      {step === 2 && selectedStudent && (<div className="card"><div className="student-search-result"><p><strong>Student:</strong> {selectedStudent.name}</p><p><strong>Current Class:</strong> {selectedStudent.currentClass}</p><p><strong>Current Academic Year:</strong> {selectedStudent.currentYear}</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div><label>Promotion Type</label><select className="form-select" value={formData.promotionType} onChange={(e) => setFormData(prev => ({ ...prev, promotionType: e.target.value }))}>{promotionTypes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        {formData.promotionType !== 'Graduated' && (<><div><label>To Class</label><select className="form-select" value={formData.toClass} onChange={(e) => setFormData(prev => ({ ...prev, toClass: e.target.value }))}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label>To Academic Year</label><select className="form-select" value={formData.toAcademicYear} onChange={(e) => setFormData(prev => ({ ...prev, toAcademicYear: e.target.value }))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></>)}
        <div className="full-width"><label>Decision Reason</label><textarea className="form-textarea" rows="3" value={formData.decisionReason} onChange={(e) => setFormData(prev => ({ ...prev, decisionReason: e.target.value }))} placeholder="Reason for promotion/repetition..."></textarea></div>
        <div><label>Approver</label><input type="text" className="form-input" value={formData.approver} disabled /></div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}><button className="button button-secondary" onClick={() => setStep(1)}>Cancel</button><button className="button" onClick={handleSave}><Save size={16} /> Save Promotion Record</button></div></div>)}

      {step === 3 && (<div className="card" style={{ textAlign: 'center' }}><CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} /><h3>Promotion Record Saved!</h3><p>{selectedStudent?.name} has been marked as {formData.promotionType}</p>
      <button className="button" onClick={() => { setStep(1); setSelectedStudent(null); setSearchTerm(''); }}>Process Another Student</button></div>)}
    </div>
  );
}

export default ManualPromotion;