// import { useState } from 'react';
// import { Users, ArrowRight, Calculator, CheckCircle, XCircle, AlertCircle, Download, Save, X } from 'lucide-react';
// import '../../../styles/batch-promotion.css';

// function BatchPromotion() {
//   const [step, setStep] = useState(1);
//   const [fromYear, setFromYear] = useState('2023-2024');
//   const [fromClass, setFromClass] = useState('');
//   const [toYear, setToYear] = useState('2024-2025');
//   const [toClass, setToClass] = useState('');
//   const [students, setStudents] = useState([]);
//   const [overrides, setOverrides] = useState({});

//   const years = ['2022-2023', '2023-2024', '2024-2025'];
//   const classes = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B'];

//   const studentData = [
//     { id: 1, name: 'John Doe', currentLevel: 'JHS 1A', averageScore: 78, failedSubjects: 0, status: 'Promoted' },
//     { id: 2, name: 'Jane Smith', currentLevel: 'JHS 1A', averageScore: 45, failedSubjects: 3, status: 'Repeat' },
//     { id: 3, name: 'Bob Johnson', currentLevel: 'JHS 1A', averageScore: 62, failedSubjects: 2, status: 'Promoted' }
//   ];

//   const handlePreview = () => {
//     if (!fromClass || !toClass) { alert('Please select both from and to classes'); return; }
//     setStudents(studentData);
//     setStep(2);
//   };

//   const handleApplyRules = () => {
//     const updated = students.map(s => ({ ...s, status: overrides[s.id] ? (overrides[s.id] === 'promote' ? 'Promoted' : 'Repeat') : s.status }));
//     setStudents(updated);
//     alert('Rules applied successfully');
//   };

//   const handleOverride = (studentId, action) => {
//     setOverrides(prev => ({ ...prev, [studentId]: action }));
//     setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: action === 'promote' ? 'Promoted' : 'Repeat' } : s));
//   };

//   const handleExecutePromotion = () => {
//     if (window.confirm(`Promote ${students.filter(s => s.status === 'Promoted').length} students and repeat ${students.filter(s => s.status === 'Repeat').length} students?`)) {
//       alert('Promotion executed successfully!');
//       setStep(3);
//     }
//   };

//   const handleGeneratePDF = () => { alert('Generating promotion list PDF...'); };

//   return (
//     <div className="batch-promotion-container">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div><h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}><Users size={28} style={{ display: 'inline', marginRight: '12px' }} />Batch Promotion</h1>
//         <p style={{ color: 'var(--secondary)' }}>Promote entire class to next level</p></div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {step === 1 && (<div className="card"><h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Promotion Parameters</h3>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
//         <div><label>From Academic Year</label><select className="form-select" value={fromYear} onChange={(e) => setFromYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
//         <div><label>From Class</label><select className="form-select" value={fromClass} onChange={(e) => setFromClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
//         <div><label>To Academic Year</label><select className="form-select" value={toYear} onChange={(e) => setToYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
//         <div><label>To Class (Suggested)</label><select className="form-select" value={toClass} onChange={(e) => setToClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
//       </div>
//       <button className="button" onClick={handlePreview}>Preview Students</button></div>)}

//       {step === 2 && (<div><div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}><button className="button button-secondary" onClick={handleApplyRules}><Calculator size={16} /> Apply Rules</button>
//       <button className="button button-secondary" onClick={handleGeneratePDF}><Download size={16} /> Generate Promotion List PDF</button>
//       <button className="button" onClick={handleExecutePromotion}><Save size={16} /> Execute Promotion</button></div>

//       <div className="table-container"><table className="academic-years-table"><thead><tr><th>Student</th><th>Current Level</th><th>Average Score</th><th>Failed Subjects</th><th>Promotion Status</th><th>Override</th></tr></thead>
//       <tbody>{students.map(s => (<tr key={s.id} className={s.status === 'Promoted' ? 'preview-student-row promoted' : 'preview-student-row repeat'}><td><strong>{s.name}</strong></td>
//       <td>{s.currentLevel} → {toClass}</td>
//       <td>{s.averageScore}%</td><td className={s.failedSubjects > 0 ? 'text-danger' : 'text-success'}>{s.failedSubjects}</td>
//       <td><span className={`status-badge ${s.status === 'Promoted' ? 'status-active' : 'status-withdrawn'}`}>{s.status}</span></td>
//       <td><div className="action-buttons"><button className="action-btn set-current-btn" onClick={() => handleOverride(s.id, 'promote')}><CheckCircle size={16} /> Promote</button>
//       <button className="action-btn delete-btn" onClick={() => handleOverride(s.id, 'repeat')}><XCircle size={16} /> Repeat</button></div></td></tr>))}</tbody></table></div></div>)}

//       {step === 3 && (<div className="card" style={{ textAlign: 'center' }}><CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} /><h3>Promotion Complete!</h3><p>{students.filter(s => s.status === 'Promoted').length} students promoted to {toClass}</p>
//       <p>{students.filter(s => s.status === 'Repeat').length} students will repeat {fromClass}</p><button className="button" onClick={() => window.location.reload()}>Start New Promotion</button></div>)}
//     </div>
//   );
// }

// export default BatchPromotion;















// src/components/Academics/BatchPromotion.jsx

import { useState, useEffect } from 'react';
import { 
  Users, ArrowRight, Calculator, CheckCircle, XCircle, AlertCircle, 
  Download, Save, X, Loader, RefreshCw, TrendingUp, TrendingDown 
} from 'lucide-react';
import '../../../styles/batch-promotion.css';

const API_BASE_URL = 'http://localhost:8000/api';

const promotionService = {
  async getOptions() {
    const response = await fetch(`${API_BASE_URL}/batch-promotion/options`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async previewPromotion(fromAcademicYearId, fromClassId, toAcademicYearId, toClassId) {
    const response = await fetch(`${API_BASE_URL}/batch-promotion/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_academic_year_id: fromAcademicYearId,
        from_class_id: fromClassId,
        to_academic_year_id: toAcademicYearId,
        to_class_id: toClassId
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async executePromotion(fromAcademicYearId, fromClassId, toAcademicYearId, toClassId, students) {
    const response = await fetch(`${API_BASE_URL}/batch-promotion/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_academic_year_id: fromAcademicYearId,
        from_class_id: fromClassId,
        to_academic_year_id: toAcademicYearId,
        to_class_id: toClassId,
        students: students
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function BatchPromotion() {
  const [step, setStep] = useState(1);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fromYearId, setFromYearId] = useState('');
  const [fromClassId, setFromClassId] = useState('');
  const [toYearId, setToYearId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getOptions();
      setAcademicYears(data.academic_years);
      setClasses(data.classes);
      
      // Set default selections
      if (data.academic_years.length >= 2) {
        setFromYearId(data.academic_years[1].id.toString()); // Previous year
        setToYearId(data.academic_years[0].id.toString()); // Current year
      } else if (data.academic_years.length > 0) {
        setFromYearId(data.academic_years[0].id.toString());
        setToYearId(data.academic_years[0].id.toString());
      }
      
      if (data.classes.length > 0) {
        setFromClassId(data.classes[0].id.toString());
        // Suggest next class
        const nextClass = data.classes.find(c => c.level_id === (data.classes[0].level_id + 1));
        if (nextClass) {
          setToClassId(nextClass.id.toString());
        }
      }
    } catch (error) {
      showAlert('Failed to load options: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handlePreview = async () => {
    if (!fromYearId || !fromClassId || !toYearId || !toClassId) {
      showAlert('Please select all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const data = await promotionService.previewPromotion(
        parseInt(fromYearId),
        parseInt(fromClassId),
        parseInt(toYearId),
        parseInt(toClassId)
      );
      setPreviewData(data);
      setStudents(data.students);
      setStep(2);
    } catch (error) {
      showAlert('Failed to preview: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = (studentId, action) => {
    setStudents(prev => prev.map(s => 
      s.student_id === studentId 
        ? { ...s, status: action === 'promote' ? 'Promoted' : 'Repeat' }
        : s
    ));
  };

  const handleApplyRules = () => {
    // Reset to original preview status
    setStudents([...previewData.students]);
    showAlert('Rules applied successfully', 'success');
  };

  const handleExecutePromotion = async () => {
    const promotedCount = students.filter(s => s.status === 'Promoted').length;
    const repeatCount = students.filter(s => s.status === 'Repeat').length;
    
    if (window.confirm(`Promote ${promotedCount} students and repeat ${repeatCount} students? This action cannot be undone.`)) {
      try {
        setExecuting(true);
        
        const studentsData = students.map(s => ({
          student_id: s.student_id,
          status: s.status
        }));
        
        const result = await promotionService.executePromotion(
          parseInt(fromYearId),
          parseInt(fromClassId),
          parseInt(toYearId),
          parseInt(toClassId),
          studentsData
        );
        
        showAlert(`Promotion completed! ${result.promoted_count} promoted, ${result.repeat_count} repeated`, 'success');
        setStep(3);
      } catch (error) {
        showAlert('Failed to execute promotion: ' + error.message, 'error');
      } finally {
        setExecuting(false);
      }
    }
  };

  const handleGeneratePDF = () => {
    // In a real implementation, this would generate a PDF
    showAlert('Generating promotion list PDF...', 'success');
  };

  const handleReset = () => {
    setStep(1);
    setPreviewData(null);
    setStudents([]);
  };

  const getStatusColor = (status) => {
    return status === 'Promoted' ? 'status-active' : 'status-withdrawn';
  };

  if (loading && step === 1) {
    return (
      <div className="batch-promotion-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-promotion-container">
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
            <Users size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Batch Promotion
          </h1>
          <p style={{ color: 'var(--secondary)' }}>Promote entire class to next level</p>
        </div>
        {step > 1 && (
          <button className="button button-secondary" onClick={handleReset} disabled={executing}>
            <RefreshCw size={16} /> Start Over
          </button>
        )}
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Step 1: Selection */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Select Promotion Parameters</h3>
          <div className="promotion-form">
            <div className="form-group">
              <label>From Academic Year</label>
              <select 
                className="form-select" 
                value={fromYearId} 
                onChange={(e) => setFromYearId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Year</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>From Class</label>
              <select 
                className="form-select" 
                value={fromClassId} 
                onChange={(e) => setFromClassId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div className="arrow-icon">
              <ArrowRight size={24} />
            </div>
            
            <div className="form-group">
              <label>To Academic Year</label>
              <select 
                className="form-select" 
                value={toYearId} 
                onChange={(e) => setToYearId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Year</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id}>{year.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>To Class (Suggested)</label>
              <select 
                className="form-select" 
                value={toClassId} 
                onChange={(e) => setToClassId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            className="button" 
            onClick={handlePreview} 
            disabled={loading || !fromYearId || !fromClassId || !toYearId || !toClassId}
          >
            {loading ? <Loader size={16} className="spinner" /> : <Users size={16} />}
            Preview Students
          </button>
        </div>
      )}

      {/* Step 2: Preview & Execute */}
      {step === 2 && previewData && (
        <div>
          {/* Summary Cards */}
          <div className="promotion-summary">
            <div className="summary-card">
              <div className="summary-icon"><Users size={24} /></div>
              <div className="summary-info">
                <div className="summary-value">{previewData.summary.total_students}</div>
                <div className="summary-label">Total Students</div>
              </div>
            </div>
            <div className="summary-card promoted">
              <div className="summary-icon"><TrendingUp size={24} /></div>
              <div className="summary-info">
                <div className="summary-value">{previewData.summary.promoted_count}</div>
                <div className="summary-label">Will be Promoted</div>
              </div>
            </div>
            <div className="summary-card repeat">
              <div className="summary-icon"><TrendingDown size={24} /></div>
              <div className="summary-info">
                <div className="summary-value">{previewData.summary.repeat_count}</div>
                <div className="summary-label">Will Repeat</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-bar">
            <button className="button button-secondary" onClick={handleApplyRules} disabled={executing}>
              <Calculator size={16} /> Apply Promotion Rules
            </button>
            <button className="button button-secondary" onClick={handleGeneratePDF} disabled={executing}>
              <Download size={16} /> Generate Promotion List
            </button>
            <button className="button" onClick={handleExecutePromotion} disabled={executing}>
              {executing ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              Execute Promotion
            </button>
          </div>

          {/* Students Table */}
          <div className="table-container">
            <table className="academic-years-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student Number</th>
                  <th>Average Score</th>
                  <th>Failed Subjects</th>
                  <th>Promotion Status</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.student_id} className={student.status === 'Promoted' ? 'preview-student-row promoted' : 'preview-student-row repeat'}>
                    <td><strong>{student.student_name}</strong></td>
                    <td>{student.student_number}</td>
                    <td className={student.average_score >= 50 ? 'text-success' : 'text-danger'}>
                      {student.average_score.toFixed(1)}%
                    </td>
                    <td className={student.failed_subjects > 0 ? 'text-danger' : 'text-success'}>
                      {student.failed_subjects}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn set-current-btn" 
                        onClick={() => handleOverride(student.student_id, 'promote')}
                        disabled={executing}
                        title="Override to Promote"
                      >
                        <CheckCircle size={16} /> Promote
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleOverride(student.student_id, 'repeat')}
                        disabled={executing}
                        title="Override to Repeat"
                      >
                        <XCircle size={16} /> Repeat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Note */}
          <div className="info-note">
            <AlertCircle size={16} />
            <span>Students with average score ≥ 50% and ≤ 2 failed subjects are automatically promoted. You can override individual decisions above.</span>
          </div>
        </div>
      )}

      {/* Step 3: Completion */}
      {step === 3 && previewData && (
        <div className="completion-card">
          <div className="completion-icon">
            <CheckCircle size={64} color="#10b981" />
          </div>
          <h2>Promotion Complete!</h2>
          <div className="completion-stats">
            <div className="completion-stat">
              <span className="stat-label">Promoted:</span>
              <span className="stat-value promoted">{students.filter(s => s.status === 'Promoted').length}</span>
              <span className="stat-detail">to {previewData.to_class.name}</span>
            </div>
            <div className="completion-stat">
              <span className="stat-label">Repeating:</span>
              <span className="stat-value repeat">{students.filter(s => s.status === 'Repeat').length}</span>
              <span className="stat-detail">will repeat {previewData.from_class.name}</span>
            </div>
          </div>
          <p className="completion-message">
            Student records have been updated with new academic year and class assignments.
          </p>
          <button className="button" onClick={handleReset}>
            Start New Promotion
          </button>
        </div>
      )}
    </div>
  );
}

export default BatchPromotion;