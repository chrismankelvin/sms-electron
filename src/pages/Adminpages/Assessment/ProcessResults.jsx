import { useState } from 'react';
import { Calculator, CheckCircle, AlertCircle, TrendingUp, Users, BookOpen, X, Lock } from 'lucide-react';
import '../../../styles/process-results.css';

function ProcessResults() {
  const [step, setStep] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const years = ['2023-2024', '2024-2025'];
  const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'All Classes'];

  const handleCalculateSubjects = () => {
    setProcessing(true);
    setTimeout(() => {
      setResults({
        subjectsCalculated: 12,
        totalSubjects: 15,
        studentsProcessed: 245,
        totalStudents: 245,
        errors: 0,
        gradeDistribution: { A: 45, B: 78, C: 65, D: 42, F: 15 }
      });
      setProcessing(false);
      setStep(2);
    }, 2000);
  };

  const handleCalculateTerms = () => {
    setProcessing(true);
    setTimeout(() => {
      setResults(prev => ({ ...prev, termCalculated: true }));
      setProcessing(false);
      setStep(3);
    }, 2000);
  };

  const handlePublish = () => {
    if (window.confirm('Publishing results will lock scores from further editing. Continue?')) {
      alert('Results published successfully! Notifications sent to parents/students.');
    }
  };

  const percentage = results ? (results.subjectsCalculated / results.totalSubjects) * 100 : 0;

  return (
    <div className="process-results-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Calculator size={28} style={{ display: 'inline', marginRight: '12px' }} />Process Results</h1>
        <p style={{ color: 'var(--secondary)' }}>Calculate subject and term results from raw scores</p></div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      <div className="card">
        <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <select className="form-select" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
          <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="button" onClick={handleCalculateSubjects} disabled={processing}><Calculator size={16} /> Calculate Subject Results</button>
          {step >= 2 && <button className="button" onClick={handleCalculateTerms} disabled={processing}><TrendingUp size={16} /> Calculate Term Results</button>}
        </div>
      </div>

      {processing && (<div className="status-panel"><div className="progress-bar"><div className="progress-fill" style={{ width: '60%' }}></div></div><p>Processing results... Please wait</p></div>)}

      {results && (<div className="status-panel"><div className="status-item"><span>Subjects calculated:</span><strong>{results.subjectsCalculated}/{results.totalSubjects}</strong></div>
      <div className="status-item"><span>Students processed:</span><strong>{results.studentsProcessed}/{results.totalStudents}</strong></div>
      <div className="status-item"><span>Errors found:</span><strong className="text-danger">{results.errors}</strong></div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${percentage}%` }}></div></div>
      {step === 3 && (<div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}><button className="button" onClick={handlePublish}><Lock size={16} /> Publish Results</button></div>)}</div>)}
    </div>
  );
}

export default ProcessResults;