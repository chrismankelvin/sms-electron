// src/components/Academics/SubjectResults.jsx

import { useState, useEffect } from 'react';
import { BookOpen, Download, Printer, Search, Filter, X, Trophy, Award, Loader, RefreshCw } from 'lucide-react';
import '../../../styles/subject-results.css';

const API_BASE_URL = 'http://localhost:8000/api';

const subjectResultsService = {
  async getResults(termId, classId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/subject-results/?term_id=${termId}&class_id=${classId}&subject_id=${subjectId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getFilterOptions() {
    const response = await fetch(`${API_BASE_URL}/subject-results/options`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async exportToExcel(termId, classId, subjectId) {
    const response = await fetch(`${API_BASE_URL}/subject-results/export/excel?term_id=${termId}&class_id=${classId}&subject_id=${subjectId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

function SubjectResults() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load results when filters change
  useEffect(() => {
    if (selectedTerm && selectedClass && selectedSubject) {
      loadResults();
    }
  }, [selectedTerm, selectedClass, selectedSubject]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const data = await subjectResultsService.getFilterOptions();
      setTerms(data.terms);
      setClasses(data.classes);
      setSubjects(data.subjects);
      
      // Set default selections if available
      if (data.terms.length > 0) setSelectedTerm(data.terms[0].id.toString());
      if (data.classes.length > 0) setSelectedClass(data.classes[0].id.toString());
      if (data.subjects.length > 0) setSelectedSubject(data.subjects[0].id.toString());
    } catch (error) {
      showAlert('Failed to load filter options: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await subjectResultsService.getResults(
        parseInt(selectedTerm),
        parseInt(selectedClass),
        parseInt(selectedSubject)
      );
      setResults(data.results);
      setSummary(data.summary);
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
      const data = await subjectResultsService.exportToExcel(
        parseInt(selectedTerm),
        parseInt(selectedClass),
        parseInt(selectedSubject)
      );
      
      // Create CSV
      const csvRows = [
        ['Student Name', 'Student Number', 'Total Score', 'Grade', 'Grade Point', 'Position', 'Remark']
      ];
      
      data.forEach(student => {
        csvRows.push([
          student.student_name,
          student.student_number,
          student.total_score,
          student.grade,
          student.grade_point,
          student.position_in_class,
          student.remark
        ]);
      });
      
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subject_results_${selectedSubject}_${selectedClass}_${selectedTerm}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showAlert('Export successful!', 'success');
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
      'A': 'grade-a',
      'B+': 'grade-b-plus',
      'B': 'grade-b',
      'C+': 'grade-c-plus',
      'C': 'grade-c',
      'D+': 'grade-d-plus',
      'D': 'grade-d',
      'E': 'grade-e',
      'F': 'grade-f'
    };
    return gradeMap[grade] || 'grade-default';
  };

  if (loading && results.length === 0) {
    return (
      <div className="subject-results-container">
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-results-container">
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert-${alert.type}`}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <Trophy size={18} /> : <AlertCircle size={18} />}
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
            <BookOpen size={28} style={{ display: 'inline', marginRight: '12px' }} />
            Subject Results
          </h1>
          <p style={{ color: 'var(--secondary)' }}>View subject-level results per student</p>
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

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="filter-group">
          <label>Academic Term</label>
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
        
        <div className="filter-group">
          <label>Subject</label>
          <select 
            className="form-select" 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Subject</option>
            {subjects.map(subj => (
              <option key={subj.id} value={subj.id}>{subj.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && results.length > 0 && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon"><Trophy size={24} /></div>
            <div className="summary-info">
              <div className="summary-value">{summary.total_students}</div>
              <div className="summary-label">Total Students</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"><Award size={24} /></div>
            <div className="summary-info">
              <div className="summary-value">{summary.average_score}%</div>
              <div className="summary-label">Average Score</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🏆</div>
            <div className="summary-info">
              <div className="summary-value">{summary.highest_score}%</div>
              <div className="summary-label">Highest Score</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-info">
              <div className="summary-value">{summary.lowest_score}%</div>
              <div className="summary-label">Lowest Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="table-container">
        {results.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>No results found for the selected filters</p>
          </div>
        ) : (
          <table className="academic-years-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student #</th>
                <th>Total Score</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Position in Class</th>
                <th>Position in Section</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr key={r.student_id} className={index < 3 ? 'top-performer' : ''}>
                  <td><strong>{r.student_name}</strong></td>
                  <td>{r.student_number}</td>
                  <td><span className="score-badge">{r.total_score}%</span></td>
                  <td>
                    <span className={`grade-badge ${getGradeBadgeClass(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td>{r.grade_point}</td>
                  <td>
                    {r.position_in_class === 1 && <span className="position-badge gold">🥇 {r.position_in_class}</span>}
                    {r.position_in_class === 2 && <span className="position-badge silver">🥈 {r.position_in_class}</span>}
                    {r.position_in_class === 3 && <span className="position-badge bronze">🥉 {r.position_in_class}</span>}
                    {r.position_in_class > 3 && <span className="position-badge">{r.position_in_class}</span>}
                  </td>
                  <td>{r.position_in_section || '-'}</td>
                  <td>{r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Add missing AlertCircle import
import { AlertCircle } from 'lucide-react';

export default SubjectResults;