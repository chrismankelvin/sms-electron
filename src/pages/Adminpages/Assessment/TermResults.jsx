// // src/components/Academics/TermResults.jsx

// import { useState, useEffect } from 'react';
// import { 
//   BarChart3, Download, Printer, Trophy, Users, CheckCircle, XCircle, 
//   Loader, RefreshCw, AlertCircle, X, Award, TrendingUp, TrendingDown 
// } from 'lucide-react';
// import '../../../styles/term-results.css';

// const API_BASE_URL = 'http://localhost:8000/api';

// const termResultsService = {
//   async getResults(termId, classId) {
//     const response = await fetch(`${API_BASE_URL}/term-results/?term_id=${termId}&class_id=${classId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async getOptions() {
//     const response = await fetch(`${API_BASE_URL}/term-results/options`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   },

//   async exportToExcel(termId, classId) {
//     const response = await fetch(`${API_BASE_URL}/term-results/export/excel?term_id=${termId}&class_id=${classId}`);
//     const data = await response.json();
//     if (!data.success) throw new Error(data.message);
//     return data.data;
//   }
// };

// function TermResults() {
//   const [results, setResults] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [termInfo, setTermInfo] = useState(null);
//   const [classInfo, setClassInfo] = useState(null);
//   const [selectedTerm, setSelectedTerm] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [exporting, setExporting] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

//   // Load filter options on mount
//   useEffect(() => {
//     loadOptions();
//   }, []);

//   // Load results when filters change
//   useEffect(() => {
//     if (selectedTerm && selectedClass) {
//       loadResults();
//     }
//   }, [selectedTerm, selectedClass]);

//   const loadOptions = async () => {
//     try {
//       setLoading(true);
//       const data = await termResultsService.getOptions();
//       setTerms(data.terms);
//       setClasses(data.classes);
      
//       // Set default selections
//       if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
//       if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
//     } catch (error) {
//       showAlert('Failed to load options: ' + error.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadResults = async () => {
//     try {
//       setLoading(true);
//       const data = await termResultsService.getResults(
//         parseInt(selectedTerm),
//         parseInt(selectedClass)
//       );
//       setResults(data.results);
//       setSummary(data.summary);
//       setTermInfo(data.term);
//       setClassInfo(data.class);
//     } catch (error) {
//       showAlert('Failed to load results: ' + error.message, 'error');
//       setResults([]);
//       setSummary(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showAlert = (message, type = 'success') => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: '', type: 'success' });
//     }, 3000);
//   };

//   const exportToExcel = async () => {
//     try {
//       setExporting(true);
//       const data = await termResultsService.exportToExcel(
//         parseInt(selectedTerm),
//         parseInt(selectedClass)
//       );
      
//       // Create CSV
//       if (data.length > 0) {
//         const headers = Object.keys(data[0]);
//         const csvRows = [headers.join(',')];
        
//         data.forEach(row => {
//           const values = headers.map(header => {
//             const value = row[header];
//             return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
//           });
//           csvRows.push(values.join(','));
//         });
        
//         const csvContent = csvRows.join('\n');
//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `term_results_${classInfo?.name}_${termInfo?.name}.csv`;
//         a.click();
//         URL.revokeObjectURL(url);
        
//         showAlert('Export successful!', 'success');
//       }
//     } catch (error) {
//       showAlert('Failed to export: ' + error.message, 'error');
//     } finally {
//       setExporting(false);
//     }
//   };

//   const exportToPDF = () => {
//     window.print();
//   };

//   const getGradeBadgeClass = (grade) => {
//     const gradeMap = {
//       'A': 'grade-a', 'A+': 'grade-a', 'A-': 'grade-a',
//       'B+': 'grade-b-plus', 'B': 'grade-b', 'B-': 'grade-b',
//       'C+': 'grade-c-plus', 'C': 'grade-c', 'C-': 'grade-c',
//       'D+': 'grade-d-plus', 'D': 'grade-d', 'D-': 'grade-d',
//       'E': 'grade-e', 'F': 'grade-f'
//     };
//     return gradeMap[grade] || 'grade-default';
//   };

//   if (loading && results.length === 0) {
//     return (
//       <div className="term-results-container">
//         <div className="loading-container">
//           <Loader size={48} className="spinner" />
//           <p>Loading term results...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="term-results-container">
//       {/* Alert Messages */}
//       {alert.show && (
//         <div className={`alert-${alert.type}`}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//             {alert.message}
//           </span>
//           <span className="close-alert" onClick={() => setAlert({ show: false, message: '', type: 'success' })}>
//             <X size={18} />
//           </span>
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
//         <div>
//           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
//             <BarChart3 size={28} style={{ display: 'inline', marginRight: '12px' }} />
//             Term Results
//           </h1>
//           <p style={{ color: 'var(--secondary)' }}>View term-level aggregated results per student</p>
//         </div>
//         <div style={{ display: 'flex', gap: '0.5rem' }}>
//           <button className="button button-secondary" onClick={exportToExcel} disabled={exporting || results.length === 0}>
//             {exporting ? <Loader size={16} className="spinner" /> : <Download size={16} />}
//             Excel
//           </button>
//           <button className="button button-secondary" onClick={exportToPDF} disabled={results.length === 0}>
//             <Printer size={16} /> PDF
//           </button>
//           <button className="button button-secondary" onClick={loadResults} disabled={loading}>
//             <RefreshCw size={16} className={loading ? 'spinner' : ''} />
//             Refresh
//           </button>
//         </div>
//       </div>
//       <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

//       {/* Summary Statistics Cards */}
//       {summary && (
//         <div className="stats-cards">
//           <div className="stat-card">
//             <div className="stat-icon"><Users size={24} /></div>
//             <div className="stat-info">
//               <div className="stat-value">{summary.total_students}</div>
//               <div className="stat-label">Total Students</div>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon"><Trophy size={24} /></div>
//             <div className="stat-info">
//               <div className="stat-value">{summary.class_average}%</div>
//               <div className="stat-label">Class Average</div>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon"><CheckCircle size={24} /></div>
//             <div className="stat-info">
//               <div className="stat-value">{summary.pass_rate}%</div>
//               <div className="stat-label">Pass Rate</div>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon"><TrendingUp size={24} /></div>
//             <div className="stat-info">
//               <div className="stat-value">{summary.highest_average}%</div>
//               <div className="stat-label">Highest Score</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="filter-bar">
//         <div className="filter-group">
//           <label>Term</label>
//           <select 
//             className="form-select" 
//             value={selectedTerm} 
//             onChange={(e) => setSelectedTerm(e.target.value)}
//             disabled={loading}
//           >
//             <option value="">Select Term</option>
//             {terms.map(term => (
//               <option key={term.id} value={term.id}>{term.name}</option>
//             ))}
//           </select>
//         </div>
        
//         <div className="filter-group">
//           <label>Class</label>
//           <select 
//             className="form-select" 
//             value={selectedClass} 
//             onChange={(e) => setSelectedClass(e.target.value)}
//             disabled={loading}
//           >
//             <option value="">Select Class</option>
//             {classes.map(cls => (
//               <option key={cls.id} value={cls.id}>{cls.name}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Results Table */}
//       <div className="table-container">
//         {results.length === 0 ? (
//           <div className="empty-state">
//             <BarChart3 size={48} />
//             <p>No term results found for the selected filters</p>
//             <p className="text-muted">Please process results first using the Process Results page</p>
//           </div>
//         ) : (
//           <table className="academic-years-table">
//             <thead>
//               <tr>
//                 <th>Position</th>
//                 <th>Student</th>
//                 <th>Average Score</th>
//                 <th>Overall Grade</th>
//                 <th>Grade Point</th>
//                 <th>Total Marks</th>
//                 <th>Subjects Passed</th>
//                 <th>Subjects Failed</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((r, index) => (
//                 <tr key={r.student_id} className={index < 3 ? 'top-performer' : ''}>
//                   <td>
//                     {r.position_in_class === 1 && <span className="position-badge gold">🥇 1st</span>}
//                     {r.position_in_class === 2 && <span className="position-badge silver">🥈 2nd</span>}
//                     {r.position_in_class === 3 && <span className="position-badge bronze">🥉 3rd</span>}
//                     {r.position_in_class > 3 && <span className="position-badge">{r.position_in_class}th</span>}
//                   </td>
//                   <td><strong>{r.student_name}</strong></td>
//                   <td>
//                     <span className="score-badge">{r.average_score}%</span>
//                     {r.average_score >= 70 && <TrendingUp size={14} className="trend-up" />}
//                     {r.average_score < 50 && <TrendingDown size={14} className="trend-down" />}
//                   </td>
//                   <td>
//                     <span className={`grade-badge ${getGradeBadgeClass(r.overall_grade)}`}>
//                       {r.overall_grade}
//                     </span>
//                   </td>
//                   <td>{r.overall_grade_point}</td>
//                   <td>{r.total_marks}</td>
//                   <td>
//                     <span className="text-success">{r.total_subjects_passed}</span> / {r.total_subjects_passed + r.total_subjects_failed}
//                   </td>
//                   <td>
//                     {r.total_subjects_failed > 0 ? (
//                       <span className="text-danger">{r.total_subjects_failed}</span>
//                     ) : (
//                       <span className="text-success">✓</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Status Info */}
//       {results.length > 0 && results[0].published_at && (
//         <div className="info-panel">
//           <div className="info-content">
//             <CheckCircle size={16} className="text-success" />
//             <span>Results published on {new Date(results[0].published_at).toLocaleDateString()}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default TermResults;









// src/components/Academics/TermResults.jsx

import { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Printer, Trophy, Users, CheckCircle, XCircle, BookOpen ,
  Loader, RefreshCw, AlertCircle, X, Award, TrendingUp, TrendingDown 
} from 'lucide-react';
import '../../../styles/term-results.css';

const API_BASE_URL = 'http://localhost:8000/api';

const termResultsService = {
  async getResults(termId, classId) {
    const response = await fetch(`${API_BASE_URL}/term-results/?term_id=${termId}&class_id=${classId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getOptions(classId = null) {
    let url = `${API_BASE_URL}/term-results/options`;
    if (classId) {
      url += `?class_id=${classId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async exportToExcel(termId, classId) {
    const response = await fetch(`${API_BASE_URL}/term-results/export/excel?term_id=${termId}&class_id=${classId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function TermResults() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [termInfo, setTermInfo] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classSubjectsCount, setClassSubjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load filter options on mount
  useEffect(() => {
    loadOptions();
  }, []);

  // Load results when filters change
  useEffect(() => {
    if (selectedTerm && selectedClass) {
      loadResults();
    }
  }, [selectedTerm, selectedClass]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await termResultsService.getOptions();
      setTerms(data.terms);
      setClasses(data.classes);
      
      // Set default selections
      if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
      if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
    } catch (error) {
      showAlert('Failed to load options: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await termResultsService.getResults(
        parseInt(selectedTerm),
        parseInt(selectedClass)
      );
      setResults(data.results);
      setSummary(data.summary);
      setTermInfo(data.term);
      setClassInfo(data.class);
      setClassSubjectsCount(data.class_subjects_count || 0);
    } catch (error) {
      showAlert('Failed to load results: ' + error.message, 'error');
      setResults([]);
      setSummary(null);
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

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const data = await termResultsService.exportToExcel(
        parseInt(selectedTerm),
        parseInt(selectedClass)
      );
      
      // Create CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          });
          csvRows.push(values.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `term_results_${classInfo?.name}_${termInfo?.name}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        showAlert('Export successful!', 'success');
      }
    } catch (error) {
      showAlert('Failed to export: ' + error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const getGradeBadgeClass = (grade) => {
    const gradeMap = {
      'A': 'grade-a', 'A+': 'grade-a', 'A-': 'grade-a',
      'B+': 'grade-b-plus', 'B': 'grade-b', 'B-': 'grade-b',
      'C+': 'grade-c-plus', 'C': 'grade-c', 'C-': 'grade-c',
      'D+': 'grade-d-plus', 'D': 'grade-d', 'D-': 'grade-d',
      'E': 'grade-e', 'F': 'grade-f'
    };
    return gradeMap[grade] || 'grade-default';
  };

  if (loading && results.length === 0) {
    return (
      <div className="term-results-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading term results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="term-results-container">
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
            <BarChart3 size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Term Results
          </h1>
          <p style={{ color: 'var(--secondary)' }}>View term-level aggregated results per student</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="button button-secondary" onClick={exportToExcel} disabled={exporting || results.length === 0}>
            {exporting ? <Loader size={16} className="spinner" /> : <Download size={16} />}
            Excel
          </button>
          <button className="button button-secondary" onClick={exportToPDF} disabled={results.length === 0}>
            <Printer size={16} /> PDF
          </button>
          <button className="button button-secondary" onClick={loadResults} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
        </div>
      </div>
      <hr style={{ margin: '0 0 1.5rem 0', borderColor: 'var(--border)' }} />

      {/* Summary Statistics Cards */}
      {summary && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{summary.total_students}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Trophy size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{summary.class_average}%</div>
              <div className="stat-label">Class Average</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{summary.pass_rate}%</div>
              <div className="stat-label">Pass Rate</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{summary.highest_average}%</div>
              <div className="stat-label">Highest Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Term</label>
          <select 
            className="form-select" 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Term</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Class</label>
          <select 
            className="form-select" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Subjects Info */}
      {classInfo && classSubjectsCount > 0 && (
        <div className="class-info-card">
          <div className="class-info-header">
            <BookOpen size={16} />
            <span>{classInfo.name} - {classSubjectsCount} subjects assigned</span>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="table-container">
        {results.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={48} />
            <p>No term results found for the selected filters</p>
            <p className="text-muted">Please process results first using the Process Results page</p>
          </div>
        ) : (
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Student</th>
                <th>Average Score</th>
                <th>Overall Grade</th>
                <th>Grade Point</th>
                <th>Total Marks</th>
                <th>Subjects Passed</th>
                <th>Subjects Failed</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr key={r.student_id} className={index < 3 ? 'top-performer' : ''}>
                  <td>
                    {r.position_in_class === 1 && <span className="position-badge gold">🥇 1st</span>}
                    {r.position_in_class === 2 && <span className="position-badge silver">🥈 2nd</span>}
                    {r.position_in_class === 3 && <span className="position-badge bronze">🥉 3rd</span>}
                    {r.position_in_class > 3 && <span className="position-badge">{r.position_in_class}th</span>}
                  </td>
                  <td><strong>{r.student_name}</strong></td>
                  <td>
                    <span className="score-badge">{r.average_score}%</span>
                    {r.average_score >= 70 && <TrendingUp size={14} className="trend-up" />}
                    {r.average_score < 50 && <TrendingDown size={14} className="trend-down" />}
                  </td>
                  <td>
                    <span className={`grade-badge ${getGradeBadgeClass(r.overall_grade)}`}>
                      {r.overall_grade}
                    </span>
                  </td>
                  <td>{r.overall_grade_point}</td>
                  <td>{r.total_marks}</td>
                  <td>
                    <span className="text-success">{r.total_subjects_passed}</span> / {r.total_subjects_passed + r.total_subjects_failed}
                  </td>
                  <td>
                    {r.total_subjects_failed > 0 ? (
                      <span className="text-danger">{r.total_subjects_failed}</span>
                    ) : (
                      <span className="text-success">✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Info */}
      {results.length > 0 && results[0].published_at && (
        <div className="info-panel">
          <div className="info-content">
            <CheckCircle size={16} className="text-success" />
            <span>Results published on {new Date(results[0].published_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TermResults;