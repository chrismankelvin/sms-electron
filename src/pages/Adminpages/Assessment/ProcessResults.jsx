// import { useState } from 'react';
// import { Calculator, CheckCircle, AlertCircle, TrendingUp, Users, BookOpen, X, Lock } from 'lucide-react';
// import '../../../styles/process-results.css';

// function ProcessResults() {
//   const [step, setStep] = useState(1);
//   const [selectedTerm, setSelectedTerm] = useState('Term 1');
//   const [selectedYear, setSelectedYear] = useState('2024-2025');
//   const [selectedClass, setSelectedClass] = useState('JHS 1 Science');
//   const [processing, setProcessing] = useState(false);
//   const [results, setResults] = useState(null);

//   const terms = ['Term 1', 'Term 2', 'Term 3'];
//   const years = ['2023-2024', '2024-2025'];
//   const classes = ['JHS 1 Science', 'JHS 2 Science', 'SHS 1 Science', 'All Classes'];

//   const handleCalculateSubjects = () => {
//     setProcessing(true);
//     setTimeout(() => {
//       setResults({
//         subjectsCalculated: 12,
//         totalSubjects: 15,
//         studentsProcessed: 245,
//         totalStudents: 245,
//         errors: 0,
//         gradeDistribution: { A: 45, B: 78, C: 65, D: 42, F: 15 }
//       });
//       setProcessing(false);
//       setStep(2);
//     }, 2000);
//   };

//   const handleCalculateTerms = () => {
//     setProcessing(true);
//     setTimeout(() => {
//       setResults(prev => ({ ...prev, termCalculated: true }));
//       setProcessing(false);
//       setStep(3);
//     }, 2000);
//   };

//   const handlePublish = () => {
//     if (window.confirm('Publishing results will lock scores from further editing. Continue?')) {
//       alert('Results published successfully! Notifications sent to parents/students.');
//     }
//   };

//   const percentage = results ? (results.subjectsCalculated / results.totalSubjects) * 100 : 0;

//   return (
//     <div className="process-results-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Calculator size={28} style={{ display: 'inline', marginRight: '12px' }} />Process Results</h1>
//         <p style={{ color: 'var(--secondary)' }}>Calculate subject and term results from raw scores</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       <div className="card">
//         <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Parameters</h3>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
//           <select className="form-select" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>{terms.map(t => <option key={t} value={t}>{t}</option>)}</select>
//           <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
//           <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select>
//         </div>

//         <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
//           <button className="button" onClick={handleCalculateSubjects} disabled={processing}><Calculator size={16} /> Calculate Subject Results</button>
//           {step >= 2 && <button className="button" onClick={handleCalculateTerms} disabled={processing}><TrendingUp size={16} /> Calculate Term Results</button>}
//         </div>
//       </div>

//       {processing && (<div className="status-panel"><div className="progress-bar"><div className="progress-fill" style={{ width: '60%' }}></div></div><p>Processing results... Please wait</p></div>)}

//       {results && (<div className="status-panel"><div className="status-item"><span>Subjects calculated:</span><strong>{results.subjectsCalculated}/{results.totalSubjects}</strong></div>
//       <div className="status-item"><span>Students processed:</span><strong>{results.studentsProcessed}/{results.totalStudents}</strong></div>
//       <div className="status-item"><span>Errors found:</span><strong className="text-danger">{results.errors}</strong></div>
//       <div className="progress-bar"><div className="progress-fill" style={{ width: `${percentage}%` }}></div></div>
//       {step === 3 && (<div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}><button className="button" onClick={handlePublish}><Lock size={16} /> Publish Results</button></div>)}</div>)}
//     </div>
//   );
// }

// export default ProcessResults;






// src/components/Academics/ProcessResults.jsx

import { useState, useEffect } from 'react';
import { 
  Calculator, CheckCircle, AlertCircle, TrendingUp, Users, BookOpen, 
  X, Lock, Loader, RefreshCw, FileText, Award 
} from 'lucide-react';
import '../../../styles/process-results.css';

const API_BASE_URL = 'http://localhost:8000/api';

const processResultsService = {
  async getOptions() {
    const response = await fetch(`${API_BASE_URL}/process-results/options`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async calculateSubjects(termId, classId, subjectId = null) {
    const response = await fetch(`${API_BASE_URL}/process-results/calculate-subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        term_id: termId, 
        class_id: classId, 
        subject_id: subjectId 
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async calculateTerm(termId, classId) {
    const response = await fetch(`${API_BASE_URL}/process-results/calculate-term`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        term_id: termId, 
        class_id: classId 
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async publishResults(termId, classId) {
    const response = await fetch(`${API_BASE_URL}/process-results/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        term_id: termId, 
        class_id: classId 
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function ProcessResults() {
  const [step, setStep] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [terms, setTerms] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [subjectResults, setSubjectResults] = useState(null);
  const [termResults, setTermResults] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const data = await processResultsService.getOptions();
      setTerms(data.terms);
      setYears(data.academic_years);
      setClasses(data.classes);
      setSubjects(data.subjects);
      
      // Set default selections
      if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
      if (data.academic_years.length > 0) setSelectedYear(data.academic_years[0].id.toString());
      if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
      if (data.subjects.length > 0) setSelectedSubject(data.subjects[0].id.toString());
    } catch (error) {
      showAlert('Failed to load options: ' + error.message, 'error');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCalculateSubjects = async () => {
    if (!selectedTerm || !selectedClass) {
      showAlert('Please select term and class', 'error');
      return;
    }

    try {
      setProcessing(true);
      const result = await processResultsService.calculateSubjects(
        parseInt(selectedTerm),
        parseInt(selectedClass),
        selectedSubject ? parseInt(selectedSubject) : null
      );
      
      setSubjectResults(result);
      showAlert(`Calculated ${result.subjects_calculated} subjects successfully!`, 'success');
      setStep(2);
    } catch (error) {
      showAlert('Failed to calculate subjects: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCalculateTerm = async () => {
    if (!selectedTerm || !selectedClass) {
      showAlert('Please select term and class', 'error');
      return;
    }

    try {
      setProcessing(true);
      const result = await processResultsService.calculateTerm(
        parseInt(selectedTerm),
        parseInt(selectedClass)
      );
      
      setTermResults(result);
      showAlert(`Calculated term results for ${result.students_processed} students!`, 'success');
      setStep(3);
    } catch (error) {
      showAlert('Failed to calculate term results: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (window.confirm('Publishing results will lock scores from further editing. Continue?')) {
      try {
        setProcessing(true);
        const result = await processResultsService.publishResults(
          parseInt(selectedTerm),
          parseInt(selectedClass)
        );
        showAlert(`Results published successfully! ${result.published_count} students processed.`, 'success');
      } catch (error) {
        showAlert('Failed to publish: ' + error.message, 'error');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setStep(1);
    setSubjectResults(null);
    setTermResults(null);
  };

  const getTermName = () => {
    const term = terms.find(t => t.id.toString() === selectedTerm);
    return term ? term.name : 'Selected Term';
  };

  const getClassName = () => {
    const classItem = classes.find(c => c.id.toString() === selectedClass);
    return classItem ? classItem.name : 'Selected Class';
  };

  const subjectPercentage = subjectResults 
    ? (subjectResults.subjects_calculated / subjectResults.total_subjects) * 100 
    : 0;

  const studentPercentage = termResults 
    ? (termResults.students_processed / termResults.total_students) * 100 
    : 0;

  return (
    <div className="process-results-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alert.message}
          </span>
          <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
            <X size={18} />
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
            <Calculator size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Process Results
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Calculate subject and term results from raw scores</p>
        </div>
        {step > 1 && (
          <button className="button button-secondary" onClick={handleReset} disabled={processing}>
            <RefreshCw size={16} /> Start Over
          </button>
        )}
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Step Indicators */}
      <div className="step-indicators">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Parameters</div>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Calculate Subjects</div>
        </div>
        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Calculate Term</div>
        </div>
      </div>

      {/* Step 1: Selection */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Step 1: Select Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label>Academic Year</label>
              <select 
                className="form-select" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={processing}
              >
                {years.map(year => (
                  <option key={year.id} value={year.id}>{year.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Term</label>
              <select 
                className="form-select" 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)}
                disabled={processing}
              >
                {terms.map(term => (
                  <option key={term.id} value={term.id}>{term.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Class</label>
              <select 
                className="form-select" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={processing}
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Subject (Optional - Leave blank for all)</label>
              <select 
                className="form-select" 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={processing}
              >
                <option value="">All Subjects</option>
                {subjects.map(subj => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="button" 
              onClick={handleCalculateSubjects} 
              disabled={processing || !selectedTerm || !selectedClass}
            >
              {processing ? <Loader size={16} className="spinner" /> : <Calculator size={16} />}
              Calculate Subject Results
            </button>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {processing && (
        <div className="status-panel">
          <div className="progress-bar">
            <div className="progress-fill indeterminate"></div>
          </div>
          <p><Loader size={16} className="spinner" /> Processing results... Please wait</p>
        </div>
      )}

      {/* Subject Results Status */}
      {subjectResults && step >= 2 && (
        <div className="status-panel">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} className="text-success" />
            Subject Results Calculation Complete
          </h3>
          
          <div className="status-grid">
            <div className="status-item">
              <span>Subjects calculated:</span>
              <strong>{subjectResults.subjects_calculated}/{subjectResults.total_subjects}</strong>
            </div>
            <div className="status-item">
              <span>Students processed:</span>
              <strong>{subjectResults.students_processed}</strong>
            </div>
            {subjectResults.errors && subjectResults.errors.length > 0 && (
              <div className="status-item">
                <span>Errors found:</span>
                <strong className="text-danger">{subjectResults.errors.length}</strong>
              </div>
            )}
          </div>
          
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${subjectPercentage}%` }}></div>
          </div>
          <div className="progress-label">{Math.round(subjectPercentage)}% Complete</div>
          
          {step === 2 && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button" onClick={handleCalculateTerm} disabled={processing}>
                <TrendingUp size={16} /> Continue to Term Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Term Results Status */}
      {termResults && step >= 3 && (
        <div className="status-panel">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} className="text-success" />
            Term Results Calculation Complete
          </h3>
          
          <div className="status-grid">
            <div className="status-item">
              <span>Students processed:</span>
              <strong>{termResults.students_processed}/{termResults.total_students}</strong>
            </div>
            {termResults.errors && termResults.errors.length > 0 && (
              <div className="status-item">
                <span>Errors found:</span>
                <strong className="text-danger">{termResults.errors.length}</strong>
              </div>
            )}
          </div>
          
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${studentPercentage}%` }}></div>
          </div>
          <div className="progress-label">{Math.round(studentPercentage)}% Complete</div>
          
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="button" onClick={handlePublish} disabled={processing}>
              <Lock size={16} /> Publish Results
            </button>
          </div>
        </div>
      )}

      {/* Summary Info */}
      <div className="info-panel">
        <h4>About Result Processing</h4>
        <ul>
          <li><strong>Subject Results:</strong> Calculates weighted scores from all assessments to determine final grade per subject</li>
          <li><strong>Term Results:</strong> Aggregates all subject results to calculate overall term performance</li>
          <li><strong>Publishing:</strong> Locks results and makes them available to parents/students via portal</li>
          <li><strong>Grade Boundaries:</strong> Uses configured grade boundaries to determine letter grades and GPAs</li>
        </ul>
      </div>
    </div>
  );
}

export default ProcessResults;