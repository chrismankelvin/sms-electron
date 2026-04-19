import { useState } from 'react';
import { ArrowRight, Search, AlertTriangle, Save, Users, Calendar, X } from 'lucide-react';
import '../../../styles/class-transfers.css';

function ClassTransfers() {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    newClass: '',
    newSection: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const students = [
    { id: 1, name: 'John Doe', number: 'STU001', currentClass: 'JHS 1A', currentSection: 'A', enrolledDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', number: 'STU002', currentClass: 'JHS 1B', currentSection: 'B', enrolledDate: '2024-01-15' }
  ];

  const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B'];
  const sections = ['A', 'B', 'C'];

  const handleSearch = () => {
    const found = students.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.number.includes(searchTerm));
    if (found) { setSelectedStudent(found); setStep(2); }
    else { alert('Student not found'); }
  };

  const handleTransfer = () => {
    if (!formData.newClass) { alert('Please select new class'); return; }
    if (formData.newClass === selectedStudent.currentClass) { alert('New class must be different from current class'); return; }
    if (window.confirm(`Transfer ${selectedStudent.name} from ${selectedStudent.currentClass} to ${formData.newClass}?`)) {
      alert(`Transfer executed successfully for ${selectedStudent.name}`);
      console.log('Transfer data:', { student: selectedStudent, ...formData });
      setStep(3);
    }
  };

  return (
    <div className="class-transfers-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Class Transfers</h1>
        <p style={{ color: 'var(--secondary)' }}>Transfer student between classes mid-year</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {step === 1 && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Search Student</h3><div style={{ display: 'flex', gap: '1rem' }}><input type="text" className="form-input" placeholder="Enter student name or number" style={{ flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <button className="button" onClick={handleSearch}><Search size={16} /> Search</button></div></div>)}

      {step === 2 && selectedStudent && (<div className="card"><div className="current-class-card"><h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Current Information</h3>
      <p><strong>Student:</strong> {selectedStudent.name} ({selectedStudent.number})</p><p><strong>Current Class:</strong> {selectedStudent.currentClass} - Section {selectedStudent.currentSection}</p>
      <p><strong>Enrolled Date:</strong> {new Date(selectedStudent.enrolledDate).toLocaleDateString()}</p></div>

      <div className="transfer-warning"><AlertTriangle size={18} /> Warning: Transferring class mid-year may affect attendance records, assessment scores, and fee structure.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div><label>New Class *</label><select className="form-select" value={formData.newClass} onChange={(e) => setFormData(prev => ({ ...prev, newClass: e.target.value }))}><option value="">Select Class</option>{classes.filter(c => c !== selectedStudent.currentClass).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label>New Section (Optional)</label><select className="form-select" value={formData.newSection} onChange={(e) => setFormData(prev => ({ ...prev, newSection: e.target.value }))}><option value="">Select Section</option>{sections.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label>Transfer Date</label><input type="date" className="form-input" value={formData.transferDate} onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))} /></div>
        <div className="full-width"><label>Reason for Transfer *</label><textarea className="form-textarea" rows="3" value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} placeholder="Please provide reason for class transfer..."></textarea></div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}><button className="button button-secondary" onClick={() => { setStep(1); setSelectedStudent(null); }}>Cancel</button>
      <button className="button" onClick={handleTransfer}><Save size={16} /> Execute Transfer</button></div></div>)}

      {step === 3 && (<div className="card" style={{ textAlign: 'center' }}><CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} /><h3>Transfer Complete!</h3>
      <p>{selectedStudent?.name} has been transferred from {selectedStudent?.currentClass} to {formData.newClass}</p>
      <button className="button" onClick={() => { setStep(1); setSelectedStudent(null); setSearchTerm(''); setFormData({ newClass: '', newSection: '', transferDate: new Date().toISOString().split('T')[0], reason: '' }); }}>Process Another Transfer</button></div>)}
    </div>
  );
}

export default ClassTransfers;